import express from "express";
import auth from "../middleware/auth.js";
import { listGoals, createGoal, updateGoal, deleteGoal } from "../controllers/goal.controller.js";

const router = express.Router();

// Protect all goal routes
router.use(auth);

// GET /api/goals
router.get("/", listGoals);

// POST /api/goals
router.post("/", createGoal);

// PATCH /api/goals/:id
router.patch("/:id", updateGoal);

// DELETE /api/goals/:id
router.delete("/:id", deleteGoal);

export default router;
