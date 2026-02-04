// Lightweight money formatter that uses Settings if available.

function pickLocale(currency) {
  const c = String(currency || "INR").toUpperCase();
  if (c === "INR") return "en-IN";
  return "en-US";
}

export function formatMoney(amount, opts = {}) {
  const n = Number(amount) || 0;
  const currency = String(opts.currency || "INR").toUpperCase();
  const locale = opts.locale || pickLocale(currency);

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `${n.toFixed(0)} ${currency}`;
  }
}
