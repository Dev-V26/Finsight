import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

export default function IncomeExpenseChart({ month, income = 0, expense = 0 }) {
  const chartData = useMemo(() => {
    return [
      {
        label: month || "This Month",
        Income: Number(income || 0),
        Expense: Number(expense || 0),
      },
    ];
  }, [month, income, expense]);

  const isEmpty =
    !chartData.length ||
    (chartData[0].Income === 0 && chartData[0].Expense === 0);

  return (
    <div className="w-full h-64">
      {isEmpty ? (
        <div className="h-full flex items-center justify-center text-slate-400 text-sm">
          No income/expense data available for this month.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
            <XAxis dataKey="label" stroke="rgba(226,232,240,0.7)" />
            <YAxis stroke="rgba(226,232,240,0.7)" />
            <Tooltip
              contentStyle={{
                background: "#ffffff",
                border: "1px solid rgba(148,163,184,0.25)",
                borderRadius: 12,
                color: "#e2e8f0",
              }}
            />
            <Legend />
            {/* ✅ Add colors */}
            <Bar dataKey="Income" fill="#22c55e" radius={[8, 8, 0, 0]} />
            <Bar dataKey="Expense" fill="#ef4444" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
