import mongoose from "mongoose";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import Budget from "../models/Budget.js";
import Goal from "../models/Goal.js";
import { updateSettingsSchema } from "../validators/settings.validation.js";
import { ok, fail } from "../utils/apiResponse.js";

function ensureSettings(user) {
  if (!user.settings) user.settings = {};
  if (!user.settings.preferences) user.settings.preferences = {};
  if (!user.settings.notifications) user.settings.notifications = {};

  // sync currency
  if (!user.settings.preferences.currency) {
    user.settings.preferences.currency = user.currency || "INR";
  }
  if (!user.currency && user.settings.preferences.currency) {
    user.currency = user.settings.preferences.currency;
  }
}

export async function getSettings(req, res, next) {
  try {
    const user = req.user;
    ensureSettings(user);

    if (user.isModified("settings") || user.isModified("currency")) {
      await user.save();
    }

    return ok(res, user.settings, "User settings");
  } catch (err) {
    next(err);
  }
}

export async function updateSettings(req, res, next) {
  try {
    const parsed = updateSettingsSchema.parse(req.body);
    const user = req.user;

    ensureSettings(user);

    if (parsed.preferences) {
      user.settings.preferences = {
        ...user.settings.preferences,
        ...parsed.preferences,
      };

      if (parsed.preferences.currency) {
        const cur = String(parsed.preferences.currency).toUpperCase();
        user.currency = cur;
        user.settings.preferences.currency = cur;
      }
    }

    if (parsed.notifications) {
      user.settings.notifications = {
        ...user.settings.notifications,
        ...parsed.notifications,
      };
    }

    await user.save();
    return ok(res, user.settings, "Settings updated");
  } catch (err) {
    next(err);
  }
}

export async function deleteAccount(req, res, next) {
  const userId = req.user?._id;
  if (!userId) return fail(res, 401, "Unauthorized");

  let session = null;

  try {
    try {
      session = await mongoose.startSession();
      session.startTransaction();
    } catch {
      session = null; // fallback if transactions not supported
    }

    const opts = session ? { session } : undefined;

    await Promise.all([
      Transaction.deleteMany({ userId }, opts),
      Budget.deleteMany({ userId }, opts),
      Goal.deleteMany({ userId }, opts),
    ]);

    await User.deleteOne({ _id: userId }, opts);

    if (session) {
      await session.commitTransaction();
      session.endSession();
    }

    return ok(res, null, "Account deleted successfully");
  } catch (err) {
    if (session) {
      try {
        await session.abortTransaction();
        session.endSession();
      } catch {}
    }
    next(err);
  }
}
