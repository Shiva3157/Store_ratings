const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const db = require('../config/database');

// Get all stores
router.get('/', async (req, res) => {
  try {
    const { name, address } = req.query;
    
    let query = `
      SELECT s.*, 
        (SELECT AVG(rating) FROM ratings WHERE store_id = s.id) as averageRating,
        u.name as ownerName
      FROM stores s
      LEFT JOIN users u ON s.owner_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (name) {
      query += ' AND s.name LIKE ?';
      params.push(`%${name}%`);
    }
    if (address) {
      query += ' AND s.address LIKE ?';
      params.push(`%${address}%`);
    }

    const [stores] = await db.pool.query(query, params);
    res.json(stores);
  } catch (error) {
    console.error('Get stores error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get store by ID
router.get('/:id', async (req, res) => {
  try {
    const [stores] = await db.pool.query(
      `
      SELECT s.*, 
        (SELECT AVG(rating) FROM ratings WHERE store_id = s.id) as averageRating,
        u.name as ownerName
      FROM stores s
      LEFT JOIN users u ON s.owner_id = u.id
      WHERE s.id = ?
      `,
      [req.params.id]
    );

    if (stores.length === 0) {
      return res.status(404).json({ message: 'Store not found' });
    }

    res.json(stores[0]);
  } catch (error) {
    console.error('Get store error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create store (admin only)
router.post('/', authenticateToken, authorizeRoles('admin'), [
  body('name').notEmpty().withMessage('Store name required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('address').isLength({ max: 400 }).withMessage('Address max 400 characters'),
  body('ownerId').isInt().withMessage('Valid owner ID required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, address, ownerId } = req.body;

    // Check if store exists
    const [existing] = await db.pool.query(
      'SELECT id FROM stores WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    // Insert store
    const [result] = await db.pool.query(
      'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
      [name, email, address, ownerId]
    );

    res.status(201).json({
      id: result.insertId,
      name,
      email,
      address,
      ownerId
    });
  } catch (error) {
    console.error('Create store error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update store (admin only)
router.patch('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { name, email, address, ownerId } = req.body;
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
    if (ownerId) {
      updates.push('owner_id = ?');
      params.push(ownerId);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    params.push(req.params.id);

    await db.pool.query(
      `UPDATE stores SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    res.json({ message: 'Store updated successfully' });
  } catch (error) {
    console.error('Update store error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete store (admin only)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    await db.pool.query('DELETE FROM stores WHERE id = ?', [req.params.id]);
    res.json({ message: 'Store deleted successfully' });
  } catch (error) {
    console.error('Delete store error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
