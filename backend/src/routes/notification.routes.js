import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  listNotifications,
  unreadCount,
  markAllRead,
  markRead,
} from "../controllers/notification.controller.js";

const router = express.Router();

router.use(requireAuth);

router.get("/", listNotifications);
router.get("/unread-count", unreadCount);
router.patch("/read-all", markAllRead);
router.patch("/:id/read", markRead);

export default router;
