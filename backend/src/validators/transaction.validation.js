import { z } from "zod";

const allowedTypes = ["income", "expense"];
const allowedMethods = ["cash", "card", "upi", "bank_transfer", "other"];

export const createTransactionSchema = z.object({
  type: z.enum(allowedTypes),
  amount: z.number().positive(),
  category: z.string().min(1).max(50),
  date: z.string().datetime(), // send ISO string from frontend
  paymentMethod: z.enum(allowedMethods).optional(),
  notes: z.string().max(500).optional()
});

export const updateTransactionSchema = createTransactionSchema.partial();
