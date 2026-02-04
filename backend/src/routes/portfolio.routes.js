import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  createHolding,
  deleteHolding,
  getPortfolioSummary,
  listHoldings,
  updateHolding,
} from "../controllers/portfolio.controller.js";

const router = Router();

router.use(requireAuth);

router.get("/summary", getPortfolioSummary);

router.get("/holdings", listHoldings);
router.post("/holdings", createHolding);
router.put("/holdings/:id", updateHolding);
router.delete("/holdings/:id", deleteHolding);

export default router;
