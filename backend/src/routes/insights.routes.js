// backend/src/routes/insights.routes.js
import express from "express";
import auth from "../middleware/auth.js";
import { getDashboardInsights } from "../controllers/insights.controller.js";

const router = express.Router();

// GET /api/insights/dashboard?month=YYYY-MM
router.get("/dashboard", auth, getDashboardInsights);

export default router;
