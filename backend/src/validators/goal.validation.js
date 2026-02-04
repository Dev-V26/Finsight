import { z } from "zod";

/**
 * Accepts numbers OR numeric strings from frontend forms.
 * deadline can be "YYYY-MM-DD" or ISO string.
 */

export const createGoalSchema = z.object({
  title: z.string().min(1, "Title is required").max(60, "Max 60 characters"),
  targetAmount: z.coerce.number().positive("Target amount must be > 0"),
  deadline: z
    .string()
    .optional()
    .transform((v) => (v && v.trim() !== "" ? v : undefined)),
  notes: z
    .string()
    .optional()
    .transform((v) => (v ? v : "")),
});

export const updateGoalSchema = z.object({
  title: z.string().min(1).max(60).optional(),
  targetAmount: z.coerce.number().positive().optional(),
  deadline: z
    .string()
    .optional()
    .transform((v) => (v && v.trim() !== "" ? v : undefined)),
  notes: z.string().optional(),
  status: z.enum(["active", "completed", "archived"]).optional(),

  // contribution field (adds to savedAmount)
  addAmount: z.coerce.number().positive("addAmount must be > 0").optional(),
});
