import express from "express";
import { getAnomalies, markRead } from "../controllers/anomaly.controller.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/", auth, getAnomalies);
router.patch("/:id/read", auth, markRead);

export default router;
