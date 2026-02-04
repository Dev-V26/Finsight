import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    month: {
      type: String, // YYYY-MM
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// one budget per category per month per user
budgetSchema.index({ userId: 1, category: 1, month: 1 }, { unique: true });

const Budget = mongoose.model("Budget", budgetSchema);

export default Budget;
