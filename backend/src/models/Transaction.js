import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    type: { type: String, enum: ["income", "expense"], required: true },

    amount: { type: Number, required: true, min: 0 },

    category: { type: String, required: true, trim: true },

    date: { type: Date, required: true, index: true },

    paymentMethod: {
      type: String,
      enum: ["cash", "card", "upi", "bank_transfer", "other"],
      default: "other"
    },

    notes: { type: String, default: "", trim: true, maxlength: 500 }
  },
  { timestamps: true }
);

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
