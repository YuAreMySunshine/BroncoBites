import mongoose from 'mongoose';

/*
userId: Clerk-authenticated user identifier (unique).

height: Stored as feet and inches separately.

weight: User's weight in pounds.

goal: Object containing calorie, protein, carb, and fat targets.

restrictions: Array of dietary restrictions (e.g., ['Vegetarian', 'Gluten', 'Peanuts']).
*/

const userProfileSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  height: {
    feet: {
      type: Number,
      required: true
    },
    inches: {
      type: Number,
      required: true
    }
  },
  weight: {
    type: Number, // in lbs
    required: true
  },
  goal: {
    calories: { type: Number, required: true },
    protein:  { type: Number, required: true },
    carbs:    { type: Number, required: true },
    fats:     { type: Number, required: true }
  },
  restrictions: {
    type: [String], // e.g., ['Vegetarian', 'Gluten', 'Peanuts']
    default: []
  }
});

const UserProfile = mongoose.model('UserProfile', userProfileSchema);
export default UserProfile;
