import mongoose from "mongoose";
import Restaurant from "../models/Restaurant.js"

const envPath = path.resolve(process.cwd(), '../.env');
dotenv.config({ path: envPath });

async function createRestaurant() {
  try {
    const newRestaurant = new Restaurant({
      name: 'Panda Express',
      menuItems: [], // start with an empty menu
      hours: {
        Monday: { open: '10:00 AM', close: '08:00 PM' },
        Tuesday: { open: '10:00 AM', close: '08:00 PM' },
        Wednesday: { open: '10:00 AM', close: '08:00 PM' },
        Thursday: { open: '10:00 AM', close: '08:00 PM' },
        Friday: { open: '10:00 AM', close: '02:00 PM' },
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