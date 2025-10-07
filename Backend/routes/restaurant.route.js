import express from 'express';
import Restaurant from '../models/Restaurant.js'; // adjust the path if needed

const router = express.Router();

// GET all restaurants and their menu items
router.get('/', async (req, res) => {
  try {
    const restaurants = await Restaurant.find(); // retrieves all documents
    res.status(200).json(restaurants);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch restaurants', details: err.message });
  }
});

export default router;
