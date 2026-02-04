import mongoose from "mongoose";

const GoalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    targetAmount: { type: Number, required: true, min: 0 },
    currentAmount: { type: Number, default: 0, min: 0 },
    deadline: { type: String, default: "" }, // "YYYY-MM-DD"
    notes: { type: String, default: "" },
    status: { type: String, enum: ["active", "completed"], default: "active" },
  },
  { timestamps: true }
);

const Goal = mongoose.model("Goal", GoalSchema);

export default Goal;
