"use client";

import { DayData } from "@/lib/fetchData";

interface Props {
  days: DayData[];
  platformNames: string[];
  brandNames: string[];
}

function Cell({ value }: { value: number }) {
  return (
    <td className={`text-right py-2.5 px-3 tabular-nums ${
      value > 0 ? "text-amber-300/90" : "text-[#3a3e55]"
    }`}>
      {value}
    </td>
  );
}

export default function DetailTable({ days, platformNames, brandNames }: Props) {
  return (
    <div className="bg-[#1a1d2e] rounded-xl border border-[#2a2e45] overflow-hidden">
      <h3 className="text-lg font-semibold p-4 md:p-6 pb-0 text-[#e4e6f0]">明細表格</h3>
      <div className="overflow-x-auto p-4 md:p-6 pt-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2a2e45]">
              <th className="text-left py-3 px-3 text-[#8b8fa3] font-medium sticky left-0 bg-[#1a1d2e] min-w-[70px]">
                日期
              </th>
              {platformNames.map((name) => (
                <th key={name} className="text-right py-3 px-3 text-[#8b8fa3] font-medium whitespace-nowrap">
                  {name}
                </th>
              ))}
              {brandNames.map((name) => (
                <th key={name} className="text-right py-3 px-3 text-[#8b8fa3] font-medium whitespace-nowrap">
                  <span className="text-violet-400/60">mo+_</span>{name}
                </th>
              ))}
              <th className="text-right py-3 px-3 text-[#8b8fa3] font-medium">小計</th>
            </tr>
          </thead>
          <tbody>
            {days.map((day, i) => (
              <tr
                key={day.date}
                className={`border-b border-[#2a2e45]/50 hover:bg-[#232740] transition-colors ${
                  i === days.length - 1 ? "bg-[#1e2a3a]" : ""
                }`}
              >
                <td className="py-2.5 px-3 font-medium text-[#c0c3d1] sticky left-0 bg-inherit whitespace-nowrap">
                  {day.date}
                </td>
                {platformNames.map((name) => (
                  <Cell key={name} value={day.platforms[name] ?? 0} />
                ))}
                {brandNames.map((name) => (
                  <Cell key={name} value={day.brands[name] ?? 0} />
                ))}
                <td className="text-right py-2.5 px-3 font-semibold text-sky-400/80 tabular-nums">
                  {day.dailyTotal}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-[#2a2e45] font-semibold">
              <td className="py-3 px-3 text-[#e4e6f0] sticky left-0 bg-[#1a1d2e]">合計</td>
              {platformNames.map((name) => {
                const total = days.reduce((s, d) => s + (d.platforms[name] ?? 0), 0);
                return (
                  <td key={name} className={`text-right py-3 px-3 tabular-nums ${total > 0 ? "text-emerald-400/80" : "text-[#3a3e55]"}`}>
                    {total}
                  </td>
                );
              })}
              {brandNames.map((name) => {
                const total = days.reduce((s, d) => s + (d.brands[name] ?? 0), 0);
                return (
                  <td key={name} className={`text-right py-3 px-3 tabular-nums ${total > 0 ? "text-emerald-400/80" : "text-[#3a3e55]"}`}>
                    {total}
                  </td>
                );
              })}
              <td className="text-right py-3 px-3 text-sky-400/80 tabular-nums">
                {days.reduce((s, d) => s + d.dailyTotal, 0)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
