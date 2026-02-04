import { downloadCSV, downloadMonthlyPDF } from "../../api/reports.api";

export default function Reports() {
  const month = new Date().toISOString().slice(0, 7);

  return (
    <div className="space-y-4">
      <h1>Reports & Exports</h1>

      <button onClick={() => downloadCSV("")}>
        Download Transactions CSV
      </button>

      <button onClick={() => downloadMonthlyPDF(month)}>
        Download Monthly PDF
      </button>
    </div>
  );
}
