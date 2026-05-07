const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { authenticateToken, authorizeRoles, checkStallApproval } = require('../middleware/auth');
const { dbAsync } = require('../database/db');

router.use(authenticateToken);
router.use(authorizeRoles('stall_owner'));
router.use(checkStallApproval);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads/')),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// CATEGORIES
router.get('/categories', async (req, res) => {
  try {
    const categories = await dbAsync.all('SELECT * FROM categories');
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching categories' });
  }
});

// MENU CRUD
router.get('/menu', async (req, res) => {
  try {
    const items = await dbAsync.all('SELECT * FROM menu_items WHERE stall_id = ?', [req.user.stallId]);
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching menu' });
  }
});

router.post('/menu', upload.single('image'), async (req, res) => {
  const { category_id, name, description, price, is_veg, is_available, prep_time_minutes } = req.body;
  const image_url = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const result = await dbAsync.run(
      `INSERT INTO menu_items (stall_id, category_id, name, description, price, is_veg, is_available, image_url, prep_time_minutes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.stallId, category_id, name, description, price, is_veg ? 1 : 0, is_available ? 1 : 0, image_url, prep_time_minutes]
    );
    res.json({ id: result.id, message: 'Item added' });
  } catch (err) {
    res.status(500).json({ message: 'Error adding item' });
  }
});

router.put('/menu/:id', upload.single('image'), async (req, res) => {
  const { category_id, name, description, price, is_veg, is_available, prep_time_minutes } = req.body;
  
  try {
    let sql = `UPDATE menu_items SET category_id=?, name=?, description=?, price=?, is_veg=?, is_available=?, prep_time_minutes=?`;
    const params = [category_id, name, description, price, is_veg ? 1 : 0, is_available ? 1 : 0, prep_time_minutes];

    if (req.file) {
      sql += `, image_url=?`;
      params.push(`/uploads/${req.file.filename}`);
    }
    
    sql += ` WHERE id=? AND stall_id=?`;
    params.push(req.params.id, req.user.stallId);

    await dbAsync.run(sql, params);
    res.json({ message: 'Item updated' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating item' });
  }
});

router.delete('/menu/:id', async (req, res) => {
  try {
    await dbAsync.run('DELETE FROM menu_items WHERE id=? AND stall_id=?', [req.params.id, req.user.stallId]);
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting item' });
  }
});

// STATUS
router.patch('/status', async (req, res) => {
  try {
    const { is_open } = req.body;
    await dbAsync.run('UPDATE stall_profiles SET is_open=? WHERE id=?', [is_open ? 1 : 0, req.user.stallId]);
    res.json({ message: `Stall is now ${is_open ? 'open' : 'closed'}` });
  } catch (err) {
    res.status(500).json({ message: 'Error updating status' });
  }
});

// SUB-ORDERS QUEUE
router.get('/sub-orders', async (req, res) => {
  try {
    const subOrders = await dbAsync.all(`
      SELECT so.*, mo.order_ref, u.name as student_name
      FROM sub_orders so
      JOIN master_orders mo ON so.master_order_id = mo.id
      JOIN users u ON mo.student_id = u.id
      WHERE so.stall_id = ? AND so.status NOT IN ('picked_up', 'rejected', 'cancelled')
      ORDER BY so.queue_number ASC
    `, [req.user.stallId]);
    
    // fetch items for each sub-order
    for (let so of subOrders) {
      so.items = await dbAsync.all('SELECT * FROM sub_order_items WHERE sub_order_id=?', [so.id]);
    }

    res.json(subOrders);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching queue' });
  }
});

router.patch('/sub-orders/:id/status', async (req, res) => {
  const { status } = req.body; // 'accepted', 'preparing', 'ready', 'rejected'
  try {
    const sub = await dbAsync.get('SELECT master_order_id FROM sub_orders WHERE id=? AND stall_id=?', [req.params.id, req.user.stallId]);
    if (!sub) return res.status(404).json({ message: 'Order not found' });

    // If accepting, assign a queue number
    if (status === 'accepted') {
      const [{ max_q }] = await dbAsync.all('SELECT MAX(queue_number) as max_q FROM sub_orders WHERE stall_id=?', [req.user.stallId]);
      const nextQ = (max_q || 0) + 1;
      await dbAsync.run('UPDATE sub_orders SET status=?, queue_number=? WHERE id=? AND stall_id=?', [status, nextQ, req.params.id, req.user.stallId]);
    } else {
      await dbAsync.run('UPDATE sub_orders SET status=? WHERE id=? AND stall_id=?', [status, req.params.id, req.user.stallId]);
    }

    if (['rejected', 'cancelled'].includes(status)) {
      const subStatusList = await dbAsync.all(`SELECT status FROM sub_orders WHERE master_order_id = ?`, [sub.master_order_id]);
      const allDone = subStatusList.every(s => ['picked_up', 'rejected', 'cancelled'].includes(s.status));
      const anyPickedUp = subStatusList.some(s => s.status === 'picked_up');
      if (allDone) {
        await dbAsync.run("UPDATE master_orders SET status = ? WHERE id = ?", [anyPickedUp ? 'complete' : 'cancelled', sub.master_order_id]);
      }
    }

    res.json({ message: `Status updated to ${status}` });
  } catch (err) {
    res.status(500).json({ message: 'Error updating sub-order status' });
  }
});

// PICKUP VERIFICATION
router.post('/pickup/verify', async (req, res) => {
  const { token } = req.body;
  try {
    const sub = await dbAsync.get(`SELECT * FROM sub_orders WHERE pickup_token = ?`, [token]);
    
    if (!sub) return res.status(404).json({ message: 'Invalid token' });
    if (sub.stall_id !== req.user.stallId) return res.status(403).json({ message: 'Not your stall' });
    if (sub.status !== 'ready') return res.status(400).json({ message: `Order is ${sub.status}, not ready` });

    await dbAsync.run(
      "UPDATE sub_orders SET status = 'picked_up', picked_up_at = CURRENT_TIMESTAMP WHERE id = ?",
      [sub.id]
    );

    // Check if master order is complete
    const subStatusList = await dbAsync.all(`SELECT status FROM sub_orders WHERE master_order_id = ?`, [sub.master_order_id]);
    const allDone = subStatusList.every(s => ['picked_up', 'rejected', 'cancelled'].includes(s.status));
    const anyPickedUp = subStatusList.some(s => s.status === 'picked_up');
    
    if (allDone) {
      await dbAsync.run("UPDATE master_orders SET status = ? WHERE id = ?", [anyPickedUp ? 'complete' : 'cancelled', sub.master_order_id]);
    }

    res.json({ message: 'Pickup confirmed', subOrderId: sub.id });
  } catch (err) {
    res.status(500).json({ message: 'Error verifying pickup' });
  }
});

// STALL ORDER HISTORY
router.get('/history', async (req, res) => {
  try {
    const subOrders = await dbAsync.all(`
      SELECT so.*, mo.order_ref, u.name as student_name
      FROM sub_orders so
      JOIN master_orders mo ON so.master_order_id = mo.id
      JOIN users u ON mo.student_id = u.id
      WHERE so.stall_id = ? AND so.status IN ('picked_up', 'rejected', 'cancelled')
      ORDER BY so.id DESC
      LIMIT 100
    `, [req.user.stallId]);

    for (let so of subOrders) {
      so.items = await dbAsync.all('SELECT * FROM sub_order_items WHERE sub_order_id=?', [so.id]);
    }

    res.json(subOrders);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching history' });
  }
});

module.exports = router;
