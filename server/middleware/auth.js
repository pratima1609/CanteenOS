const jwt = require('jsonwebtoken');
const { dbAsync } = require('../database/db');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Unauthorized role' });
    }
    next();
  };
};

const checkStallApproval = async (req, res, next) => {
  if (req.user.role !== 'stall_owner') return next();
  try {
    const profile = await dbAsync.get('SELECT approval_status FROM stall_profiles WHERE user_id = ?', [req.user.id]);
    if (!profile || profile.approval_status !== 'approved') {
      return res.status(403).json({ message: 'Stall not approved by admin yet' });
    }
    next();
  } catch (err) {
    res.status(500).json({ message: 'Database error checking stall approval' });
  }
};

module.exports = { authenticateToken, authorizeRoles, checkStallApproval };
