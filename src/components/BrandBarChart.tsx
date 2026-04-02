"use client";

import { Bar } from "react-chartjs-2";
import { DayData } from "@/lib/fetchData";

const COLORS = [
  "#3b82f6", "#22c55e", "#eab308", "#ef4444",
  "#a855f7", "#06b6d4", "#f97316", "#ec4899",
  "#84cc16", "#14b8a6", "#f43f5e", "#8b5cf6",
];

interface Props {
  days: DayData[];
  brandNames: string[];
}

export default function BrandBarChart({ days, brandNames }: Props) {
  const brandTotals = brandNames.map((name) =>
    days.reduce((sum, d) => sum + (d.brands[name] ?? 0), 0)
  );

  // Sort descending
  const sorted = brandNames
    .map((name, i) => ({ name, total: brandTotals[i] }))
    .sort((a, b) => b.total - a.total);

  return (
    <div className="bg-[#1a1d2e] rounded-xl p-4 md:p-6 border border-[#2a2e45]">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">mo+ 品牌進線排行</h3>
        <p className="text-xs text-[#8b8fa3] mt-1">以下品牌皆隸屬 MOMO（mo+）平台旗下賣場</p>
      </div>
      <div className="h-[350px]">
        <Bar
          data={{
            labels: sorted.map((s) => s.name),
            datasets: [
              {
                label: "進線數",
                data: sorted.map((s) => s.total),
                backgroundColor: sorted.map((_, i) => COLORS[i % COLORS.length]),
                borderRadius: 6,
                borderSkipped: false,
                maxBarThickness: 36,
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: "y",
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: "#1a1d2e",
                borderColor: "#2a2e45",
                borderWidth: 1,
                callbacks: {
                  label: (ctx) => ` ${ctx.parsed.x} 筆`,
                },
              },
            },
            scales: {
              x: { beginAtZero: true, grid: { color: "#2a2e4530" } },
              y: { grid: { display: false } },
            },
          }}
        />
      </div>
    </div>
  );
}
