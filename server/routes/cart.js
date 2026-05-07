const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { dbAsync } = require('../database/db');

router.use(authenticateToken);
router.use(authorizeRoles('student'));

router.get('/', async (req, res) => {
  try {
    const cartItems = await dbAsync.all(`
      SELECT ci.id as cart_item_id, ci.quantity, m.*, sp.stall_name, sp.is_open 
      FROM cart_items ci
      JOIN menu_items m ON ci.menu_item_id = m.id
      JOIN stall_profiles sp ON ci.stall_id = sp.id
      WHERE ci.student_id = ?
    `, [req.user.id]);

    res.json(cartItems);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching cart' });
  }
});

router.post('/add', async (req, res) => {
  const { menu_item_id, quantity = 1 } = req.body;
  try {
    const item = await dbAsync.get(`
      SELECT m.stall_id, m.is_available, sp.is_open 
      FROM menu_items m
      JOIN stall_profiles sp ON m.stall_id = sp.id
      WHERE m.id = ?
    `, [menu_item_id]);

    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (!item.is_open) return res.status(400).json({ message: 'Stall is currently closed' });
    if (!item.is_available) return res.status(400).json({ message: 'Item is sold out' });

    // Check if item already in cart
    const existing = await dbAsync.get('SELECT * FROM cart_items WHERE student_id = ? AND menu_item_id = ?', [req.user.id, menu_item_id]);

    if (existing) {
      await dbAsync.run('UPDATE cart_items SET quantity = quantity + ? WHERE id = ?', [quantity, existing.id]);
    } else {
      await dbAsync.run(
        'INSERT INTO cart_items (student_id, menu_item_id, stall_id, quantity) VALUES (?, ?, ?, ?)',
        [req.user.id, menu_item_id, item.stall_id, quantity]
      );
    }
    
    res.json({ message: 'Item added to cart' });
  } catch (err) {
    res.status(500).json({ message: 'Error adding to cart' });
  }
});

router.put('/:id', async (req, res) => {
  const { quantity } = req.body;
  try {
    await dbAsync.run('UPDATE cart_items SET quantity = ? WHERE id = ? AND student_id = ?', [quantity, req.params.id, req.user.id]);
    res.json({ message: 'Cart updated' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating cart' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await dbAsync.run('DELETE FROM cart_items WHERE id = ? AND student_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Item removed from cart' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting item' });
  }
});

module.exports = router;
