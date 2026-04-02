"use client";

import { Doughnut } from "react-chartjs-2";
import { DayData } from "@/lib/fetchData";

const PLATFORM_COLORS = [
  "#3b82f6", "#22c55e", "#eab308", "#ef4444",
];

const BRAND_COLORS = [
  "#a855f7", "#06b6d4", "#f97316", "#ec4899",
  "#84cc16", "#14b8a6", "#f43f5e", "#8b5cf6",
  "#fb923c", "#2dd4bf", "#e879f9", "#fbbf24",
];

interface Props {
  days: DayData[];
  platformNames: string[];
  brandNames: string[];
  selectedLines: string[];
}

export default function PieChart({ days, platformNames, brandNames, selectedLines }: Props) {
  // Build labels + totals based on what's selected
  const entries: { label: string; total: number; color: string }[] = [];

  // Always include platforms
  platformNames.forEach((name, i) => {
    const total = days.reduce((sum, d) => sum + (d.platforms[name] ?? 0), 0);
    entries.push({ label: name, total, color: PLATFORM_COLORS[i % PLATFORM_COLORS.length] });
  });

  // Include selected brands
  const selectedBrandKeys = selectedLines.filter((k) => k.startsWith("b_"));
  selectedBrandKeys.forEach((key) => {
    const name = key.slice(2); // remove "b_" prefix
    const bi = brandNames.indexOf(name);
    if (bi === -1) return;
    const total = days.reduce((sum, d) => sum + (d.brands[name] ?? 0), 0);
    entries.push({ label: `mo+_${name}`, total, color: BRAND_COLORS[bi % BRAND_COLORS.length] });
  });

  const grandTotal = entries.reduce((s, e) => s + e.total, 0);
  const hasSelectedBrands = selectedBrandKeys.length > 0;

  return (
    <div className="bg-[#1a1d2e] rounded-xl p-4 md:p-6 border border-[#2a2e45]">
      <h3 className="text-lg font-semibold mb-4 text-white">
        {hasSelectedBrands ? "平台 + mo+ 佔比" : "平台佔比"}
      </h3>
      <div className="h-[380px] flex items-center justify-center">
        <Doughnut
          data={{
            labels: entries.map((e) => e.label),
            datasets: [{
              data: entries.map((e) => e.total),
              backgroundColor: entries.map((e) => e.color),
              borderColor: "#1a1d2e",
              borderWidth: 3,
              hoverOffset: 8,
            }],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            cutout: "55%",
            plugins: {
              legend: {
                position: "bottom",
                labels: { padding: 10, usePointStyle: true, pointStyle: "circle", font: { size: 11 } },
              },
              tooltip: {
                backgroundColor: "#1a1d2e",
                borderColor: "#2a2e45",
                borderWidth: 1,
                callbacks: {
                  label: (ctx) => {
                    const val = ctx.parsed;
                    const pct = grandTotal > 0 ? ((val / grandTotal) * 100).toFixed(1) : "0";
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
