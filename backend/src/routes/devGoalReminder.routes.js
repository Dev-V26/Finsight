import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { runGoalDeadlineReminders } from "../utils/goalDeadlineReminders.js";

const router = express.Router();

router.post("/run-goal-reminders", requireAuth, async (req, res) => {
  await runGoalDeadlineReminders();
  res.json({ success: true, message: "Goal reminders executed" });
});

export default router;
