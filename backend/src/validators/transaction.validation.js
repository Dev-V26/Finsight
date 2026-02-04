// import { z } from "zod";

// const PAYMENT_METHODS = ["cash", "card", "upi", "bank_transfer", "other", "custom"];

// function normalizeKey(value) {
//   return String(value || "")
//     .trim()
//     .toLowerCase()
//     .replace(/\s+/g, "_");
// }

// function parseFlexibleDate(value) {
//   if (value instanceof Date) return value;
//   if (typeof value !== "string") return null;

//   const v = value.trim();

//   // ISO or YYYY-MM-DD
//   if (/^\d{4}-\d{2}-\d{2}(T.*)?$/.test(v)) {
//     const d = new Date(v);
//     return isNaN(d.getTime()) ? null : d;
//   }

//   // DD-MM-YYYY
//   const m = v.match(/^(\d{2})-(\d{2})-(\d{4})$/);
//   if (m) {
//     const dd = Number(m[1]);
//     const mm = Number(m[2]);
//     const yyyy = Number(m[3]);
//     const d = new Date(yyyy, mm - 1, dd);
//     return isNaN(d.getTime()) ? null : d;
//   }

//   return null;
// }

// /**
//  * ✅ Base object schema (has .partial())
//  */
// const baseTransactionSchema = z.object({
//   type: z.enum(["income", "expense"]),
//   amount: z.coerce.number().positive("Amount must be > 0"),

//   category: z.string().min(1, "Category is required").max(60).transform((v) => v.trim()),
//   customCategory: z.string().max(60).optional(),

//   date: z.preprocess((val) => parseFlexibleDate(val), z.date()),

//   paymentMethod: z
//     .string()
//     .optional()
//     .transform((v) => (v ? normalizeKey(v) : undefined))
//     .refine((v) => (v ? PAYMENT_METHODS.includes(v) : true), "Invalid payment method"),

//   customPaymentMethod: z.string().max(60).optional(),

//   notes: z.string().max(500).optional(),
// });

// /**
//  * ✅ Create schema (transforms to final normalized output)
//  */
// export const createTransactionSchema = baseTransactionSchema.transform((data) => {
//   const catKey = normalizeKey(data.category);
//   const finalCategory =
//     catKey === "custom" && data.customCategory ? data.customCategory.trim() : data.category.trim();

//   let finalPaymentMethod = data.paymentMethod || "other";
//   if (finalPaymentMethod === "custom" && data.customPaymentMethod) {
//     finalPaymentMethod = normalizeKey(data.customPaymentMethod);
//   }

//   return {
//     ...data,
//     category: finalCategory,
//     paymentMethod: finalPaymentMethod,
//   };
// });

// /**
//  * ✅ Update schema MUST be based on the base object (not transformed schema)
//  * Then we apply the same normalization safely.
//  */
// export const updateTransactionSchema = baseTransactionSchema.partial().transform((data) => {
//   // If field missing, don’t normalize it.
//   const out = { ...data };

//   if (typeof out.category === "string") {
//     const catKey = normalizeKey(out.category);
//     out.category =
//       catKey === "custom" && out.customCategory ? out.customCategory.trim() : out.category.trim();
//   }

//   if (typeof out.paymentMethod === "string") {
//     let pm = normalizeKey(out.paymentMethod);
//     if (pm === "custom" && out.customPaymentMethod) pm = normalizeKey(out.customPaymentMethod);
//     out.paymentMethod = pm;
//   }

//   return out;
// });
import { z } from "zod";

const FIXED_CATEGORIES = [
  "food",
  "rent",
  "transport",
  "shopping",
  "entertainment",
  "health",
  "education",
  "bills",
  "salary",
  "investment",
  "other",
  "custom",
];

const FIXED_PAYMENT_METHODS = [
  "cash",
  "card",
  "upi",
  "bank_transfer",
  "other",
  "custom",
];

function normalizeText(value) {
  return String(value || "").trim();
}

function normalizeKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
}

function parseFlexibleDate(value) {
  if (value instanceof Date) return value;
  if (typeof value !== "string") return null;

  const v = value.trim();

  // ISO or YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}(T.*)?$/.test(v)) {
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  }

  // DD-MM-YYYY
  const m = v.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (m) {
    const dd = Number(m[1]);
    const mm = Number(m[2]);
    const yyyy = Number(m[3]);
    const d = new Date(yyyy, mm - 1, dd);
    return isNaN(d.getTime()) ? null : d;
  }

  return null;
}

const baseTransactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.coerce.number().positive("Amount must be > 0"),

  // dropdown value
  category: z.string().min(1, "Category is required").max(60).transform(normalizeText),
  // custom input when category === "custom"
  customCategory: z.string().max(60).optional(),

  date: z.preprocess((val) => parseFlexibleDate(val), z.date()),

  paymentMethod: z
    .string()
    .optional()
    .transform((v) => (v ? normalizeKey(v) : undefined)),

  customPaymentMethod: z.string().max(60).optional(),

  notes: z.string().max(500).optional(),
});

export const createTransactionSchema = baseTransactionSchema.transform((data) => {
  const categoryKey = normalizeKey(data.category);

  // enforce fixed list + allow custom
  if (!FIXED_CATEGORIES.includes(categoryKey)) {
    // allow user to directly type any category (if your UI uses input field)
    // we keep it as typed
  }

  const finalCategory =
    categoryKey === "custom" && data.customCategory
      ? normalizeText(data.customCategory)
      : normalizeText(data.category);

  let pm = data.paymentMethod ? normalizeKey(data.paymentMethod) : "other";

  // allow "bank transfer" too (normalizeKey handles it)
  if (!FIXED_PAYMENT_METHODS.includes(pm) && pm !== "custom") {
    // allow any typed method if you want
    // keep normalized key
  }

  if (pm === "custom") {
    pm = data.customPaymentMethod ? normalizeKey(data.customPaymentMethod) : "other";
  }

  return {
    ...data,
    category: finalCategory,
    paymentMethod: pm,
  };
});

export const updateTransactionSchema = baseTransactionSchema.partial().transform((data) => {
  const out = { ...data };

  if (typeof out.category === "string") {
    const k = normalizeKey(out.category);
    out.category =
      k === "custom" && out.customCategory
        ? normalizeText(out.customCategory)
        : normalizeText(out.category);
  }

  if (typeof out.paymentMethod === "string") {
    let pm = normalizeKey(out.paymentMethod);
    if (pm === "custom") {
      pm = out.customPaymentMethod ? normalizeKey(out.customPaymentMethod) : "other";
    }
    out.paymentMethod = pm;
  }

  return out;
});
