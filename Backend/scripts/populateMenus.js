import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import csv from "csv-parser";
import dotenv from "dotenv";
import Restaurant from "../models/Restaurant.js";

// ✅ Load .env from backend folder
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const menuDir = path.resolve("scripts/Menus");

// ✅ Debug log to confirm MONGO_URI is loaded
console.log("MONGO_URI:", process.env.MONGO_URI);

const idMap = JSON.parse(
  fs.readFileSync(path.resolve("./scripts/restaurant_ids.json"), "utf-8")
);

function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    const items = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        items.push({
          itemName: row["Item Name"] || row["Item"],
          calories: parseInt(row["Calories"]) || 0,
          nutrition: {
            protein: parseFloat(row["Protein"]) || parseFloat(row["Protein (g)"]) || 0,
            carbs: parseFloat(row["Carbohydrates"]) || parseFloat(row["Carbs (g)"]) || 0,
            fats: parseFloat(row["Fats"]) || parseFloat(row["Fat (g)"]) || 0,
          },
          vegetarian: row["Vegetarian"] === "TRUE" || row["Vegetarian"] === "true" || false,
          allergens: row["Allergens"] ? row["Allergens"].split(",").map(a => a.trim()) : [],
        });
      })
      .on("end", () => resolve(items))
      .on("error", reject);
  });
}

async function ingestAll() {
  await mongoose.connect(process.env.MONGO_URI);

  const files = fs.readdirSync(menuDir).filter((f) => f.endsWith(".csv"));

  for (const file of files) {
    const restaurantId = idMap[file];
    if (!restaurantId) {
      console.warn(`⚠️ No ID mapping for ${file}, skipping`);
      continue;
    }

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      console.warn(`⚠️ Restaurant with ID ${restaurantId} not found`);
      continue;
    }

    const filePath = path.join(menuDir, file);
    const items = await parseCSV(filePath);

    // Clear existing menu items before adding new ones
    restaurant.menuItems = [];
    restaurant.menuItems.push(...items);
    await restaurant.save();

    console.log(`✅ ${restaurant.name}: Added ${items.length} items`);
  }

  mongoose.connection.close();
}

ingestAll();