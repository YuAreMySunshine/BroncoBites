import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals';
import mongoose from "mongoose";
import MealPlan from "../models/meal_plan.js";

jest.setTimeout(30000); // allow up to 30s for DB ops

describe("MealPlan Model", () => {
  beforeAll(async () => {
    await mongoose.connect("mongodb://localhost:27017/testdb");
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it("should create a meal plan with items array", async () => {
    const mealPlan = await MealPlan.create({
      userId: "user_123",
      items: [
        {
          name: "Test Meal",
          category: "Lunch",
          calories: 500,
          protein: 30,
          carbs: 40,
          fats: 20,
        },
      ],
    });

    expect(mealPlan.items.length).toBe(1);
    expect(mealPlan.items[0].name).toBe("Test Meal");
  });
});
