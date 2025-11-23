import mongoose from "mongoose";

const MealPlanItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: {
    type: String,
    enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack'],
    default: 'Snack'
  },
  calories: { type: Number, required: true },
  protein: { type: Number, required: true },
  carbs: { type: Number, required: true },
  fats: { type: Number, required: true },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" },
  restaurantName: { type: String },
  itemId: { type: mongoose.Schema.Types.ObjectId }, // Reference to the menu item
  vegetarian: { type: Boolean, default: false },
  allergens: [{ type: String }]
});

const MealPlanSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true }, // Clerk user ID
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'completed'],
    default: 'draft'
  },
  items: [MealPlanItemSchema],
  // Computed totals for quick access
  totals: {
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fats: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Compound index for efficient user + date lookups
MealPlanSchema.index({ userId: 1, date: 1 }, { unique: true });

// Pre-save hook to calculate totals
MealPlanSchema.pre('save', function(next) {
  this.totals = this.items.reduce((acc, item) => ({
    calories: acc.calories + (item.calories || 0),
    protein: acc.protein + (item.protein || 0),
    carbs: acc.carbs + (item.carbs || 0),
    fats: acc.fats + (item.fats || 0)
  }), { calories: 0, protein: 0, carbs: 0, fats: 0 });
  next();
});

// Virtual to get items by category
MealPlanSchema.virtual('breakfast').get(function() {
  return this.items.filter(item => item.category === 'Breakfast');
});

MealPlanSchema.virtual('lunch').get(function() {
  return this.items.filter(item => item.category === 'Lunch');
});

MealPlanSchema.virtual('dinner').get(function() {
  return this.items.filter(item => item.category === 'Dinner');
});

MealPlanSchema.virtual('snacks').get(function() {
  return this.items.filter(item => item.category === 'Snack');
});

// Ensure virtuals are included in JSON output
MealPlanSchema.set('toJSON', { virtuals: true });
MealPlanSchema.set('toObject', { virtuals: true });

export default mongoose.model("MealPlan", MealPlanSchema);
