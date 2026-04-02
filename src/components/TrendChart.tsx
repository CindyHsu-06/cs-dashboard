"use client";

import { Line } from "react-chartjs-2";
import { DayData } from "@/lib/fetchData";

/* Muted, desaturated palette */
const PLATFORM_COLORS = [
  "#7c9ec4", // slate blue
  "#8bb89e", // sage green
  "#d4b873", // warm gold
  "#c48080", // dusty rose
];

const BRAND_COLORS = [
  "#a894c4", // lavender
  "#7db5b8", // muted teal
  "#c9976b", // warm peach
  "#b88a9e", // dusty pink
  "#98b876", // sage
  "#7ba8a6", // sea green
  "#c4907e", // terracotta
  "#9088b8", // periwinkle
  "#c4a87c", // sand
  "#7eb8a0", // jade
  "#b890b8", // orchid
  "#c4b070", // wheat
];

interface Props {
  days: DayData[];
  platformNames: string[];
  brandNames: string[];
  selectedLines: string[];
}

export default function TrendChart({ days, platformNames, brandNames, selectedLines }: Props) {
  const labels = days.map((d) => d.date);

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
    : allLines;

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

  datasets.unshift({
    label: "每日總計",
    data: days.map((d) => d.dailyTotal),
    borderColor: "#c0c3d1",
    backgroundColor: "#c0c3d120",
    borderWidth: 2.5,
    pointRadius: 4,
    pointHoverRadius: 7,
    tension: 0.3,
    fill: false,
    borderDash: [],
  });

  return (
    <div className="bg-[#1a1d2e] rounded-xl p-4 md:p-6 border border-[#2a2e45]">
      <h3 className="text-lg font-semibold mb-4 text-[#e4e6f0]">每日進線趨勢</h3>
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
                  color: "#8b8fa3",
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
              x: { grid: { display: false }, ticks: { color: "#6b7084" } },
              y: { beginAtZero: true, grid: { color: "#2a2e4530" }, ticks: { color: "#6b7084" } },
            },
          }}
        />
      </div>
    </div>
  );
}
