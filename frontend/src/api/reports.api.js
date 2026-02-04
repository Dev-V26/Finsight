export const downloadCSV = (params = "") => {
  window.open(`/api/reports/transactions.csv${params}`, "_blank");
};

export const downloadMonthlyPDF = (month) => {
  window.open(`/api/reports/monthly.pdf?month=${month}`, "_blank");
};
