import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import Restaurant from "../models/Restaurant.js";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function createRestaurant() {
  await mongoose.connect(process.env.MONGO_URI);
  
  try {
    const newRestaurant = new Restaurant({
      name: 'Panda Express',
      menuItems: [], // start with an empty menu
      hours: {
        Monday: { open: '10:00 AM', close: '08:00 PM', isClosed: false },
        Tuesday: { open: '10:00 AM', close: '08:00 PM', isClosed: false },
        Wednesday: { open: '10:00 AM', close: '08:00 PM', isClosed: false },
        Thursday: { open: '10:00 AM', close: '08:00 PM', isClosed: false },
        Friday: { open: '10:00 AM', close: '02:00 PM', isClosed: false },
        Saturday: { open: '10:00 AM', close: '08:00 PM', isClosed: true },
        Sunday: { open: '10:00 AM', close: '08:00 PM', isClosed: true }
      }
    });

    const savedRestaurant = await newRestaurant.save();
    console.log('Restaurant created:', savedRestaurant.toJSON()); // includes virtual isOpen
  } catch (err) {
    console.error('Error creating restaurant:', err);
  } finally {
    mongoose.connection.close();
  }
}

createRestaurant();