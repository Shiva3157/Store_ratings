const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const db = require('../config/database');

// Get all users (admin only)
router.get('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { name, email, address, role } = req.query;
    
    let query = 'SELECT id, name, email, address, role, created_at FROM users WHERE 1=1';
    const params = [];

    if (name) {
      query += ' AND name LIKE ?';
      params.push(`%${name}%`);
    }
    if (email) {
      query += ' AND email LIKE ?';
      params.push(`%${email}%`);
    }
    if (address) {
      query += ' AND address LIKE ?';
      params.push(`%${address}%`);
    }
    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }

    const [users] = await db.pool.query(query, params);
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const [users] = await db.pool.query(
      'SELECT id, name, email, address, role FROM users WHERE id = ?',
      [req.params.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create user (admin only)
router.post('/', authenticateToken, authorizeRoles('admin'), [
  body('name').isLength({ min: 20, max: 60 }).withMessage('Name must be 20-60 characters'),
  body('email').isEmail().withMessage('Valid email required'),
  body('address').isLength({ max: 400 }).withMessage('Address max 400 characters'),
  body('password').isLength({ min: 8, max: 16 }).withMessage('Password 8-16 characters'),
  body('password').matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*])/).withMessage('Password must have uppercase and special char'),
  body('role').isIn(['admin', 'user', 'store_owner']).withMessage('Invalid role')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, address, password, role } = req.body;

    // Check if user exists
    const [existing] = await db.pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await db.pool.query(
      'INSERT INTO users (name, email, address, password, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, address, hashedPassword, role]
    );

    res.status(201).json({
      id: result.insertId,
      name,
      email,
      address,
      role
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user
router.patch('/:id', authenticateToken, async (req, res) => {
  try {
    const { name, email, address, password, role } = req.body;
    const updates = [];
    const params = [];

    if (name) {
      updates.push('name = ?');
      params.push(name);
    }
    if (email) {
      updates.push('email = ?');
      params.push(email);
    }
    if (address) {
      updates.push('address = ?');
      params.push(address);
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push('password = ?');
      params.push(hashedPassword);
    }
    if (role) {
      updates.push('role = ?');
      params.push(role);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    params.push(req.params.id);

    await db.pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user (admin only)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    await db.pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get dashboard stats (admin only)
router.get('/dashboard/stats', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const [userCount] = await db.pool.query('SELECT COUNT(*) as count FROM users');
    const [storeCount] = await db.pool.query('SELECT COUNT(*) as count FROM stores');
    const [ratingCount] = await db.pool.query('SELECT COUNT(*) as count FROM ratings');

    res.json({
      totalUsers: userCount[0].count,
      totalStores: storeCount[0].count,
      totalRatings: ratingCount[0].count
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
