import Goal from "../models/Goal.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";

function startOfUTCDay(d) {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}

function toYMD(d) {
  return new Date(d).toISOString().slice(0, 10); // YYYY-MM-DD
}

export async function runGoalDeadlineReminders() {
  const today = startOfUTCDay(new Date());

  const goals = await Goal.find({
    status: { $ne: "completed" },
    deadline: { $exists: true, $ne: null },
  }).lean();

  if (!goals.length) return;

  // Filter goals with valid userId
  const validGoals = goals.filter(g => g.userId);

  // Respect per-user notification preferences
  const userIds = [...new Set(validGoals.map((g) => String(g.userId)))];
  const users = await User.find({ _id: { $in: userIds } }).select("settings").lean();
  const userPref = new Map(users.map((u) => [String(u._id), u.settings || {}]));

  for (const g of validGoals) {
    const s = userPref.get(String(g.userId)) || {};
    const notif = s.notifications || {};
    if (notif.enabled === false) continue;
    if (notif.goalReminders === false) continue;

    const deadline = startOfUTCDay(g.deadline);
    const diffDays = Math.round((deadline - today) / (1000 * 60 * 60 * 24));
    const dueDate = toYMD(deadline);

    // ✅ future reminders
    if ([7, 3, 1, 0].includes(diffDays)) {
      const key = `goal:${g._id}:deadline:${diffDays}:date:${dueDate}`;

      const title =
        diffDays === 0
          ? "Goal Deadline: Today"
          : `Goal Deadline: ${diffDays} day${diffDays === 1 ? "" : "s"} left`;

      const message =
        diffDays === 0
          ? `Your goal "${g.title}" is due today (${dueDate}).`
          : `Your goal "${g.title}" is due on ${dueDate}. Only ${diffDays} day${
              diffDays === 1 ? "" : "s"
            } left.`;

      await Notification.updateOne(
        { dedupeKey: key },
        {
          $setOnInsert: {
            userId: g.userId,
            kind: "goal_deadline",
            severity: diffDays <= 1 ? "warning" : "info",
            title,
            message,
            read: false,
            dedupeKey: key,
            meta: { goalId: g._id, deadline: dueDate, daysLeft: diffDays },
          },
        },
        { upsert: true }
      );

      continue;
    }

    // ✅ overdue reminder (send ONCE when it becomes overdue)
    if (diffDays < 0) {
      const overdueDays = Math.abs(diffDays);
      const key = `goal:${g._id}:overdue:first:${dueDate}`;

      const title = "Goal Overdue";
      const message = `Your goal "${g.title}" is overdue by ${overdueDays} day${
        overdueDays === 1 ? "" : "s"
      } (deadline was ${dueDate}).`;

      await Notification.updateOne(
        { dedupeKey: key },
        {
          $setOnInsert: {
            userId: g.userId,
            kind: "goal_deadline",
            severity: "critical",
            title,
            message,
            read: false,
            dedupeKey: key,
            meta: { goalId: g._id, deadline: dueDate, overdueDays },
          },
        },
        { upsert: true }
      );
    }
  }
}
