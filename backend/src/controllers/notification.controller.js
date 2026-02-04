import { asyncHandler } from "../utils/asyncHandler.js";
import { ok } from "../utils/apiResponse.js";
import Notification from "../models/Notification.js";

export const listNotifications = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page || "1", 10), 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit || "10", 10), 1), 50);
  const skip = (page - 1) * limit;

  // Hide developer test notifications from the real UI.
  // If you've created some earlier, they will remain in DB but won't show.
  const baseFilter = {
    userId: req.user._id,
    $nor: [{ kind: "system", title: "Test Notification" }],
  };

  const [items, total] = await Promise.all([
    Notification.find(baseFilter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Notification.countDocuments(baseFilter),
  ]);

  return ok(res, { items, page, limit, total }, "Notifications");
});

export const unreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({
    userId: req.user._id,
    read: false,
    $nor: [{ kind: "system", title: "Test Notification" }],
  });
  return ok(res, { count }, "Unread count");
});

export const markRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await Notification.updateOne({ _id: id, userId: req.user._id }, { $set: { read: true } });
  return ok(res, null, "Marked read");
});

export const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ userId: req.user._id, read: false }, { $set: { read: true } });
  return ok(res, null, "All marked read");
});
