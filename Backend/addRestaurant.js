import mongoose from "mongoose";
import dotenv from "dotenv";
import Restaurant from "./models/Restaurant.js"

dotenv.config();

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));


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