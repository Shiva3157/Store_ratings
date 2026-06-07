const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const db = require('../config/database');

// Get all ratings
router.get('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const [ratings] = await db.pool.query(`
      SELECT r.*, 
        u.name as userName, 
        u.email as userEmail,
        s.name as storeName,
        s.address as storeAddress
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      JOIN stores s ON r.store_id = s.id
    `);
    res.json(ratings);
  } catch (error) {
    console.error('Get ratings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get ratings for a specific store
router.get('/store/:storeId', async (req, res) => {
  try {
    const [ratings] = await db.pool.query(`
      SELECT r.*, 
        u.name as userName, 
        u.email as userEmail
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.store_id = ?
    `, [req.params.storeId]);
    res.json(ratings);
  } catch (error) {
    console.error('Get store ratings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's rating for a specific store
router.get('/user/:userId/store/:storeId', authenticateToken, async (req, res) => {
  try {
    const [ratings] = await db.pool.query(
      'SELECT * FROM ratings WHERE user_id = ? AND store_id = ?',
      [req.params.userId, req.params.storeId]
    );

    if (ratings.length === 0) {
      return res.status(404).json({ message: 'Rating not found' });
    }

    res.json(ratings[0]);
  } catch (error) {
    console.error('Get user rating error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create or update rating
router.post('/', authenticateToken, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5'),
  body('storeId').isInt().withMessage('Valid store ID required'),
  body('userId').isInt().withMessage('Valid user ID required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { rating, storeId, userId } = req.body;

    // Check if rating already exists
    const [existing] = await db.pool.query(
      'SELECT id FROM ratings WHERE user_id = ? AND store_id = ?',
      [userId, storeId]
    );

    if (existing.length > 0) {
      // Update existing rating
      await db.pool.query(
        'UPDATE ratings SET rating = ? WHERE user_id = ? AND store_id = ?',
        [rating, userId, storeId]
      );
      return res.json({ message: 'Rating updated successfully' });
    }

    // Create new rating
    const [result] = await db.pool.query(
      'INSERT INTO ratings (rating, user_id, store_id) VALUES (?, ?, ?)',
      [rating, userId, storeId]
    );

    res.status(201).json({
      id: result.insertId,
      rating,
      userId,
      storeId
    });
  } catch (error) {
    console.error('Create rating error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update rating
router.patch('/store/:storeId', authenticateToken, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { rating } = req.body;
    const userId = req.user.id;
    const storeId = req.params.storeId;

    // Check if rating exists
    const [existing] = await db.pool.query(
      'SELECT id FROM ratings WHERE user_id = ? AND store_id = ?',
      [userId, storeId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Rating not found' });
    }

    // Update rating
    await db.pool.query(
      'UPDATE ratings SET rating = ? WHERE user_id = ? AND store_id = ?',
      [rating, userId, storeId]
    );

    res.json({ message: 'Rating updated successfully' });
  } catch (error) {
    console.error('Update rating error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get store owner dashboard
router.get('/dashboard/store-owner', authenticateToken, authorizeRoles('store_owner'), async (req, res) => {
  try {
    const userId = req.user.id;

    // Get store owner's store
    const [stores] = await db.pool.query(
      'SELECT * FROM stores WHERE owner_id = ?',
      [userId]
    );

    if (stores.length === 0) {
      return res.status(404).json({ message: 'No store found for this owner' });
    }

    const store = stores[0];

    // Get ratings for the store
    const [ratings] = await db.pool.query(`
      SELECT r.*, u.name as userName, u.email as userEmail
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.store_id = ?
    `, [store.id]);

    // Calculate average rating
    const [avgResult] = await db.pool.query(
      'SELECT AVG(rating) as averageRating FROM ratings WHERE store_id = ?',
      [store.id]
    );

    res.json({
      store,
      ratings,
      averageRating: avgResult[0].averageRating || 0
    });
  } catch (error) {
    console.error('Store owner dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
