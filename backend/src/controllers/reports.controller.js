import Transaction from "../models/Transaction.js";
import Budget from "../models/Budget.js";
import Goal from "../models/Goal.js";
import Holding from "../models/Holding.js";

function escapeCsv(value) {
  if (value === null || value === undefined) return "";
  const s = String(value);
  // If it contains comma, quote, or newline, wrap in quotes and escape quotes
  if (/[",\n\r]/.test(s)) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function toDateISO(d) {
  try {
    return new Date(d).toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

function ymToRange(month) {
  const [y, m] = String(month).split("-").map(Number);
  if (!y || !m) return null;
  const start = new Date(y, m - 1, 1, 0, 0, 0, 0);
  const end = new Date(y, m, 1, 0, 0, 0, 0);
  return { start, end };
}

export const exportCSV = async (req, res) => {
  const filter = { userId: req.user._id };
  const { start, end, category, type } = req.query;

  if (type) filter.type = type;
  if (category) filter.category = category;
  if (start || end) {
    filter.date = {};
    if (start) filter.date.$gte = new Date(start);
    if (end) filter.date.$lte = new Date(end);
  }

  const txns = await Transaction.find(filter).sort({ date: -1 }).lean();

  const headers = ["date", "type", "category", "amount", "paymentMethod", "notes"];
  const rows = [headers.join(",")];

  for (const t of txns) {
    rows.push(
      [
        escapeCsv(toDateISO(t.date)),
        escapeCsv(t.type),
        escapeCsv(t.category || "Uncategorized"),
        escapeCsv(t.amount),
        escapeCsv(t.paymentMethod || ""),
        escapeCsv(t.notes || ""),
      ].join(",")
    );
  }

  const csv = rows.join("\n");

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="transactions.csv"');
  res.status(200).send(csv);
};

export const monthlyPDF = async (req, res) => {
  const month = req.query.month;
  if (!month) return res.status(400).json({ message: "month is required (YYYY-MM)" });

  const range = ymToRange(month);
  if (!range) return res.status(400).json({ message: "Invalid month format. Use YYYY-MM." });

  const { start, end } = range;

  const txns = await Transaction.find({
    userId: req.user._id,
    date: { $gte: start, $lt: end },
  }).lean();

  const income = txns.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount || 0), 0);
  const expense = txns.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount || 0), 0);

  const budgets = await Budget.find({ userId: req.user._id }).lean();
  const goals = await Goal.find({ userId: req.user._id }).lean();
  const portfolio = await Holding.find({ userId: req.user._id }).lean();

  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Monthly Report ${month}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 24px; }
    h1 { margin: 0 0 6px; }
    .muted { color: #666; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 14px; }
    .card { border: 1px solid #ddd; border-radius: 10px; padding: 12px; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th, td { border-bottom: 1px solid #eee; padding: 8px; text-align: left; font-size: 12px; }
    .kpi { font-size: 18px; font-weight: bold; }
  </style>
</head>
<body>
  <h1>Monthly Summary</h1>
  <div class="muted">Month: ${month}</div>

  <div class="grid">
    <div class="card">
      <div class="muted">Income</div>
      <div class="kpi">₹ ${income.toFixed(2)}</div>
    </div>
    <div class="card">
      <div class="muted">Expense</div>
      <div class="kpi">₹ ${expense.toFixed(2)}</div>
    </div>
  </div>

  <div class="card" style="margin-top: 14px;">
    <h3 style="margin:0;">Budgets</h3>
    ${
      budgets.length
        ? `<table><thead><tr><th>Category</th><th>Limit</th></tr></thead><tbody>
          ${budgets
            .map((b) => `<tr><td>${b.category || "Uncategorized"}</td><td>₹ ${Number(b.limit || 0).toFixed(2)}</td></tr>`)
            .join("")}
        </tbody></table>`
        : `<div class="muted" style="margin-top:8px;">No budgets found.</div>`
    }
  </div>

  <div class="card" style="margin-top: 14px;">
    <h3 style="margin:0;">Goals</h3>
    ${
      goals.length
        ? `<table><thead><tr><th>Goal</th><th>Target</th><th>Saved</th></tr></thead><tbody>
          ${goals
            .map(
              (g) =>
                `<tr><td>${g.title}</td><td>₹ ${Number(g.targetAmount || 0).toFixed(2)}</td><td>₹ ${Number(
                  g.currentAmount || 0
                ).toFixed(2)}</td></tr>`
            )
            .join("")}
        </tbody></table>`
        : `<div class="muted" style="margin-top:8px;">No goals found.</div>`
    }
  </div>

  <div class="card" style="margin-top: 14px;">
    <h3 style="margin:0;">Portfolio</h3>
    ${
      portfolio.length
        ? `<table><thead><tr><th>Name</th><th>Type</th><th>Qty</th></tr></thead><tbody>
          ${portfolio
            .map(
              (p) =>
                `<tr><td>${p.name}</td><td>${p.assetType}</td><td>${Number(p.quantity || 0).toFixed(4)}</td></tr>`
            )
            .join("")}
        </tbody></table>`
        : `<div class="muted" style="margin-top:8px;">No holdings found.</div>`
    }
  </div>

  <div class="muted" style="margin-top: 14px;">Generated by FinSight</div>
</body>
</html>`;

  // Dynamic import so missing puppeteer won't crash server startup
  let puppeteer;
  try {
    const mod = await import("puppeteer");
    puppeteer = mod.default || mod;
  } catch {
    return res.status(500).json({
      message:
        "PDF generator dependency missing. Please run: npm i puppeteer (inside backend folder).",
    });
  }

  let browser;
  try {
    browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdf = await page.pdf({ format: "A4", printBackground: true });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="monthly_report_${month}.pdf"`);
    return res.status(200).send(pdf);
  } catch (e) {
    return res.status(500).json({ message: "Failed to generate PDF", error: String(e?.message || e) });
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
};
