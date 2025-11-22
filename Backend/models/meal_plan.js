import mongoose from "mongoose";

const MealPlanSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Clerk user ID
  createdAt: { type: Date, default: Date.now },
  items: [
    {
      name: { type: String, required: true },
      category: { type: String }, // Breakfast, Lunch, Dinner, Snack
      calories: { type: Number, required: true },
      protein: { type: Number, required: true },
      carbs: { type: Number, required: true },
      fats: { type: Number, required: true },
      restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" }
    }
  ]
});

export default mongoose.model("MealPlan", MealPlanSchema);
