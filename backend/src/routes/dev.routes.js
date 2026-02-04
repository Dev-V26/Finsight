import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import Notification from "../models/Notification.js";

/**
 * DEV ROUTES
 * Mounted ONLY when NODE_ENV !== "production" (see backend/src/app.js)
 */

const router = express.Router();

/**
 * Cleanup any old test notifications so they don't show in UI.
 * This deletes only notifications created by the old dev endpoint.
 */
router.delete("/cleanup-test-notifications", requireAuth, async (req, res) => {
  const result = await Notification.deleteMany({
    userId: req.user._id,
    kind: "system",
    $or: [{ title: "Test Notification" }, { dedupeKey: { $regex: /^test:/ } }],
  });

  res.json({
    success: true,
    message: "Test notifications cleaned",
    data: { deletedCount: result.deletedCount || 0 },
  });
});

export default router;
