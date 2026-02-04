import mongoose from "mongoose";

const preferencesSchema = new mongoose.Schema(
  {
    currency: { type: String, default: "INR" },           // synced with User.currency
    timezone: { type: String, default: "Asia/Kolkata" },
    dateFormat: { type: String, default: "DD/MM/YYYY" }, // keep simple
    startOfMonthDay: { type: Number, default: 1, min: 1, max: 28 },
  },
  { _id: false }
);

const notificationsSchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: true },
    budgetAlerts: { type: Boolean, default: true },
    budgetThreshold: { type: Number, default: 80, min: 1, max: 100 },

    goalReminders: { type: Boolean, default: true },
    goalReminderDays: { type: [Number], default: [7, 3, 1] },

    monthlySummary: { type: Boolean, default: true },
    digestTime: { type: String, default: "09:00" }, // HH:mm
  },
  { _id: false }
);

const settingsSchema = new mongoose.Schema(
  {
    preferences: { type: preferencesSchema, default: () => ({}) },
    notifications: { type: notificationsSchema, default: () => ({}) },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true },
    passwordHash: { type: String, required: true, select: true },

    // Backward compatible field (already used in your auth responses)
    currency: { type: String, default: "INR" },

    // New settings object
    settings: { type: settingsSchema, default: () => ({}) },
  },
  { timestamps: true }
);

// Ensure defaults + keep currency in sync
userSchema.pre("save", function (next) {
  if (!this.settings) this.settings = {};

  if (!this.settings.preferences) this.settings.preferences = {};
  if (!this.settings.notifications) this.settings.notifications = {};

  // If settings currency missing, inherit from user.currency
  if (!this.settings.preferences.currency) {
    this.settings.preferences.currency = this.currency || "INR";
  }

  // If user.currency missing, inherit from settings currency
  if (!this.currency && this.settings.preferences.currency) {
    this.currency = this.settings.preferences.currency;
  }

  // Normalize currency
  if (this.currency) this.currency = String(this.currency).toUpperCase();
  if (this.settings?.preferences?.currency) {
    this.settings.preferences.currency = String(this.settings.preferences.currency).toUpperCase();
  }

  next();
});

const User = mongoose.model("User", userSchema);

export default User;
