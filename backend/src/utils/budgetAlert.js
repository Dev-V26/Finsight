import Budget from "../models/Budget.js";
import Transaction from "../models/Transaction.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";

function formatMoney(amount, currency = "INR") {
  const n = Number(amount) || 0;
  const cur = String(currency || "INR").toUpperCase();
  try {
    const locale = cur === "INR" ? "en-IN" : "en-US";
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: cur,
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `${n.toFixed(0)} ${cur}`;
  }
}

export async function runBudgetAlertsForMonth({ userId, month }) {
  if (!userId || !month) return;

  // Respect user notification preferences
  const user = await User.findById(userId).select("settings currency").lean();
  const notif = user?.settings?.notifications || {};
  const pref = user?.settings?.preferences || {};

  const notificationsEnabled = notif.enabled !== false;
  const budgetAlertsEnabled = notif.budgetAlerts !== false;
  if (!notificationsEnabled || !budgetAlertsEnabled) return;

  const threshold = Math.min(Math.max(Number(notif.budgetThreshold ?? 80), 1), 99);
  const currency = String(pref.currency || user?.currency || "INR").toUpperCase();

  const budgets = await Budget.find({ userId, month }).lean();
  if (!budgets.length) return;

  // month range
  const start = new Date(`${month}-01T00:00:00.000Z`);
  const end = new Date(new Date(start).setMonth(start.getMonth() + 1));

  const usage = await Transaction.aggregate([
    {
      $match: {
        userId,
        type: "expense",
        date: { $gte: start, $lt: end },
      },
    },
    { $group: { _id: "$category", used: { $sum: "$amount" } } },
  ]);

  const usageMap = Object.fromEntries(usage.map((u) => [u._id, u.used]));

  for (const b of budgets) {
    const used = Number(usageMap[b.category] || 0);
    const amount = Number(b.amount || 0);
    if (amount <= 0) continue;

    const percent = (used / amount) * 100;

    // ✅ Threshold warning (only once)
    if (percent >= threshold && percent < 100) {
      const bucket = `${threshold}`;
      const dedupeKey = `budget:${b._id}:${month}:${bucket}`;

      await Notification.updateOne(
        { dedupeKey },
        {
          $setOnInsert: {
            userId,
            kind: "budget_warning",
            severity: "warning",
            title: `Budget Alert (${threshold}%)`,
            message: `${b.category} budget reached ${Math.floor(percent)}% (${formatMoney(
              used,
              currency
            )} / ${formatMoney(amount, currency)}) for ${month}.`,
            read: false,
            dedupeKey,
            meta: {
              month,
              category: b.category,
              budgetId: b._id,
              used,
              amount,
              percent: Math.floor(percent),
              threshold,
            },
          },
        },
        { upsert: true }
      );
    }

    // ✅ 100% exceeded (only once)
    if (percent >= 100) {
      const dedupeKey = `budget:${b._id}:${month}:100`;

      await Notification.updateOne(
        { dedupeKey },
        {
          $setOnInsert: {
            userId,
            kind: "budget_exceeded",
            severity: "critical",
            title: "Budget Exceeded",
            message: `${b.category} budget exceeded! Used ${formatMoney(
              used,
              currency
            )} / ${formatMoney(amount, currency)} for ${month}.`,
            read: false,
            dedupeKey,
            meta: {
              month,
              category: b.category,
              budgetId: b._id,
              used,
              amount,
              percent: Math.floor(percent),
            },
          },
        },
        { upsert: true }
      );
    }
  }
}
