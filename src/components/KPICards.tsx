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
    { label: "累計進線", value: grandTotal.toLocaleString(), icon: "📊", color: "from-blue-600 to-blue-800" },
    { label: "今日進線", value: today?.dailyTotal.toLocaleString() ?? "0", icon: "📞", color: "from-emerald-600 to-emerald-800" },
    { label: "日均進線", value: avgDaily.toFixed(1), icon: "📈", color: "from-purple-600 to-purple-800" },
    {
      label: "較前日增減",
      value: `${dayChange >= 0 ? "+" : ""}${dayChange.toFixed(1)}%`,
      icon: dayChange >= 0 ? "🔺" : "🔻",
      color: dayChange >= 0 ? "from-red-600 to-red-800" : "from-green-600 to-green-800",
    },
    {
      label: "最大來源平台",
      value: topPlatform ? topPlatform[0] : "N/A",
      sub: topPlatform ? `${topPlatform[1]} 筆` : "",
      icon: "🏆",
      color: "from-amber-600 to-amber-800",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`bg-gradient-to-br ${card.color} rounded-xl p-4 shadow-lg border border-white/10`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-white/70 font-medium">{card.label}</span>
            <span className="text-lg">{card.icon}</span>
          </div>
          <div className="text-2xl font-bold text-white">{card.value}</div>
          {card.sub && <div className="text-xs text-white/60 mt-1">{card.sub}</div>}
        </div>
      ))}
    </div>
  );
}
