// backend/server.js
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

import timRoute from "./routes/tim.route.js";
import eliRoute from "./routes/eli.route.js";
import jaronRoute from "./routes/jaron.route.js";
import javiRoute from "./routes/javi.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(cors());

// 1. Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// 2. Routes
app.use("/api/tim-lee", timRoute);
app.use("/api/eli-tolentino", eliRoute);
app.use("/api/jaron-lin", jaronRoute);
app.use("/api/javi-wu", javiRoute);

// 3. Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
