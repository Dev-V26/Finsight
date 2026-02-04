import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  createOrUpdateBudget,
  listBudgets,
} from "../controllers/budget.controller.js";

const router = Router();

router.use(requireAuth);

router.post("/", createOrUpdateBudget);
router.get("/", listBudgets);

export default router;
