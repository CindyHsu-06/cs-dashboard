"use client";

import { Line } from "react-chartjs-2";
import { DayData } from "@/lib/fetchData";

const COLORS = [
  "#3b82f6", "#22c55e", "#eab308", "#ef4444",
  "#a855f7", "#06b6d4", "#f97316", "#ec4899",
];

interface Props {
  days: DayData[];
  platformNames: string[];
  selectedPlatforms: string[];
}

export default function TrendChart({ days, platformNames, selectedPlatforms }: Props) {
  const labels = days.map((d) => d.date);
  const activePlatforms = selectedPlatforms.length > 0 ? selectedPlatforms : platformNames;

  const datasets = activePlatforms.map((name, i) => ({
    label: name,
    data: days.map((d) => d.platforms[name] ?? 0),
    borderColor: COLORS[i % COLORS.length],
    backgroundColor: COLORS[i % COLORS.length] + "20",
    borderWidth: 2,
    pointRadius: 3,
    pointHoverRadius: 6,
    tension: 0.3,
    fill: false,
  }));

  // Add total line
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
  });

  return (
    <div className="bg-[#1a1d2e] rounded-xl p-4 md:p-6 border border-[#2a2e45]">
      <h3 className="text-lg font-semibold mb-4 text-white">每日進線趨勢</h3>
      <div className="h-[300px] md:h-[350px]">
        <Line
          data={{ labels, datasets }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: "index", intersect: false },
            plugins: {
              legend: { position: "bottom", labels: { padding: 16, usePointStyle: true, pointStyle: "circle" } },
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
