export function validateHoldingPayload(payload = {}) {
  const errors = [];

  const holdingType = String(payload.holdingType || "").toUpperCase();
  const allocation = String(payload.allocation || "").toUpperCase();
  const name = String(payload.name || "").trim();

  const buyPrice = Number(payload.buyPrice);
  const quantity = Number(payload.quantity);
  const currentValue = Number(payload.currentValue);

  const validHoldingTypes = ["STOCK", "MUTUAL_FUND", "CRYPTO", "MANUAL"];
  const validAllocations = ["EQUITY", "DEBT", "CRYPTO", "OTHER"];

  if (!validHoldingTypes.includes(holdingType)) {
    errors.push("holdingType must be one of STOCK, MUTUAL_FUND, CRYPTO, MANUAL");
  }
  if (!validAllocations.includes(allocation)) {
    errors.push("allocation must be one of EQUITY, DEBT, CRYPTO, OTHER");
  }
  if (!name) errors.push("name is required");

  if (!Number.isFinite(buyPrice) || buyPrice < 0) errors.push("buyPrice must be a number >= 0");
  if (!Number.isFinite(quantity) || quantity < 0) errors.push("quantity must be a number >= 0");
  if (!Number.isFinite(currentValue) || currentValue < 0) errors.push("currentValue must be a number >= 0");

  return { ok: errors.length === 0, errors, normalized: {
    holdingType,
    allocation,
    name,
    symbol: String(payload.symbol || "").trim(),
    notes: String(payload.notes || "").trim(),
    buyPrice,
    quantity,
    currentValue,
  }};
}
