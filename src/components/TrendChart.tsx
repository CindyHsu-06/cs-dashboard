"use client";

import { Line } from "react-chartjs-2";
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

export default function TrendChart({ days, platformNames, brandNames, selectedLines }: Props) {
  const labels = days.map((d) => d.date);

  // Build all available lines
  const allLines: { key: string; label: string; getData: (d: DayData) => number; color: string; dashed: boolean }[] = [];

  platformNames.forEach((name, i) => {
    allLines.push({
      key: `p_${name}`,
      label: name,
      getData: (d) => d.platforms[name] ?? 0,
      color: PLATFORM_COLORS[i % PLATFORM_COLORS.length],
      dashed: false,
    });
  });

  brandNames.forEach((name, i) => {
    allLines.push({
      key: `b_${name}`,
      label: `mo+_${name}`,
      getData: (d) => d.brands[name] ?? 0,
      color: BRAND_COLORS[i % BRAND_COLORS.length],
      dashed: true,
    });
  });

  const activeLines = selectedLines.length > 0
    ? allLines.filter((l) => selectedLines.includes(l.key))
    : allLines; // show all if nothing selected

  const datasets = activeLines.map((line) => ({
    label: line.label,
    data: days.map(line.getData),
    borderColor: line.color,
    backgroundColor: line.color + "20",
    borderWidth: 2,
    pointRadius: 3,
    pointHoverRadius: 6,
    tension: 0.3,
    fill: false,
    borderDash: line.dashed ? [5, 3] : [],
  }));

  // Always add total line
  datasets.unshift({
    label: "每日總計",
    data: days.map((d) => d.dailyTotal),
    borderColor: "#ffffff",
    backgroundColor: "#ffffff20",
    borderWidth: 2.5,
    pointRadius: 4,
    pointHoverRadius: 7,
    tension: 0.3,
    fill: false,
    borderDash: [],
  });

  return (
    <div className="bg-[#1a1d2e] rounded-xl p-4 md:p-6 border border-[#2a2e45]">
      <h3 className="text-lg font-semibold mb-4 text-white">每日進線趨勢</h3>
      <div className="h-[300px] md:h-[400px]">
        <Line
          data={{ labels, datasets }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: "index", intersect: false },
            plugins: {
              legend: {
                position: "bottom",
                labels: {
                  padding: 12,
                  usePointStyle: true,
                  pointStyle: "circle",
                  font: { size: 11 },
                },
              },
              tooltip: {
                backgroundColor: "#1a1d2e",
                borderColor: "#2a2e45",
                borderWidth: 1,
                padding: 12,
                titleColor: "#e4e6f0",
                bodyColor: "#8b8fa3",
              },
            },
            scales: {
              x: { grid: { display: false } },
              y: { beginAtZero: true, grid: { color: "#2a2e4530" } },
            },
          }}
        />
      </div>
    </div>
  );
}
