import Transaction from "../models/Transaction.js";

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function startOfMonth(d) {
  const x = new Date(d);
  x.setDate(1);
  x.setHours(0, 0, 0, 0);
  return x;
}

/**
 * Light AI anomaly engine (stats-based, explainable)
 *
 * Returns a list of anomalies:
 * { type, title, message, severity, meta }
 *
 * Notes:
 * - Uses last 90 days of expense data as baseline.
 * - Explainable thresholds, no ML dependencies.
 */
export async function detectAnomalies({ userId, transaction, opts = {} }) {
  const {
    highValueMultiplier = 2.5,  // txn amount > avg * 2.5
    categorySpikeMultiplier = 3, // MTD category spend > avg * 3
    frequencySpikeCount = 5,     // >= 5 txns in a day
    windowDays = 90,
  } = opts;

  const anomalies = [];
  const txn = transaction;

  // Only analyze expenses for spending anomalies
  if (!txn || txn.type !== "expense") return anomalies;

  const since = new Date();
  since.setDate(since.getDate() - windowDays);

  const txns = await Transaction.find({
    userId,
    type: "expense",
    date: { $gte: since },
  }).lean();

  if (txns.length < 5) return anomalies;

  const amounts = txns.map((t) => Number(t.amount || 0)).filter((x) => x > 0);
  const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;

  const amount = Number(txn.amount || 0);

  // 1) High-value transaction
  if (avg > 0 && amount > avg * highValueMultiplier) {
    anomalies.push({
      type: "HIGH_VALUE",
      title: "Unusual High-Value Transaction",
      message: `₹${amount} is much higher than your average spend (₹${avg.toFixed(0)}).`,
      severity: amount > avg * 4 ? "critical" : "warning",
      meta: { amount, avg, ratio: amount / avg },
    });
  }

  // 2) Category spike (month-to-date)
  const monthStart = startOfMonth(txn.date);
  const cat = txn.category || "Uncategorized";

  const catAll = txns.filter((t) => (t.category || "Uncategorized") === cat);
  const catAvg =
    catAll.reduce((s, t) => s + Number(t.amount || 0), 0) / Math.max(catAll.length, 1);

  const catMtd = txns
    .filter(
      (t) =>
        (t.category || "Uncategorized") === cat &&
        new Date(t.date) >= monthStart &&
        new Date(t.date) <= new Date(txn.date)
    )
    .reduce((s, t) => s + Number(t.amount || 0), 0);

  if (catAvg > 0 && catMtd > catAvg * categorySpikeMultiplier) {
    anomalies.push({
      type: "CATEGORY_SPIKE",
      title: "Category Spending Spike",
      message: `Spending in "${cat}" is unusually high this month.`,
      severity: "warning",
      meta: { category: cat, monthToDate: catMtd, avg: catAvg, ratio: catMtd / catAvg },
    });
  }

  // 3) Frequency spike (today)
  const dayStart = startOfDay(txn.date);
  const todayCount = txns.filter((t) => new Date(t.date) >= dayStart).length;

  if (todayCount >= frequencySpikeCount) {
    anomalies.push({
      type: "FREQUENCY_SPIKE",
      title: "High Transaction Frequency",
      message: "You’ve made many transactions today compared to usual.",
      severity: "info",
      meta: { todayCount },
    });
  }

  return anomalies;
}
