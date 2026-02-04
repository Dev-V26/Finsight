import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    kind: {
      type: String,
      enum: ["budget_warning", "budget_exceeded", "goal_deadline", "unusual_activity", "system"],
      required: true,
      index: true,
    },

    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },

    // keep legacy severity levels used elsewhere in the app
    severity: { type: String, enum: ["info", "warning", "critical"], default: "info" },

    read: { type: Boolean, default: false, index: true },

    // used to prevent duplicates (one per event)
    dedupeKey: { type: String, required: true, unique: true },

    meta: {
      month: { type: String },        // YYYY-MM
      category: { type: String },
      budgetId: { type: mongoose.Schema.Types.ObjectId, ref: "Budget" },
      used: { type: Number },
      amount: { type: Number },
      percent: { type: Number },

      // anomaly specific
      transactionId: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction" },
      anomalyType: { type: String },
      avg: { type: Number },
      ratio: { type: Number },
      todayCount: { type: Number },
      monthToDate: { type: Number },
    },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
