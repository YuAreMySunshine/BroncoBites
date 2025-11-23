// backend/server.js
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import { clerkMiddleware } from "@clerk/express";

import timRoute from "./routes/tim.route.js";
import eliRoute from "./routes/eli.route.js";
import jaronRoute from "./routes/jaron.route.js";
import javiRoute from "./routes/javi.route.js";
import restaurantRoute from "./routes/restaurant.route.js";
import userRoute from "./routes/user.route.js";
import mealplanRoute from "./routes/mealplan.route.js";
import preferencesRoute from "./routes/preferences.route.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true // Allow cookies/auth headers
}));

// Clerk authentication middleware
app.use(clerkMiddleware({}))

// 1. Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// 2. Get directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 3. Serve static files from React build
app.use(express.static(path.join(__dirname, '../Frontend/dist')));

// 4. API Routes
app.use("/api/tim-lee", timRoute);
app.use("/api/eli-tolentino", eliRoute);
app.use("/api/jaron-lin", jaronRoute);
app.use("/api/javi-wu", javiRoute);
app.use("/api/restaurants", restaurantRoute);
app.use("/api/users", userRoute);
app.use("/api/mealplans", mealplanRoute);
app.use("/api/preferences", preferencesRoute);

// 5. Handle React Router - serve index.html for all non-API routes
app.use((req, res, next) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) {
    return next();
  }
  // Serve index.html for all other routes (React Router will handle client-side routing)
  res.sendFile(path.join(__dirname, '../Frontend/dist/index.html'), (err) => {
    if (err) {
      res.status(500).send('Error loading page');
    }
  });
});

// 6. Error handling middleware for malformed URIs
app.use((err, req, res, next) => {
  if (err instanceof URIError) {
    return res.status(400).send('Bad Request: Malformed URI');
  }
  next(err);
});

// 7. Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export default app;