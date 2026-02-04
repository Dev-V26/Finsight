import express from "express";
import { exportCSV, monthlyPDF } from "../controllers/reports.controller.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/transactions.csv", auth, exportCSV);
router.get("/monthly.pdf", auth, monthlyPDF);

export default router;
