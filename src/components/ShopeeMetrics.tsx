"use client";

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
  if (data.length === 0) return null;
  const latest = data[data.length - 1];

  const metrics = [
    { label: "訪客數", value: latest.visitors.toLocaleString(), color: "from-orange-500 to-orange-700" },
    { label: "聊聊詢問數", value: latest.chatInquiries.toLocaleString(), color: "from-blue-500 to-blue-700" },
    { label: "聊聊訪客數", value: latest.chatVisitors.toLocaleString(), color: "from-cyan-500 to-cyan-700" },
    { label: "訪客詢問率", value: latest.inquiryRate, color: "from-purple-500 to-purple-700" },
    { label: "回應率", value: latest.responseRate, color: "from-emerald-500 to-emerald-700" },
    { label: "平均對話時間", value: latest.avgChatTime, color: "from-amber-500 to-amber-700" },
    { label: "買家數", value: latest.buyers.toLocaleString(), color: "from-pink-500 to-pink-700" },
    { label: "訂單數", value: latest.orders.toLocaleString(), color: "from-indigo-500 to-indigo-700" },
    { label: "件數", value: latest.items.toLocaleString(), color: "from-teal-500 to-teal-700" },
    { label: "銷售額", value: `$${latest.sales.toLocaleString()}`, color: "from-red-500 to-red-700" },
    { label: "轉換率", value: latest.conversionRate, color: "from-lime-500 to-lime-700" },
  ];

  return (
    <div className="bg-[#1a1d2e] rounded-xl p-4 md:p-6 border border-[#2a2e45]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">蝦皮聊聊數據</h3>
          <p className="text-xs text-[#8b8fa3] mt-1">資料來源：蝦皮賣家中心匯出（各賣場加總）</p>
        </div>
        <span className="text-xs bg-orange-600/20 text-orange-400 px-2.5 py-1 rounded-lg border border-orange-600/30">
          {latest.month}
        </span>
      </div>

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
        <FunnelBar label="訪客" value={latest.visitors} max={latest.visitors} color="#f97316" />
        <FunnelBar label="聊聊訪客" value={latest.chatVisitors} max={latest.visitors} color="#3b82f6" sub={latest.inquiryRate} />
        <FunnelBar label="已回應" value={latest.respondedChats} max={latest.visitors} color="#22c55e" sub={latest.responseRate} />
        <FunnelBar label="買家下單" value={latest.buyers} max={latest.visitors} color="#ef4444" sub={latest.conversionRate} />
      </div>

      {/* Unresponded alert */}
      {latest.unrespondedChats > 0 && (
        <div className="mt-4 bg-red-900/20 border border-red-700/30 rounded-lg p-3 text-sm text-red-400">
          未回應聊聊數：{latest.unrespondedChats} 筆
        </div>
      )}
    </div>
  );
}
