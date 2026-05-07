const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { dbAsync } = require('../database/db');

router.use(authenticateToken);

// CHECKOUT (STUDENT ONLY)
router.post('/checkout', authorizeRoles('student'), async (req, res) => {
  try {
    await dbAsync.beginTransaction();

    // 1. Fetch cart items
    const cartItems = await dbAsync.all(`
      SELECT ci.*, m.price, m.name, m.is_available, sp.is_open, sp.id as stall_profile_id
      FROM cart_items ci
      JOIN menu_items m ON ci.menu_item_id = m.id
      JOIN stall_profiles sp ON ci.stall_id = sp.id
      WHERE ci.student_id = ?
    `, [req.user.id]);

    if (cartItems.length === 0) {
      await dbAsync.rollback();
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // 2. Validate availability
    for (let item of cartItems) {
      if (!item.is_open) {
        await dbAsync.rollback();
        return res.status(400).json({ message: `Stall for ${item.name} is now closed` });
      }
      if (!item.is_available) {
        await dbAsync.rollback();
        return res.status(400).json({ message: `${item.name} is sold out` });
      }
    }

    // 3. Group by stall
    const stallGroups = cartItems.reduce((acc, item) => {
      if (!acc[item.stall_id]) acc[item.stall_id] = [];
      acc[item.stall_id].push(item);
      return acc;
    }, {});

    // 4. Grand total
    const grandTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // 5. Create master order
    const orderRef = 'CNT-' + Date.now();
    const masterResult = await dbAsync.run(
      'INSERT INTO master_orders (student_id, order_ref, total_amount, status) VALUES (?, ?, ?, ?)',
      [req.user.id, orderRef, grandTotal, 'processing']
    );
    const masterId = masterResult.id;

    // 6. Sub-orders
    const subOrderRefs = [];
    for (const [stallId, items] of Object.entries(stallGroups)) {
      const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const token = require('uuid').v4().replace(/-/g, '').slice(0, 8).toUpperCase();
      
      const subResult = await dbAsync.run(
        'INSERT INTO sub_orders (master_order_id, stall_id, subtotal, pickup_token, status) VALUES (?, ?, ?, ?, ?)',
        [masterId, stallId, subtotal, token, 'received']
      );
      const subId = subResult.id;

      for (const item of items) {
        await dbAsync.run(
          'INSERT INTO sub_order_items (sub_order_id, menu_item_id, quantity, unit_price, item_name_snapshot) VALUES (?, ?, ?, ?, ?)',
          [subId, item.menu_item_id, item.quantity, item.price, item.name]
        );
      }
      
      subOrderRefs.push({ stallId, token, subId });
    }

    // 7. Clear cart
    await dbAsync.run('DELETE FROM cart_items WHERE student_id = ?', [req.user.id]);

    await dbAsync.commit();
    res.status(201).json({ orderRef, masterId, subOrders: subOrderRefs });
  } catch (err) {
    await dbAsync.rollback();
    console.error(err);
    res.status(500).json({ message: 'Checkout failed' });
  }
});

// STUDENT ORDER HISTORY
router.get('/', authorizeRoles('student'), async (req, res) => {
  try {
    const masterOrders = await dbAsync.all('SELECT * FROM master_orders WHERE student_id = ? ORDER BY created_at DESC', [req.user.id]);
    
    for (let mo of masterOrders) {
      mo.subOrders = await dbAsync.all(`
        SELECT so.*, sp.stall_name 
        FROM sub_orders so 
        JOIN stall_profiles sp ON so.stall_id = sp.id 
        WHERE so.master_order_id = ?
      `, [mo.id]);
    }
    
    res.json(masterOrders);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

router.get('/:id', authorizeRoles('student', 'admin'), async (req, res) => {
  try {
    const masterOrder = await dbAsync.get('SELECT * FROM master_orders WHERE id = ?', [req.params.id]);
    if (!masterOrder) return res.status(404).json({ message: 'Order not found' });
    
    // Auth check if student
    if (req.user.role === 'student' && masterOrder.student_id !== req.user.id) {
      return res.status(403).json({ message: 'Not your order' });
    }

    const subOrders = await dbAsync.all(`
      SELECT so.*, sp.stall_name 
      FROM sub_orders so 
      JOIN stall_profiles sp ON so.stall_id = sp.id 
      WHERE so.master_order_id = ?
    `, [req.params.id]);

    for (let so of subOrders) {
      so.items = await dbAsync.all('SELECT * FROM sub_order_items WHERE sub_order_id = ?', [so.id]);
    }
    
    masterOrder.subOrders = subOrders;
    res.json(masterOrder);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching order' });
  }
});

// QUEUE POSITION
router.get('/:id/queue/:stallId', authorizeRoles('student'), async (req, res) => {
  const { id, stallId } = req.params;
  try {
    const mySub = await dbAsync.get(`
      SELECT so.id, so.status, so.queue_number, so.pickup_token
      FROM sub_orders so
      JOIN master_orders mo ON so.master_order_id = mo.id
      WHERE mo.id = ? AND so.stall_id = ? AND mo.student_id = ?
    `, [id, stallId, req.user.id]);

    if (!mySub) return res.status(404).json({ message: 'Sub-order not found' });

    if (!mySub.queue_number) {
      return res.json({ status: mySub.status, queuePosition: null, estimatedWaitMinutes: null });
    }

    const [{ ahead }] = await dbAsync.all(`
      SELECT COUNT(*) AS ahead FROM sub_orders
      WHERE stall_id = ?
        AND status IN ('accepted', 'preparing')
        AND queue_number < ?
    `, [stallId, mySub.queue_number]);

    res.json({
      status: mySub.status,
      queuePosition: ahead + 1,
      pickupToken: mySub.pickup_token,
      estimatedWaitMinutes: (ahead + 1) * 5
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching queue position' });
  }
});

module.exports = router;
