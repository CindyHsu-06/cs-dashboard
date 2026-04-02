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

  const platformTotals: Record<string, number> = {};
  days.forEach((d) => {
    Object.entries(d.platforms).forEach(([name, val]) => {
      platformTotals[name] = (platformTotals[name] || 0) + val;
    });
  });
  const topPlatform = Object.entries(platformTotals).sort((a, b) => b[1] - a[1])[0];

  const cards = [
    { label: "累計進線", value: grandTotal.toLocaleString(), bar: "bg-sky-400/60" },
    { label: "今日進線", value: today?.dailyTotal.toLocaleString() ?? "0", bar: "bg-emerald-400/60" },
    { label: "日均進線", value: avgDaily.toFixed(1), bar: "bg-violet-400/60" },
    {
      label: "較前日增減",
      value: `${dayChange >= 0 ? "+" : ""}${dayChange.toFixed(1)}%`,
      bar: dayChange >= 0 ? "bg-rose-400/60" : "bg-teal-400/60",
    },
    {
      label: "最大來源平台",
      value: topPlatform ? topPlatform[0] : "N/A",
      sub: topPlatform ? `${topPlatform[1]} 筆` : "",
      bar: "bg-amber-400/60",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-[#1a1d2e] rounded-lg px-4 py-3 border border-[#2a2e45] relative overflow-hidden"
        >
          <div className="text-xs text-[#8b8fa3] font-medium mb-1">{card.label}</div>
          <div className="text-xl font-bold text-[#e4e6f0]">{card.value}</div>
          {card.sub && <div className="text-xs text-[#6b7084] mt-0.5">{card.sub}</div>}
          <div className={`absolute bottom-0 left-0 right-0 h-[3px] ${card.bar} rounded-b-lg`} />
        </div>
      ))}
    </div>
  );
}
