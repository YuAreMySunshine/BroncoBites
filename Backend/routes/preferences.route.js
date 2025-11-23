import express from 'express';
import { requireAuth } from '@clerk/express';
import UserPreferences from '../models/user_preferences.js';
import Restaurant from '../models/Restaurant.js';

const router = express.Router();

// Get user preferences
router.get('/', requireAuth(), async (req, res) => {
  try {
    const { userId } = req.auth;

    let prefs = await UserPreferences.findOne({ userId });

    // Return empty preferences if none exist
    if (!prefs) {
      return res.json({
        userId,
        favoriteItems: [],
        blacklistedItems: [],
        favoriteRestaurants: [],
        blacklistedRestaurants: []
      });
    }

    res.json(prefs);
  } catch (error) {
    console.error('Error fetching preferences:', error);
    res.status(500).json({ error: 'Failed to fetch preferences' });
  }
});

// Toggle favorite item
router.post('/favorite/item', requireAuth(), async (req, res) => {
  try {
    const { userId } = req.auth;
    const { restaurantId, itemId, itemName } = req.body;

    if (!restaurantId || !itemId || !itemName) {
      return res.status(400).json({
        error: 'restaurantId, itemId, and itemName are required'
      });
    }

    let prefs = await UserPreferences.findOne({ userId });

    if (!prefs) {
      prefs = new UserPreferences({ userId });
    }

    // Check if item is already favorited
    const existingIndex = prefs.favoriteItems.findIndex(
      item => item.itemId.toString() === itemId
    );

    if (existingIndex > -1) {
      // Remove from favorites
      prefs.favoriteItems.splice(existingIndex, 1);
    } else {
      // Add to favorites (and remove from blacklist if present)
      prefs.blacklistedItems = prefs.blacklistedItems.filter(
        item => item.itemId.toString() !== itemId
      );
      prefs.favoriteItems.push({
        restaurantId,
        itemId,
        itemName,
        addedAt: new Date()
      });
    }

    await prefs.save();
    res.json(prefs);
  } catch (error) {
    console.error('Error toggling favorite item:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

// Toggle blacklist item
router.post('/blacklist/item', requireAuth(), async (req, res) => {
  try {
    const { userId } = req.auth;
    const { restaurantId, itemId, itemName } = req.body;

    if (!restaurantId || !itemId || !itemName) {
      return res.status(400).json({
        error: 'restaurantId, itemId, and itemName are required'
      });
    }

    let prefs = await UserPreferences.findOne({ userId });

    if (!prefs) {
      prefs = new UserPreferences({ userId });
    }

    // Check if item is already blacklisted
    const existingIndex = prefs.blacklistedItems.findIndex(
      item => item.itemId.toString() === itemId
    );

    if (existingIndex > -1) {
      // Remove from blacklist
      prefs.blacklistedItems.splice(existingIndex, 1);
    } else {
      // Add to blacklist (and remove from favorites if present)
      prefs.favoriteItems = prefs.favoriteItems.filter(
        item => item.itemId.toString() !== itemId
      );
      prefs.blacklistedItems.push({
        restaurantId,
        itemId,
        itemName,
        addedAt: new Date()
      });
    }

    await prefs.save();
    res.json(prefs);
  } catch (error) {
    console.error('Error toggling blacklist item:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

// Toggle favorite restaurant
router.post('/favorite/restaurant', requireAuth(), async (req, res) => {
  try {
    const { userId } = req.auth;
    const { restaurantId, restaurantName } = req.body;

    if (!restaurantId || !restaurantName) {
      return res.status(400).json({
        error: 'restaurantId and restaurantName are required'
      });
    }

    let prefs = await UserPreferences.findOne({ userId });

    if (!prefs) {
      prefs = new UserPreferences({ userId });
    }

    // Check if restaurant is already favorited
    const existingIndex = prefs.favoriteRestaurants.findIndex(
      r => r.restaurantId.toString() === restaurantId
    );

    if (existingIndex > -1) {
      // Remove from favorites
      prefs.favoriteRestaurants.splice(existingIndex, 1);
    } else {
      // Add to favorites (and remove from blacklist if present)
      prefs.blacklistedRestaurants = prefs.blacklistedRestaurants.filter(
        r => r.restaurantId.toString() !== restaurantId
      );
      prefs.favoriteRestaurants.push({
        restaurantId,
        restaurantName,
        addedAt: new Date()
      });
    }

    await prefs.save();
    res.json(prefs);
  } catch (error) {
    console.error('Error toggling favorite restaurant:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

// Toggle blacklist restaurant
router.post('/blacklist/restaurant', requireAuth(), async (req, res) => {
  try {
    const { userId } = req.auth;
    const { restaurantId, restaurantName } = req.body;

    if (!restaurantId || !restaurantName) {
      return res.status(400).json({
        error: 'restaurantId and restaurantName are required'
      });
    }

    let prefs = await UserPreferences.findOne({ userId });

    if (!prefs) {
      prefs = new UserPreferences({ userId });
    }

    // Check if restaurant is already blacklisted
    const existingIndex = prefs.blacklistedRestaurants.findIndex(
      r => r.restaurantId.toString() === restaurantId
    );

    if (existingIndex > -1) {
      // Remove from blacklist
      prefs.blacklistedRestaurants.splice(existingIndex, 1);
    } else {
      // Add to blacklist (and remove from favorites if present)
      prefs.favoriteRestaurants = prefs.favoriteRestaurants.filter(
        r => r.restaurantId.toString() !== restaurantId
      );
      prefs.blacklistedRestaurants.push({
        restaurantId,
        restaurantName,
        addedAt: new Date()
      });
    }

    await prefs.save();
    res.json(prefs);
  } catch (error) {
    console.error('Error toggling blacklist restaurant:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

// Clear all preferences
router.delete('/', requireAuth(), async (req, res) => {
  try {
    const { userId } = req.auth;

    await UserPreferences.findOneAndDelete({ userId });

    res.json({ message: 'Preferences cleared successfully' });
  } catch (error) {
    console.error('Error clearing preferences:', error);
    res.status(500).json({ error: 'Failed to clear preferences' });
  }
});

export default router;
