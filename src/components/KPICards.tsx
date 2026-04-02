"use client";

import { DashboardData } from "@/lib/fetchData";

interface Props {
  data: DashboardData;
}

export default function KPICards({ data }: Props) {
  const { days, grandTotal } = data;
  const today = days[days.length - 1];
  const yesterday = days.length >= 2 ? days[days.length - 2] : null;
  const avgDaily = days.length > 0 ? grandTotal / days.length : 0;

  const dayChange = yesterday && yesterday.dailyTotal > 0
    ? ((today.dailyTotal - yesterday.dailyTotal) / yesterday.dailyTotal) * 100
    : 0;

  // Find top platform by total across all days
  const platformTotals: Record<string, number> = {};
  days.forEach((d) => {
    Object.entries(d.platforms).forEach(([name, val]) => {
      platformTotals[name] = (platformTotals[name] || 0) + val;
    });
  });
  const topPlatform = Object.entries(platformTotals).sort((a, b) => b[1] - a[1])[0];

  const cards = [
    { label: "累計進線", value: grandTotal.toLocaleString(), accent: "border-blue-500", valueColor: "text-blue-400" },
    { label: "今日進線", value: today?.dailyTotal.toLocaleString() ?? "0", accent: "border-emerald-500", valueColor: "text-emerald-400" },
    { label: "日均進線", value: avgDaily.toFixed(1), accent: "border-purple-500", valueColor: "text-purple-400" },
    {
      label: "較前日增減",
      value: `${dayChange >= 0 ? "+" : ""}${dayChange.toFixed(1)}%`,
      accent: dayChange >= 0 ? "border-red-500" : "border-green-500",
      valueColor: dayChange >= 0 ? "text-red-400" : "text-green-400",
    },
    {
      label: "最大來源平台",
      value: topPlatform ? topPlatform[0] : "N/A",
      sub: topPlatform ? `${topPlatform[1]} 筆` : "",
      accent: "border-amber-500",
      valueColor: "text-amber-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`bg-[#1a1d2e] rounded-lg p-4 border border-[#2a2e45] border-l-4 ${card.accent}`}
        >
          <div className="text-xs text-[#8b8fa3] font-medium mb-2">{card.label}</div>
          <div className={`text-2xl font-bold ${card.valueColor}`}>{card.value}</div>
          {card.sub && <div className="text-xs text-[#8b8fa3] mt-1">{card.sub}</div>}
        </div>
      ))}
    </div>
  );
}
