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
        <span className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
          <span className="text-[#c0c3d1]">{label}</span>
        </span>
        <span className="text-[#e4e6f0] font-semibold">{value.toLocaleString()}{sub && <span className="text-[#6b7084] text-xs ml-1">{sub}</span>}</span>
      </div>
      <div className="h-2 bg-[#0f1117] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all bg-[#3a3f55]" style={{ width: `${Math.max(pct, 2)}%` }} />
      </div>
    </div>
  );
}

function Tooltip({ tip }: { tip: string }) {
  return (
    <span className="relative group/tip ml-1 inline-flex cursor-help">
      <span className="w-3.5 h-3.5 rounded-full border border-[#4a4e65] text-[10px] leading-[14px] text-center text-[#6b7084] inline-block">?</span>
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[#232740] border border-[#2a2e45] rounded-lg text-xs text-[#c0c3d1] w-56 leading-relaxed opacity-0 group-hover/tip:opacity-100 transition-opacity pointer-events-none z-20 whitespace-normal">
        {tip}
      </span>
    </span>
  );
}

const METRIC_BARS: Record<string, string> = {
  "訪客數": "bg-amber-400/50",
  "聊聊詢問數": "bg-sky-400/50",
  "聊聊訪客數": "bg-cyan-400/50",
  "訪客詢問率": "bg-violet-400/50",
  "回應率": "bg-emerald-400/50",
  "平均對話時間": "bg-amber-300/50",
  "買家數": "bg-rose-400/50",
  "訂單數": "bg-indigo-400/50",
  "件數": "bg-teal-400/50",
  "銷售額": "bg-red-400/50",
  "轉換率": "bg-lime-400/50",
};

const METRIC_TIPS: Record<string, string> = {
  "訪客數": "所選時間區間內瀏覽您的賣場和商品詳情頁的不重複訪客總數量。同一訪客多次瀏覽同一頁面將視為一個不重複訪客。",
  "聊聊詢問數": "所選時間區間內進線詢問的對話。當賣家收到對話或出價的聊聊時，將會與同一對話中第一則聊聊的時間進行比較。如果時間相距超過12小時，則視為新的對話。聊聊廣播、問答小幫手和遊戲訊息將不被視為進線詢問。",
  "聊聊訪客數": "所選時間區間內發起聊聊的不重複訪客總數量。",
  "訪客詢問率": "聊聊訪客數 / 訪客數",
  "已回應聊聊數": "所選時間區間內已回應的對話數。如果您在收到對話後，在12個小時內回應，則該對話將視為已回應。",
  "未回應聊聊數": "所選時間區間內未回應的對話數。如果您在收到對話後，在12個小時後回應，則該對話將視為未回應。",
  "回應率": "已回應聊聊數 / (已回應聊聊數 + 未回應聊聊數)",
  "平均對話時間": "從子帳號分配到聊聊後到結束的平均對話時間。",
  "買家數": "所選時間區間內在已回應聊聊對話後下單的買家數，如果買家在兩個聊聊對話後下單，會視為兩個買家。",
  "訂單數": "在所選時間區間內，在已回應聊聊對話中的訂單總數。",
  "件數": "在所選時間區間內，在已回應聊聊對話中的銷售總件數。",
  "銷售額": "在所選時間區間內，在已回應聊聊對話中的銷售總金額。",
  "轉換率": "下單的買家 / 已回應的聊聊",
};

export default function ShopeeMetrics({ data }: Props) {
  const validMonths = data.filter((d) => d.visitors > 0);
  const allMonths = data.map((d) => d.month);

  const defaultMonth = validMonths.length > 0
    ? validMonths[validMonths.length - 1].month
    : (allMonths[allMonths.length - 1] || "");

  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);

  if (data.length === 0) return null;

  const current = data.find((d) => d.month === selectedMonth) || data[0];
  const hasData = current.visitors > 0;

  const metrics = [
    { label: "訪客數", value: current.visitors.toLocaleString() },
    { label: "聊聊詢問數", value: current.chatInquiries.toLocaleString() },
    { label: "聊聊訪客數", value: current.chatVisitors.toLocaleString() },
    { label: "訪客詢問率", value: current.inquiryRate },
    { label: "已回應聊聊數", value: current.respondedChats.toLocaleString() },
    { label: "未回應聊聊數", value: current.unrespondedChats.toLocaleString() },
    { label: "回應率", value: current.responseRate },
    { label: "平均對話時間", value: current.avgChatTime },
    { label: "買家數", value: current.buyers.toLocaleString() },
    { label: "訂單數", value: current.orders.toLocaleString() },
    { label: "件數", value: current.items.toLocaleString() },
    { label: "銷售額", value: `$${current.sales.toLocaleString()}` },
    { label: "轉換率", value: current.conversionRate },
  ];

  return (
    <div className="bg-[#1a1d2e] rounded-xl p-4 md:p-6 border border-[#2a2e45]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-[#e4e6f0]">蝦皮聊聊數據</h3>
          <p className="text-xs text-[#6b7084] mt-1">資料來源：蝦皮賣家中心匯出（各賣場加總）</p>
        </div>
        <div className="flex gap-2">
          {allMonths.map((m) => {
            const monthHasData = validMonths.some((v) => v.month === m);
            return (
              <button
                key={m}
                onClick={() => setSelectedMonth(m)}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                  selectedMonth === m
                    ? "bg-[#2a3a5c] text-sky-300 border-sky-400/40"
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
        <div className="text-center py-12 text-[#6b7084]">
          <p className="text-lg mb-1">{current.month} 尚無資料</p>
          <p className="text-xs">請在 Google Sheets「蝦皮數據」頁籤填入該月數據</p>
        </div>
      ) : (
        <>
          {/* KPI Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
            {metrics.map((m) => (
              <div
                key={m.label}
                className="bg-[#0f1117] rounded-lg p-3 border border-[#2a2e45] relative overflow-hidden"
              >
                <div className="text-xs text-[#6b7084] flex items-center">
                  {m.label}
                  {METRIC_TIPS[m.label] && <Tooltip tip={METRIC_TIPS[m.label]} />}
                </div>
                <div className="text-lg font-bold text-[#e4e6f0] mt-1">{m.value}</div>
                <div className={`absolute bottom-0 left-0 right-0 h-[3px] ${METRIC_BARS[m.label] || "bg-gray-400/50"} rounded-b-lg`} />
              </div>
            ))}
          </div>

          {/* Conversion Funnel */}
          <h4 className="text-sm font-medium text-[#8b8fa3] mb-3">轉換漏斗</h4>
          <div className="space-y-3">
            <FunnelBar label="訪客" value={current.visitors} max={current.visitors} color="#d4a06a" />
            <FunnelBar label="聊聊訪客" value={current.chatVisitors} max={current.visitors} color="#7c9ec4" sub={current.inquiryRate} />
            <FunnelBar label="已回應" value={current.respondedChats} max={current.visitors} color="#8bb89e" sub={current.responseRate} />
            <FunnelBar label="買家下單" value={current.buyers} max={current.visitors} color="#c48080" sub={current.conversionRate} />
          </div>
        </>
      )}
    </div>
  );
}
