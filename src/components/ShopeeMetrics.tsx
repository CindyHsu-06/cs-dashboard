"use client";

import { useState } from "react";
import { ShopeeMonthData } from "@/lib/fetchData";

interface Props {
  data: ShopeeMonthData[];
}

function FunnelBar({ label, value, max, color, sub }: {
  label: string; value: number; max: number; color: string; sub?: string;
}) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-[#8b8fa3]">{label}</span>
        <span className="text-white font-semibold">{value.toLocaleString()}{sub && <span className="text-[#8b8fa3] text-xs ml-1">{sub}</span>}</span>
      </div>
      <div className="h-3 bg-[#0f1117] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${Math.max(pct, 2)}%`, background: color }} />
      </div>
    </div>
  );
}

export default function ShopeeMetrics({ data }: Props) {
  // Filter out months with no actual data (visitors = 0)
  const validMonths = data.filter((d) => d.visitors > 0);
  const allMonths = data.map((d) => d.month);

  // Default to latest month with data, or latest month overall
  const defaultMonth = validMonths.length > 0
    ? validMonths[validMonths.length - 1].month
    : (allMonths[allMonths.length - 1] || "");

  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);

  if (data.length === 0) return null;

  const current = data.find((d) => d.month === selectedMonth) || data[0];
  const hasData = current.visitors > 0;

  const metrics = [
    { label: "訪客數", value: current.visitors.toLocaleString(), color: "from-orange-500 to-orange-700" },
    { label: "聊聊詢問數", value: current.chatInquiries.toLocaleString(), color: "from-blue-500 to-blue-700" },
    { label: "聊聊訪客數", value: current.chatVisitors.toLocaleString(), color: "from-cyan-500 to-cyan-700" },
    { label: "訪客詢問率", value: current.inquiryRate, color: "from-purple-500 to-purple-700" },
    { label: "回應率", value: current.responseRate, color: "from-emerald-500 to-emerald-700" },
    { label: "平均對話時間", value: current.avgChatTime, color: "from-amber-500 to-amber-700" },
    { label: "買家數", value: current.buyers.toLocaleString(), color: "from-pink-500 to-pink-700" },
    { label: "訂單數", value: current.orders.toLocaleString(), color: "from-indigo-500 to-indigo-700" },
    { label: "件數", value: current.items.toLocaleString(), color: "from-teal-500 to-teal-700" },
    { label: "銷售額", value: `$${current.sales.toLocaleString()}`, color: "from-red-500 to-red-700" },
    { label: "轉換率", value: current.conversionRate, color: "from-lime-500 to-lime-700" },
  ];

  return (
    <div className="bg-[#1a1d2e] rounded-xl p-4 md:p-6 border border-[#2a2e45]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">蝦皮聊聊數據</h3>
          <p className="text-xs text-[#8b8fa3] mt-1">資料來源：蝦皮賣家中心匯出（各賣場加總）</p>
        </div>
        {/* Month selector */}
        <div className="flex gap-2">
          {allMonths.map((m) => {
            const monthHasData = validMonths.some((v) => v.month === m);
            return (
              <button
                key={m}
                onClick={() => setSelectedMonth(m)}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                  selectedMonth === m
                    ? "bg-orange-600 text-white border-orange-600 shadow-lg shadow-orange-600/30"
                    : monthHasData
                    ? "bg-[#0f1117] text-[#8b8fa3] border-[#2a2e45] hover:bg-[#232740]"
                    : "bg-[#0f1117] text-[#3a3e55] border-[#2a2e45] opacity-50"
                }`}
              >
                {m}
                {!monthHasData && <span className="ml-1 text-[10px]">(空)</span>}
              </button>
            );
          })}
        </div>
      </div>

      {!hasData ? (
        <div className="text-center py-12 text-[#8b8fa3]">
          <p className="text-lg mb-1">{current.month} 尚無資料</p>
          <p className="text-xs">請在 Google Sheets「蝦皮數據」頁籤填入該月數據</p>
        </div>
      ) : (
        <>
          {/* KPI Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
            {metrics.map((m) => (
              <div key={m.label} className={`bg-gradient-to-br ${m.color} rounded-lg p-3 border border-white/10`}>
                <div className="text-xs text-white/70">{m.label}</div>
                <div className="text-lg font-bold text-white mt-1">{m.value}</div>
              </div>
            ))}
          </div>

          {/* Conversion Funnel */}
          <h4 className="text-sm font-medium text-[#8b8fa3] mb-3">轉換漏斗</h4>
          <div className="space-y-3">
            <FunnelBar label="訪客" value={current.visitors} max={current.visitors} color="#f97316" />
            <FunnelBar label="聊聊訪客" value={current.chatVisitors} max={current.visitors} color="#3b82f6" sub={current.inquiryRate} />
            <FunnelBar label="已回應" value={current.respondedChats} max={current.visitors} color="#22c55e" sub={current.responseRate} />
            <FunnelBar label="買家下單" value={current.buyers} max={current.visitors} color="#ef4444" sub={current.conversionRate} />
          </div>

          {current.unrespondedChats > 0 && (
            <div className="mt-4 bg-red-900/20 border border-red-700/30 rounded-lg p-3 text-sm text-red-400">
              未回應聊聊數：{current.unrespondedChats} 筆
            </div>
          )}
        </>
      )}
    </div>
  );
}
