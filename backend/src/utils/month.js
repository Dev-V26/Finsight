export function toMonthKey(date) {
  const d = new Date(date);
  // YYYY-MM in UTC (stable)
  return d.toISOString().slice(0, 7);
}
