import { Router } from "express";
import auth from "../middleware/auth.middleware.js";
import {
  getSettings,
  updateSettings,
  deleteAccount,
} from "../controllers/settings.controller.js";

const router = Router();

// Settings
router.get("/", auth, getSettings);
router.put("/", auth, updateSettings);

// Privacy
router.delete("/account", auth, deleteAccount);

export default router;
