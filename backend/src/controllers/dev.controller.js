import { ok, fail } from "../utils/apiResponse.js";
import Notification from "../models/Notification.js";

export async function createTestNotification(req, res, next) {
  try {
    if (process.env.NODE_ENV === "production") {
      return fail(res, 403, "Dev endpoints disabled in production");
    }

    const userId = req.user._id;

    const doc = await Notification.create({
      userId,
      type: "SYSTEM",
      title: "Test Notification ✅",
      message: "If you can see this, notifications system is working.",
      meta: {},
      read: false,
      dedupeKey: `test:${userId}:${Date.now()}`, // always unique
      severity: "info",
    });

    return ok(res, doc, "Test notification created");
  } catch (err) {
    next(err);
  }
}
