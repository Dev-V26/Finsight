import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { monthSummary } from "../controllers/transactionSummary.controller.js";

import {
  incomeExpenseByMonth,
  expenseByCategory,
} from "../controllers/transactionChart.controller.js";


import {
  createTransaction,
  listTransactions,
  updateTransaction,
  deleteTransaction
} from "../controllers/transaction.controller.js";

const router = Router();

router.use(requireAuth);

router.post("/", createTransaction);
router.get("/", listTransactions);
router.put("/:id", updateTransaction);
router.delete("/:id", deleteTransaction);
router.get("/summary/month", monthSummary);
router.get("/charts/monthly", incomeExpenseByMonth);
router.get("/charts/category", expenseByCategory);

export default router;
