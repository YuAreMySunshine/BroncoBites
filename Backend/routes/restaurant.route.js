import express from 'express';
import Restaurant from '../models/Restaurant.js';

const router = express.Router();

// GET all restaurants
router.get('/', async (_req, res) => {
  try {
    const restaurants = await Restaurant.find();
    res.status(200).json(restaurants);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch restaurants', details: err.message });
  }
});

// GET one restaurant by id
router.get('/:id', async (req, res) => {
  try {
    const doc = await Restaurant.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Restaurant not found' });
    res.status(200).json(doc);
  } catch (err) {
    res.status(400).json({ error: 'Invalid id or request', details: err.message });
  }
});

// CREATE a restaurant
router.post('/', async (req, res) => {
  try {
    const { name, menuItems, hours } = req.body || {};
    const created = await Restaurant.create({ name, menuItems, hours });
    res.status(201).json(created);
  } catch (err) {
    // Handle duplicate key error (unique name)
    if (err && err.code === 11000) {
      return res.status(409).json({ error: 'Restaurant name must be unique' });
    }
    res.status(400).json({ error: 'Failed to create restaurant', details: err.message });
  }
});

// UPDATE a restaurant
router.put('/:id', async (req, res) => {
  try {
    const { name, menuItems, hours, ...rest } = req.body || {};
    const updated = await Restaurant.findByIdAndUpdate(
      req.params.id,
      { $set: { name, menuItems, hours, ...rest } },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: 'Restaurant not found' });
    res.status(200).json(updated);
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json({ error: 'Restaurant name must be unique' });
    }
    res.status(400).json({ error: 'Failed to update restaurant', details: err.message });
  }
});

// DELETE a restaurant
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Restaurant.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Restaurant not found' });
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete restaurant', details: err.message });
  }
});

// Add a menu item to a restaurant
router.post('/:id/menu-items', async (req, res) => {
  try {
    const { itemName, category, price, nutrition } = req.body || {};
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });

    restaurant.menuItems.push({ itemName, category, price, nutrition });
    await restaurant.save();
    res.status(201).json(restaurant);
  } catch (err) {
    res.status(400).json({ error: 'Failed to add menu item', details: err.message });
  }
});

// Update a specific menu item
router.put('/:id/menu-items/:itemId', async (req, res) => {
  try {
    const { itemName, category, price, nutrition } = req.body || {};
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });

    const item = restaurant.menuItems.id(req.params.itemId);
    if (!item) return res.status(404).json({ error: 'Menu item not found' });

    if (itemName !== undefined) item.itemName = itemName;
    if (category !== undefined) item.category = category;
    if (price !== undefined) item.price = price;
    if (nutrition !== undefined) item.nutrition = nutrition;

    await restaurant.save();
    res.status(200).json(restaurant);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update menu item', details: err.message });
  }
});

// Delete a specific menu item
router.delete('/:id/menu-items/:itemId', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });

    const item = restaurant.menuItems.id(req.params.itemId);
    if (!item) return res.status(404).json({ error: 'Menu item not found' });
    item.deleteOne();

    await restaurant.save();
    res.status(200).json(restaurant);
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete menu item', details: err.message });
  }
});

export default router;
