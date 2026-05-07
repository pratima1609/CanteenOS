const express = require('express');
const router = express.Router();
const { dbAsync } = require('../database/db');

// PUBLIC BROWSE
router.get('/', async (req, res) => {
  try {
    const stalls = await dbAsync.all(`
      SELECT id, stall_name, description, is_open 
      FROM stall_profiles 
      WHERE approval_status = 'approved' AND is_open = 1
    `);
    res.json(stalls);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching stalls' });
  }
});

router.get('/:id/menu', async (req, res) => {
  try {
    const items = await dbAsync.all(`
      SELECT m.*, c.name as category_name
      FROM menu_items m
      JOIN categories c ON m.category_id = c.id
      WHERE m.stall_id = ? AND m.is_available = 1
    `, [req.params.id]);

    // Group by category
    const grouped = items.reduce((acc, item) => {
      if (!acc[item.category_name]) acc[item.category_name] = [];
      acc[item.category_name].push(item);
      return acc;
    }, {});

    res.json(grouped);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching menu' });
  }
});

// Simple slot generator for demo purposes
router.get('/:id/slots', async (req, res) => {
  try {
    const stall = await dbAsync.get('SELECT max_orders_per_slot FROM stall_profiles WHERE id = ?', [req.params.id]);
    if (!stall) return res.status(404).json({ message: 'Stall not found' });

    // Generate slots for the next 2 hours in 15 min increments
    const slots = [];
    const now = new Date();
    now.setMinutes(Math.ceil(now.getMinutes() / 15) * 15, 0, 0); // round up to next 15 min

    for (let i = 0; i < 8; i++) {
      const slotTime = new Date(now.getTime() + i * 15 * 60000);
      const timeString = slotTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      // In a real app, query pickup_slots table to check booked_count
      slots.push({ id: `slot-${i}`, time: timeString, available: true });
    }

    res.json(slots);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching slots' });
  }
});

module.exports = router;
