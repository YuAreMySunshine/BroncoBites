import express from 'express';
import { requireAuth } from '@clerk/express';
import MealPlan from '../models/meal_plan.js';
import Restaurant from '../models/Restaurant.js';
import UserProfile from '../models/user_profile.js';
import UserPreferences from '../models/user_preferences.js';

const router = express.Router();

// Get all meal plans for the authenticated user
router.get('/', requireAuth(), async (req, res) => {
  try {
    const { userId } = req.auth;
    const { startDate, endDate, status } = req.query;

    const query = { userId };

    // Optional date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = startDate;
      if (endDate) query.date.$lte = endDate;
    }

    // Optional status filter
    if (status) {
      query.status = status;
    }

    const mealPlans = await MealPlan.find(query).sort({ date: -1 });
    res.json(mealPlans);
  } catch (error) {
    console.error('Error fetching meal plans:', error);
    res.status(500).json({ error: 'Failed to fetch meal plans' });
  }
});

// Get meal plan for a specific date
router.get('/date/:date', requireAuth(), async (req, res) => {
  try {
    const { userId } = req.auth;
    const { date } = req.params;

    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }

    let mealPlan = await MealPlan.findOne({ userId, date });

    // If no plan exists for this date, return an empty structure
    if (!mealPlan) {
      return res.json({
        userId,
        date,
        status: 'draft',
        items: [],
        totals: { calories: 0, protein: 0, carbs: 0, fats: 0 },
        exists: false
      });
    }

    res.json({ ...mealPlan.toJSON(), exists: true });
  } catch (error) {
    console.error('Error fetching meal plan:', error);
    res.status(500).json({ error: 'Failed to fetch meal plan' });
  }
});

// Create or update meal plan for a specific date
router.post('/', requireAuth(), async (req, res) => {
  try {
    const { userId } = req.auth;
    const { date, items, status } = req.body;

    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }

    // Upsert the meal plan
    const mealPlan = await MealPlan.findOneAndUpdate(
      { userId, date },
      {
        userId,
        date,
        items: items || [],
        status: status || 'draft'
      },
      { upsert: true, new: true, runValidators: true }
    );

    res.status(201).json(mealPlan);
  } catch (error) {
    console.error('Error saving meal plan:', error);
    res.status(500).json({ error: 'Failed to save meal plan' });
  }
});

// Add item to meal plan
router.post('/date/:date/items', requireAuth(), async (req, res) => {
  try {
    const { userId } = req.auth;
    const { date } = req.params;
    const itemData = req.body;

    if (!itemData.name || itemData.calories === undefined) {
      return res.status(400).json({ error: 'Item name and calories are required' });
    }

    // Find or create the meal plan for this date
    let mealPlan = await MealPlan.findOne({ userId, date });

    if (!mealPlan) {
      mealPlan = new MealPlan({
        userId,
        date,
        items: [],
        status: 'draft'
      });
    }

    // Add the new item
    mealPlan.items.push(itemData);
    await mealPlan.save();

    res.status(201).json(mealPlan);
  } catch (error) {
    console.error('Error adding item to meal plan:', error);
    res.status(500).json({ error: 'Failed to add item' });
  }
});

// Remove item from meal plan
router.delete('/date/:date/items/:itemId', requireAuth(), async (req, res) => {
  try {
    const { userId } = req.auth;
    const { date, itemId } = req.params;

    const mealPlan = await MealPlan.findOne({ userId, date });

    if (!mealPlan) {
      return res.status(404).json({ error: 'Meal plan not found' });
    }

    // Remove the item
    mealPlan.items = mealPlan.items.filter(
      item => item._id.toString() !== itemId
    );
    await mealPlan.save();

    res.json(mealPlan);
  } catch (error) {
    console.error('Error removing item from meal plan:', error);
    res.status(500).json({ error: 'Failed to remove item' });
  }
});

