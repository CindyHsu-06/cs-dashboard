"use client";

import { Doughnut } from "react-chartjs-2";
import { DayData } from "@/lib/fetchData";

const COLORS = [
  "#3b82f6", "#22c55e", "#eab308", "#ef4444",
  "#a855f7", "#06b6d4", "#f97316", "#ec4899",
];

interface Props {
  days: DayData[];
  platformNames: string[];
}

export default function PieChart({ days, platformNames }: Props) {
  const totals = platformNames.map((name) =>
    days.reduce((sum, d) => sum + (d.platforms[name] ?? 0), 0)
  );
  const total = totals.reduce((s, v) => s + v, 0);

  return (
    <div className="bg-[#1a1d2e] rounded-xl p-4 md:p-6 border border-[#2a2e45]">
      <h3 className="text-lg font-semibold mb-4 text-white">平台佔比</h3>
      <div className="h-[280px] flex items-center justify-center">
        <Doughnut
          data={{
            labels: platformNames,
            datasets: [
              {
                data: totals,
                backgroundColor: COLORS.slice(0, platformNames.length),
                borderColor: "#1a1d2e",
                borderWidth: 3,
                hoverOffset: 8,
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            cutout: "55%",
            plugins: {
              legend: {
                position: "right",
                labels: { padding: 12, usePointStyle: true, pointStyle: "circle" },
              },
              tooltip: {
                backgroundColor: "#1a1d2e",
                borderColor: "#2a2e45",
                borderWidth: 1,
                callbacks: {
                  label: (ctx) => {
                    const val = ctx.parsed;
                    const pct = total > 0 ? ((val / total) * 100).toFixed(1) : "0";
                    return ` ${ctx.label}: ${val} 筆 (${pct}%)`;
                  },
                },
              },
            },
          }}
        />
      </div>
    </div>
  );
}
