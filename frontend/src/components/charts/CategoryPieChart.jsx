import React, { useMemo } from "react";
import {
  PieChart,
  Pie,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";

const COLORS = [
  "#60a5fa", // blue
  "#34d399", // green
  "#f472b6", // pink
  "#fbbf24", // amber
  "#a78bfa", // purple
  "#fb7185", // rose
  "#22c55e", // emerald
  "#38bdf8", // sky
];

export default function CategoryPieChart({ data = [] }) {
  // Ensure valid shape: [{ name: "Food", value: 1200 }, ...]
  const cleaned = useMemo(() => {
    return (Array.isArray(data) ? data : [])
      .map((d) => ({
        name: d?.name ?? d?.category ?? "Other",
        value: Number(d?.value ?? d?.amount ?? 0),
      }))
      .filter((d) => d.value > 0);
  }, [data]);

  const isEmpty = cleaned.length === 0;

  return (
    <div className="w-full h-64">
      {isEmpty ? (
        <div className="h-full flex items-center justify-center text-slate-400 text-sm">
          No expense category data for this month.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={cleaned}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={95}
              innerRadius={45}
              paddingAngle={2}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {cleaned.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  stroke="rgba(15,23,42,0.6)"
                />
              ))}
            </Pie>

            <Tooltip
              formatter={(value) => [`₹${Number(value).toLocaleString("en-IN")}`, "Amount"]}
              contentStyle={{
                background: "#ffffff",
                border: "1px solid rgba(148,163,184,0.25)",
                borderRadius: 12,
                color: "#e2e8f0",
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