// Update meal plan status
router.patch('/date/:date/status', requireAuth(), async (req, res) => {
  try {
    const { userId } = req.auth;
    const { date } = req.params;
    const { status } = req.body;

    if (!['draft', 'active', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const mealPlan = await MealPlan.findOneAndUpdate(
      { userId, date },
      { status },
      { new: true }
    );

    if (!mealPlan) {
      return res.status(404).json({ error: 'Meal plan not found' });
    }

    res.json(mealPlan);
  } catch (error) {
    console.error('Error updating meal plan status:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// Delete meal plan
router.delete('/date/:date', requireAuth(), async (req, res) => {
  try {
    const { userId } = req.auth;
    const { date } = req.params;

    const result = await MealPlan.findOneAndDelete({ userId, date });

    if (!result) {
      return res.status(404).json({ error: 'Meal plan not found' });
    }

    res.json({ message: 'Meal plan deleted successfully' });
  } catch (error) {
    console.error('Error deleting meal plan:', error);
    res.status(500).json({ error: 'Failed to delete meal plan' });
  }
});

// Auto-generate meal plan based on user goals
router.post('/generate', requireAuth(), async (req, res) => {
  try {
    const { userId } = req.auth;
    const { date } = req.body;

    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    // Get user profile for goals
    const userProfile = await UserProfile.findOne({ userId });
    if (!userProfile || !userProfile.goal) {
      return res.status(400).json({
        error: 'Please set up your nutrition goals in Settings first'
      });
    }

    const goals = userProfile.goal;
    const restrictions = userProfile.restrictions || [];

    // Get user preferences (favorites/blacklist)
    const prefs = await UserPreferences.findOne({ userId });

    const blacklistedItemIds = prefs?.blacklistedItems.map(i => i.itemId.toString()) || [];
    const blacklistedRestaurantIds = prefs?.blacklistedRestaurants.map(r => r.restaurantId.toString()) || [];
    const favoriteItemIds = prefs?.favoriteItems.map(i => i.itemId.toString()) || [];

    // Get all restaurants and their menu items
    const restaurants = await Restaurant.find({
      _id: { $nin: blacklistedRestaurantIds }
    });

    console.log(`Found ${restaurants.length} restaurants for meal plan generation`);

    // Flatten all menu items with restaurant info
    let allItems = [];
    for (const restaurant of restaurants) {
      for (const item of restaurant.menuItems) {
        // Skip blacklisted items
        if (blacklistedItemIds.includes(item._id.toString())) continue;

        // Apply dietary restrictions
        if (restrictions.includes('Vegetarian') && !item.vegetarian) continue;

        allItems.push({
          ...item.toObject(),
          itemId: item._id,
          restaurantId: restaurant._id,
          restaurantName: restaurant.name,
          isFavorite: favoriteItemIds.includes(item._id.toString())
        });
      }
    }

    console.log(`Found ${allItems.length} available menu items after filtering`);

    if (allItems.length === 0) {
      return res.status(400).json({
        error: 'No menu items available. Please ensure restaurants have menu items in the database.'
      });
    }

    // Category calorie targets (percentage of daily goal)
    const categoryTargets = {
      Breakfast: 0.25,
      Lunch: 0.35,
      Dinner: 0.30,
      Snack: 0.10
    };

    // Score items based on how well they fit the goals
    const scoreItem = (item, targetCalories) => {
      let score = 0;

      // Favor items close to target calories (within 20%)
      const calorieRatio = item.calories / targetCalories;
      if (calorieRatio >= 0.5 && calorieRatio <= 1.2) {
        score += 50 - Math.abs(1 - calorieRatio) * 30;
      }

      // Bonus for favorites
      if (item.isFavorite) score += 30;

      // Bonus for good protein-to-calorie ratio
      const proteinRatio = (item.nutrition?.protein || 0) / (item.calories || 1);
      score += proteinRatio * 100;

      return score;
    };

    const selectedItems = [];
    let currentTotals = { calories: 0, protein: 0, carbs: 0, fats: 0 };
    const usedItemIds = new Set();
    const categories = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

    for (const category of categories) {
      const targetCalories = goals.calories * categoryTargets[category];
      const maxItemsForCategory = category === 'Snack' ? 1 : 2;
      let categoryItemCount = 0;
      let categoryCalories = 0;

      // Sort items by score for this category's target
      const scoredItems = allItems
        .filter(item => !usedItemIds.has(item.itemId.toString()))
        .map(item => ({ ...item, score: scoreItem(item, targetCalories) }))
        .sort((a, b) => b.score - a.score);

      for (const item of scoredItems) {
        // Stop if we have enough items for this category
        if (categoryItemCount >= maxItemsForCategory) break;

        // Stop if adding this item would exceed daily calorie goal
        if (currentTotals.calories + item.calories > goals.calories * 1.05) continue;

        // Skip if this item alone is way too many calories for the category
        if (item.calories > targetCalories * 1.5 && categoryItemCount === 0) continue;

        selectedItems.push({
          name: item.itemName,
          category,
          calories: item.calories,
          protein: item.nutrition?.protein || 0,
          carbs: item.nutrition?.carbs || 0,
          fats: item.nutrition?.fats || 0,
          restaurantId: item.restaurantId,
          restaurantName: item.restaurantName,
          itemId: item.itemId,
          vegetarian: item.vegetarian || false,
          allergens: item.allergens || []
        });

        usedItemIds.add(item.itemId.toString());
        categoryItemCount++;
        categoryCalories += item.calories;
        currentTotals.calories += item.calories;
        currentTotals.protein += item.nutrition?.protein || 0;
        currentTotals.carbs += item.nutrition?.carbs || 0;
        currentTotals.fats += item.nutrition?.fats || 0;

        // If we've hit close to the category target with one item, move on
        if (categoryCalories >= targetCalories * 0.7) break;
      }
    }

    console.log(`Generated meal plan with ${selectedItems.length} items, totals:`, currentTotals);

    if (selectedItems.length === 0) {
      return res.status(400).json({
        error: 'Could not generate meal plan. Menu items may not fit within your calorie goals.'
      });
    }

    // Save the generated plan using save() to trigger pre-save hook for totals calculation
    let mealPlan = await MealPlan.findOne({ userId, date });
    if (!mealPlan) {
      mealPlan = new MealPlan({ userId, date });
    }
    mealPlan.items = selectedItems;
    mealPlan.status = 'draft';
    await mealPlan.save();

    res.status(201).json({
      mealPlan: { ...mealPlan.toJSON(), exists: true },
      goals,
      message: `Generated meal plan with ${selectedItems.length} items`
    });
  } catch (error) {
    console.error('Error generating meal plan:', error);
    res.status(500).json({ error: 'Failed to generate meal plan' });
  }
});

export default router;
