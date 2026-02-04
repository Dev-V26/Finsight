import { z } from "zod";

const timeHHmm = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Invalid time (HH:mm)");

const preferencesSchema = z.object({
  currency: z.string().min(3).max(6).optional(),
  timezone: z.string().min(3).max(60).optional(),
  dateFormat: z.enum(["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"]).optional(),
  startOfMonthDay: z.number().int().min(1).max(28).optional(),
});

const notificationsSchema = z.object({
  enabled: z.boolean().optional(),
  budgetAlerts: z.boolean().optional(),
  budgetThreshold: z.number().int().min(1).max(100).optional(),

  goalReminders: z.boolean().optional(),
  goalReminderDays: z.array(z.number().int().min(1).max(30)).max(10).optional(),

  monthlySummary: z.boolean().optional(),
  digestTime: timeHHmm.optional(),
});

export const updateSettingsSchema = z.object({
  preferences: preferencesSchema.optional(),
  notifications: notificationsSchema.optional(),
});
