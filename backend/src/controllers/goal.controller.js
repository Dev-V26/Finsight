import Goal from "../models/Goal.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { created, ok, fail } from "../utils/apiResponse.js";
import { createGoalSchema } from "../validators/goal.validation.js";

export const listGoals = asyncHandler(async (req, res) => {
  const items = await Goal.find({ user: req.user._id }).sort({ createdAt: -1 });
  return ok(res, items);
});

export const createGoal = asyncHandler(async (req, res) => {
  const parsed = createGoalSchema.parse(req.body);

  const goal = await Goal.create({
    user: req.user._id,
    title: parsed.title,
    targetAmount: parsed.targetAmount,
    deadline: parsed.deadline,
    notes: parsed.notes,
  });

  return created(res, goal, "Goal created");
});

export const updateGoal = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const goal = await Goal.findOneAndUpdate(
    { _id: id, user: req.user._id },
    updates,
    { new: true }
  );

  if (!goal) return fail(res, "Goal not found", 404);

  return ok(res, goal);
});

export const deleteGoal = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const goal = await Goal.findOneAndDelete({ _id: id, user: req.user._id });

  if (!goal) return fail(res, "Goal not found", 404);

  return ok(res, { message: "Goal deleted" });
});