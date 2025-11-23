import mongoose from 'mongoose';

const userPreferencesSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  // Favorited menu items - stores references to specific menu items
  favoriteItems: [{
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    itemName: {
      type: String,
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Blacklisted menu items - won't appear in suggestions
  blacklistedItems: [{
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    itemName: {
      type: String,
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Favorited restaurants
  favoriteRestaurants: [{
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true
    },
    restaurantName: {
      type: String,
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Blacklisted restaurants - items from these won't appear in suggestions
  blacklistedRestaurants: [{
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true
    },
    restaurantName: {
      type: String,
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Helper method to check if an item is favorited
userPreferencesSchema.methods.isItemFavorited = function(itemId) {
  return this.favoriteItems.some(item => item.itemId.toString() === itemId.toString());
};

// Helper method to check if an item is blacklisted
userPreferencesSchema.methods.isItemBlacklisted = function(itemId) {
  return this.blacklistedItems.some(item => item.itemId.toString() === itemId.toString());
};

// Helper method to check if a restaurant is favorited
userPreferencesSchema.methods.isRestaurantFavorited = function(restaurantId) {
  return this.favoriteRestaurants.some(r => r.restaurantId.toString() === restaurantId.toString());
};

// Helper method to check if a restaurant is blacklisted
userPreferencesSchema.methods.isRestaurantBlacklisted = function(restaurantId) {
  return this.blacklistedRestaurants.some(r => r.restaurantId.toString() === restaurantId.toString());
};

export default mongoose.model('UserPreferences', userPreferencesSchema);
