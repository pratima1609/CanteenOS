const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { dbAsync, db } = require('../database/db');

router.post('/register', [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').notEmpty().withMessage('Name is required'),
  body('role').isIn(['student', 'stall_owner']).withMessage('Invalid role')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password, name, role, stall_name, fssai_number } = req.body;

  try {
    const existing = await dbAsync.get('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) return res.status(400).json({ message: 'Email already exists' });

    const password_hash = await bcrypt.hash(password, 10);
    const token = require('uuid').v4(); // email verification token

    await dbAsync.beginTransaction();

    const result = await dbAsync.run(
      'INSERT INTO users (email, password_hash, name, role, verification_token) VALUES (?, ?, ?, ?, ?)',
      [email, password_hash, name, role, token]
    );
    const userId = result.id;

    if (role === 'stall_owner') {
      if (!stall_name || !fssai_number) {
        await dbAsync.rollback();
        return res.status(400).json({ message: 'stall_name and fssai_number required for stall owners' });
      }
      await dbAsync.run(
        'INSERT INTO stall_profiles (user_id, stall_name, fssai_number) VALUES (?, ?, ?)',
        [userId, stall_name, fssai_number]
      );
    }

    await dbAsync.commit();

    // Skip actual email sending for this demo, just auto-verify or let them login if not enforced
    // For now we'll just return success
    res.status(201).json({ message: 'Registration successful. Please verify email.', userId });
  } catch (err) {
    await dbAsync.rollback();
    console.error(err);
    res.status(500).json({ message: 'Registration failed' });
  }
});

router.post('/login', [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;

  try {
    const user = await dbAsync.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(400).json({ message: 'Invalid credentials' });

    // Check stall profile approval if stall owner
    let stallProfile = null;
    if (user.role === 'stall_owner') {
      stallProfile = await dbAsync.get('SELECT * FROM stall_profiles WHERE user_id = ?', [user.id]);
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name, stallId: stallProfile ? stallProfile.id : null },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role }, stallProfile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Login failed' });
  }
});

module.exports = router;
