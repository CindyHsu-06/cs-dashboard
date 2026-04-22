"use client";

import { CategoryData } from "@/lib/fetchData";

interface Props {
  data: CategoryData[];
}

type CatKey = "preSale" | "orderPayment" | "logistics" | "productIssue" | "afterSale" | "complaint";

const CATEGORIES: { key: CatKey; label: string; desc: string; bar: string }[] = [
  { key: "preSale", label: "售前諮詢", desc: "促銷折扣、商品規格/文案問題、庫存/補貨詢問", bar: "bg-sky-400/50" },
  { key: "orderPayment", label: "訂單/金流", desc: "付款問題、取消/修改訂單、發票/載具問題、退款進度", bar: "bg-amber-400/50" },
  { key: "logistics", label: "物流配送", desc: "配送進度、包裹遺失、更改收件地址/門市、超取問題", bar: "bg-emerald-400/50" },
  { key: "productIssue", label: "商品問題", desc: "寄錯/漏寄商品、商品瑕疵、使用/操作教學", bar: "bg-orange-300/50" },
  { key: "afterSale", label: "售後服務", desc: "退換貨申請/進度、維修諮詢", bar: "bg-violet-400/50" },
  { key: "complaint", label: "客訴/其他", desc: "服務態度、平台系統異常、建議反饋", bar: "bg-rose-400/50" },
];

function getCatValue(d: CategoryData, key: CatKey): number | null {
  return d[key];
}

const ALL_PLATFORMS = ["蝦皮", "LINE OA", "電話", "MOMO", "官網", "Facebook"];

export default function CategoryBreakdown({ data }: Props) {
  const dataPlats = Array.from(new Set(data.map((d) => d.platform)));
  const platforms = ALL_PLATFORMS.map((p) => p).concat(
    dataPlats.filter((p) => !ALL_PLATFORMS.includes(p))
  );

  const catTotals: Record<CatKey, number> = {
    preSale: 0, orderPayment: 0, logistics: 0,
    productIssue: 0, afterSale: 0, complaint: 0,
  };
  CATEGORIES.forEach((cat) => {
    catTotals[cat.key] = data.reduce((sum, d) => sum + (getCatValue(d, cat.key) ?? 0), 0);
  });
  const grandTotal = Object.values(catTotals).reduce((s, v) => s + v, 0);

  return (
    <div className="bg-[#1a1d2e] rounded-xl p-4 md:p-6 border border-[#2a2e45]">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-[#e4e6f0]">問題分類統計</h3>
        <p className="text-xs text-[#6b7084] mt-1">
          依客服對話內容分類（尚未下單 → 訂單中 → 配送中 → 收到貨 → 售後 → 特殊）
        </p>
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {CATEGORIES.map((cat) => {
          const total = catTotals[cat.key];
          const pct = grandTotal > 0 ? ((total / grandTotal) * 100).toFixed(0) : "0";
          return (
            <div key={cat.key} className="bg-[#0f1117] rounded-lg p-3 border border-[#2a2e45] group relative overflow-hidden">
              <div className="text-sm font-medium text-[#c0c3d1] mb-2">{cat.label}</div>
              <div className="text-2xl font-bold text-[#e4e6f0]">{total > 0 ? total : "—"}</div>
              {total > 0 && (
                <div className="text-xs text-[#6b7084] mt-1">{pct}%</div>
              )}
              <div className={`absolute bottom-0 left-0 right-0 h-[3px] ${cat.bar} rounded-b-lg`} />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[#232740] border border-[#2a2e45] rounded-lg text-xs text-[#8b8fa3] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                {cat.desc}
              </div>
            </div>
          );
        })}
      </div>

      {/* Platform x Category Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2a2e45]">
              <th className="text-left py-3 px-3 text-[#8b8fa3] font-medium">平台</th>
              {CATEGORIES.map((cat) => (
                <th key={cat.key} className="text-center py-3 px-3 text-[#8b8fa3] font-medium whitespace-nowrap">
                  {cat.label}
                </th>
              ))}
              <th className="text-center py-3 px-3 text-[#8b8fa3] font-medium">小計</th>
            </tr>
          </thead>
          <tbody>
            {platforms.map((platform) => {
              const row = data.find((d) => d.platform === platform);
              const rowTotal = row
                ? CATEGORIES.reduce((s, cat) => s + (getCatValue(row, cat.key) ?? 0), 0)
                : 0;
              return (
                <tr key={platform} className="border-b border-[#2a2e45]/50 hover:bg-[#232740] transition-colors">
                  <td className="py-2.5 px-3 font-medium text-[#e4e6f0]">{platform}</td>
                  {CATEGORIES.map((cat) => {
                    const val = row ? getCatValue(row, cat.key) : null;
                    return (
                      <td key={cat.key} className="text-center py-2.5 px-3 tabular-nums">
                        {val !== null && val !== undefined ? (
                          <span className="text-[#c0c3d1]">{val}</span>
                        ) : (
                          <span className="text-[#3a3e55]">—</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="text-center py-2.5 px-3 font-semibold text-sky-400/80 tabular-nums">
                    {rowTotal > 0 ? rowTotal : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-[#2a2e45] font-semibold">
              <td className="py-3 px-3 text-[#e4e6f0]">合計</td>
              {CATEGORIES.map((cat) => (
                <td key={cat.key} className="text-center py-3 px-3 text-[#c0c3d1] tabular-nums">
                  {catTotals[cat.key] > 0 ? catTotals[cat.key] : "—"}
                </td>
              ))}
              <td className="text-center py-3 px-3 text-sky-400/80 tabular-nums">
                {grandTotal > 0 ? grandTotal : "—"}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
