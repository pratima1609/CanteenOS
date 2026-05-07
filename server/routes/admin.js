const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { dbAsync } = require('../database/db');

router.use(authenticateToken);
router.use(authorizeRoles('admin'));

// STALLS
router.get('/stalls', async (req, res) => {
  try {
    const stalls = await dbAsync.all(`
      SELECT sp.*, u.email, u.name as owner_name 
      FROM stall_profiles sp
      JOIN users u ON sp.user_id = u.id
    `);
    res.json(stalls);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching stalls' });
  }
});

router.put('/stalls/:id/approve', async (req, res) => {
  try {
    await dbAsync.run(
      "UPDATE stall_profiles SET approval_status = 'approved', approved_at = CURRENT_TIMESTAMP WHERE id = ?",
      [req.params.id]
    );
    res.json({ message: 'Stall approved' });
  } catch (err) {
    res.status(500).json({ message: 'Error approving stall' });
  }
});

router.put('/stalls/:id/reject', async (req, res) => {
  try {
    await dbAsync.run(
      "UPDATE stall_profiles SET approval_status = 'rejected' WHERE id = ?",
      [req.params.id]
    );
    res.json({ message: 'Stall rejected' });
  } catch (err) {
    res.status(500).json({ message: 'Error rejecting stall' });
  }
});

router.put('/stalls/:id/suspend', async (req, res) => {
  try {
    await dbAsync.run(
      "UPDATE stall_profiles SET approval_status = 'pending' WHERE id = ?", // Pending acts like suspended
      [req.params.id]
    );
    res.json({ message: 'Stall suspended' });
  } catch (err) {
    res.status(500).json({ message: 'Error suspending stall' });
  }
});

// CATEGORIES
router.get('/categories', async (req, res) => {
  try {
    const categories = await dbAsync.all('SELECT * FROM categories');
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching categories' });
  }
});

router.post('/categories', async (req, res) => {
  try {
    const { name } = req.body;
    const result = await dbAsync.run('INSERT INTO categories (name) VALUES (?)', [name]);
    res.json({ id: result.id, name });
  } catch (err) {
    res.status(500).json({ message: 'Error creating category' });
  }
});

// ANALYTICS (Placeholder for Phase 5)
router.get('/analytics', async (req, res) => {
  try {
    const [{ totalGmv }] = await dbAsync.all("SELECT SUM(total_amount) as totalGmv FROM master_orders WHERE status != 'cancelled'");
    const totalOrders = await dbAsync.all("SELECT COUNT(*) as count FROM master_orders");
    
    res.json({ totalGmv: totalGmv || 0, totalOrders: totalOrders[0].count });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching analytics' });
  }
});

module.exports = router;
