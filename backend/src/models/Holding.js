import mongoose from "mongoose";

const holdingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // What kind of holding
    holdingType: {
      type: String,
      enum: ["STOCK", "MUTUAL_FUND", "CRYPTO", "MANUAL"],
      required: true,
      index: true,
    },

    // Allocation bucket for dashboard (Equity vs Debt vs Crypto vs Others)
    allocation: {
      type: String,
      enum: ["EQUITY", "DEBT", "CRYPTO", "OTHER"],
      required: true,
      index: true,
    },

    // Display info
    name: { type: String, required: true, trim: true },
    symbol: { type: String, trim: true, default: "" }, // optional (e.g., TCS, BTC)
    notes: { type: String, trim: true, default: "" },

    // Buying info
    buyPrice: { type: Number, required: true, min: 0 }, // per unit (or total for MANUAL if qty=1)
    quantity: { type: Number, required: true, min: 0 }, // allow 0 but usually > 0

    // Manual current value for now (total value, not per unit)
    currentValue: { type: Number, required: true, min: 0 }, // TOTAL current value
  },
  { timestamps: true }
);

// Helpful virtuals (not stored)
holdingSchema.virtual("investedAmount").get(function () {
  const buy = Number(this.buyPrice || 0);
  const qty = Number(this.quantity || 0);
  return buy * qty;
});

holdingSchema.virtual("profitLoss").get(function () {
  const invested = Number(this.investedAmount || 0);
  const current = Number(this.currentValue || 0);
  return current - invested;
});

holdingSchema.virtual("profitLossPct").get(function () {
  const invested = Number(this.investedAmount || 0);
  if (!invested) return 0;
  return (Number(this.profitLoss || 0) / invested) * 100;
});

// Ensure virtuals show in JSON
holdingSchema.set("toJSON", { virtuals: true });
holdingSchema.set("toObject", { virtuals: true });

const Holding = mongoose.model("Holding", holdingSchema);

export default Holding;
