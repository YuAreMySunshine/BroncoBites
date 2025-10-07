import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';
import Restaurant from '../models/Restaurant.js'; // adjust the path if needed

const envPath = path.resolve(process.cwd(), '../.env');
dotenv.config({ path: envPath });
console.log(process.env.M)

const router = express.Router();

// Connect to MongoDB (if not already connected elsewhere)
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error(err));

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
