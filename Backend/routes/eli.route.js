import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
    res.json({message: "Hello, this is Eli Tolentino."});
})

export default router;