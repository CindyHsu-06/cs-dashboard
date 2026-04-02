"use client";

import { Line, Doughnut, Bar } from "react-chartjs-2";
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

export default function BrandCharts({ days, brandNames }: Props) {
  const brandTotals = brandNames.map((name) =>
    days.reduce((sum, d) => sum + (d.brands[name] ?? 0), 0)
  );
  const sorted = brandNames
    .map((name, i) => ({ name, total: brandTotals[i] }))
    .sort((a, b) => b.total - a.total);

  // Only show brands with data for pie chart
  const withData = sorted.filter((s) => s.total > 0);
  const labels = days.map((d) => d.date);

  return (
    <div className="space-y-6">
      <div className="bg-[#1a1d2e] rounded-xl p-4 md:p-6 border border-[#2a2e45]">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white">mo+ 品牌進線排行</h3>
          <p className="text-xs text-[#8b8fa3] mt-1">以下品牌皆隸屬 MOMO（mo+）平台旗下賣場</p>
        </div>
        <div className="h-[350px]">
          <Bar
            data={{
              labels: sorted.map((s) => s.name),
              datasets: [{
                label: "進線數",
                data: sorted.map((s) => s.total),
                backgroundColor: sorted.map((_, i) => COLORS[i % COLORS.length]),
                borderRadius: 6,
                borderSkipped: false,
                maxBarThickness: 36,
              }],
            }}
            options={{
              responsive: true, maintainAspectRatio: false, indexAxis: "y",
              plugins: {
                legend: { display: false },
                tooltip: { backgroundColor: "#1a1d2e", borderColor: "#2a2e45", borderWidth: 1, callbacks: { label: (ctx) => ` ${ctx.parsed.x} 筆` } },
              },
              scales: { x: { beginAtZero: true, grid: { color: "#2a2e4530" } }, y: { grid: { display: false } } },
            }}
          />
        </div>
      </div>

      {/* Trend + Pie Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Brand Trend Line Chart */}
        <div className="lg:col-span-2 bg-[#1a1d2e] rounded-xl p-4 md:p-6 border border-[#2a2e45]">
          <h3 className="text-lg font-semibold mb-4 text-white">mo+ 品牌每日趨勢</h3>
          <div className="h-[300px]">
            <Line
              data={{
                labels,
                datasets: withData.length > 0
                  ? withData.map((b, i) => ({
                      label: b.name,
                      data: days.map((d) => d.brands[b.name] ?? 0),
                      borderColor: COLORS[i % COLORS.length],
                      backgroundColor: COLORS[i % COLORS.length] + "20",
                      borderWidth: 2,
                      pointRadius: 3,
                      tension: 0.3,
                      fill: false,
                    }))
                  : [{
                      label: "無資料",
                      data: days.map(() => 0),
                      borderColor: "#3a3e55",
                      borderWidth: 1,
                    }],
              }}
              options={{
                responsive: true, maintainAspectRatio: false,
                interaction: { mode: "index", intersect: false },
                plugins: {
                  legend: { position: "bottom", labels: { padding: 12, usePointStyle: true, pointStyle: "circle" } },
                  tooltip: { backgroundColor: "#1a1d2e", borderColor: "#2a2e45", borderWidth: 1 },
                },
                scales: { x: { grid: { display: false } }, y: { beginAtZero: true, grid: { color: "#2a2e4530" } } },
              }}
            />
          </div>
        </div>

        {/* Brand Pie Chart */}
        <div className="bg-[#1a1d2e] rounded-xl p-4 md:p-6 border border-[#2a2e45]">
          <h3 className="text-lg font-semibold mb-4 text-white">mo+ 品牌佔比</h3>
          <div className="h-[300px] flex items-center justify-center">
            {withData.length > 0 ? (
              <Doughnut
                data={{
                  labels: withData.map((s) => s.name),
                  datasets: [{
                    data: withData.map((s) => s.total),
                    backgroundColor: COLORS.slice(0, withData.length),
                    borderColor: "#1a1d2e",
                    borderWidth: 3,
                    hoverOffset: 8,
                  }],
                }}
                options={{
                  responsive: true, maintainAspectRatio: false, cutout: "55%",
                  plugins: {
                    legend: { position: "right", labels: { padding: 12, usePointStyle: true, pointStyle: "circle" } },
                    tooltip: {
                      backgroundColor: "#1a1d2e", borderColor: "#2a2e45", borderWidth: 1,
                      callbacks: {
                        label: (ctx) => {
                          const total = withData.reduce((s, v) => s + v.total, 0);
                          const pct = total > 0 ? ((ctx.parsed / total) * 100).toFixed(1) : "0";
                          return ` ${ctx.label}: ${ctx.parsed} 筆 (${pct}%)`;
                        },
                      },
                    },
                  },
                }}
              />
            ) : (
              <p className="text-[#8b8fa3] text-sm">尚無品牌進線資料</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
