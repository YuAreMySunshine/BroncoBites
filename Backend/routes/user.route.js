import express from "express";
import { requireAuth } from "@clerk/express";
import UserProfile from "../models/user_profile.js";

const router = express.Router();

// GET profile (fetch logged-in user's profile)
router.get("/profile", requireAuth(), async (req, res) => {
  try {
    console.log("req.auth:", req.auth);
    const { userId } = req.auth;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const profile = await UserProfile.findOne({ userId }).lean();
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.status(200).json(profile);
  } catch (err) {
    console.error("Error in GET /profile:", err);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
});

// POST profile (create or update)
router.post("/profile", requireAuth(), async (req, res) => {
  try {
    const { userId } = req.auth;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { height, weight, goal, restrictions } = req.body;
    const data = { height, weight, goal, restrictions };

    console.log("Updating profile for:", userId, "with data:", data);

    const profile = await UserProfile.findOneAndUpdate(
      { userId },
      data,
      { upsert: true, new: true }
    );

    res.status(profile ? 200 : 201).json(profile);
  } catch (err) {
    console.error("Error in POST /profile:", err);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
});

// DELETE profile (remove logged-in user's profile)
router.delete("/profile", requireAuth(), async (req, res) => {
  try {
    const { userId } = req.auth;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    console.log("Deleting profile for:", userId);

    const result = await UserProfile.findOneAndDelete({ userId });
    if (!result) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.status(200).json({ message: "Profile deleted" });
  } catch (err) {
    console.error("Error in DELETE /profile:", err);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
});

export default router;
