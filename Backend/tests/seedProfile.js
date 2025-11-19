import mongoose from "mongoose";
import dotenv from "dotenv";
import UserProfile from "../models/user_profile.js";

dotenv.config();

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

  const testProfile = new UserProfile({
    userId: "user_35fKxuDVgbwfOoBwnQOsCcw14An", 
    height: { feet: 5, inches: 10 },
    weight: 160,
    goal: {
      calories: 2200,
      protein: 150,
      carbs: 250,
      fats: 70,
    },
    restrictions: ["Vegetarian", "Gluten"],
  });

  await testProfile.save();
  console.log("✅ Test profile inserted");
  mongoose.disconnect();
}

seed().catch((err) => console.error(err));
