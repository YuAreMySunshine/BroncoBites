import MealPlan from "../models/MealPlan.js";

app.post("/mealplan", async (req, res) => {
  try {
    const mealPlan = new MealPlan({
      userId: req.auth.userId, // Clerk user ID from middleware
      items: req.body.items
    });
    await mealPlan.save();
    res.json(mealPlan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});