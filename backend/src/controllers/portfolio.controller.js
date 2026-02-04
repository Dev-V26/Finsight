import Holding from "../models/Holding.js";
import { validateHoldingPayload } from "../validators/portfolio.validation.js";

function computeSummary(holdings = []) {
  let investedTotal = 0;
  let currentValueTotal = 0;

  const allocation = { EQUITY: 0, DEBT: 0, CRYPTO: 0, OTHER: 0 };

  for (const h of holdings) {
    const buy = Number(h.buyPrice || 0);
    const qty = Number(h.quantity || 0);
    const invested = buy * qty;

    const current = Number(h.currentValue || 0);

    investedTotal += invested;
    currentValueTotal += current;

    const bucket = String(h.allocation || "OTHER").toUpperCase();
    if (allocation[bucket] === undefined) allocation.OTHER += current;
    else allocation[bucket] += current;
  }

  const profitLoss = currentValueTotal - investedTotal;
  const profitLossPct = investedTotal ? (profitLoss / investedTotal) * 100 : 0;

  return {
    investedTotal,
    currentValueTotal,
    profitLoss,
    profitLossPct,
    allocation,
  };
}

export async function listHoldings(req, res) {
  try {
    const userId = req.user._id;
    const { holdingType, allocation } = req.query;

    const q = { userId };

    if (holdingType) q.holdingType = String(holdingType).toUpperCase();
    if (allocation) q.allocation = String(allocation).toUpperCase();

    const holdings = await Holding.find(q).sort({ createdAt: -1 });
    return res.json({ holdings });
  } catch (err) {
    console.error("listHoldings error:", err);
    return res.status(500).json({ message: "Failed to load holdings" });
  }
}

export async function createHolding(req, res) {
  try {
    const userId = req.user._id;

    const { ok, errors, normalized } = validateHoldingPayload(req.body);
    if (!ok) return res.status(400).json({ message: errors.join(", ") });

    const doc = await Holding.create({ userId, ...normalized });
    return res.status(201).json({ holding: doc });
  } catch (err) {
    console.error("createHolding error:", err);
    return res.status(500).json({ message: "Failed to create holding" });
  }
}

export async function updateHolding(req, res) {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const holding = await Holding.findOne({ _id: id, userId });
    if (!holding) return res.status(404).json({ message: "Holding not found" });

    const { ok, errors, normalized } = validateHoldingPayload(req.body);
    if (!ok) return res.status(400).json({ message: errors.join(", ") });

    holding.holdingType = normalized.holdingType;
    holding.allocation = normalized.allocation;
    holding.name = normalized.name;
    holding.symbol = normalized.symbol;
    holding.notes = normalized.notes;
    holding.buyPrice = normalized.buyPrice;
    holding.quantity = normalized.quantity;
    holding.currentValue = normalized.currentValue;

    await holding.save();

    return res.json({ holding });
  } catch (err) {
    console.error("updateHolding error:", err);
    return res.status(500).json({ message: "Failed to update holding" });
  }
}

export async function deleteHolding(req, res) {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const holding = await Holding.findOneAndDelete({ _id: id, userId });
    if (!holding) return res.status(404).json({ message: "Holding not found" });

    return res.json({ success: true });
  } catch (err) {
    console.error("deleteHolding error:", err);
    return res.status(500).json({ message: "Failed to delete holding" });
  }
}

export async function getPortfolioSummary(req, res) {
  try {
    const userId = req.user._id;
    const holdings = await Holding.find({ userId });

    const summary = computeSummary(holdings);

    return res.json({
      summary,
      count: holdings.length,
    });
  } catch (err) {
    console.error("getPortfolioSummary error:", err);
    return res.status(500).json({ message: "Failed to load portfolio summary" });
  }
}

// Useful export for Insights controller reuse
export async function buildPortfolioSnapshot(userId) {
  const holdings = await Holding.find({ userId });
  return computeSummary(holdings);
}
