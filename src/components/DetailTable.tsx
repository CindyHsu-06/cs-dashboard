"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { DayData } from "@/lib/fetchData";

interface Props {
  days: DayData[];
  platformNames: string[];
  brandNames: string[];
}

function toISO(shortDate: string): string {
  const parts = shortDate.split("/");
  if (parts.length !== 2) return "";
  return `2026-${parts[0].padStart(2, "0")}-${parts[1].padStart(2, "0")}`;
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
  const [tableRange, setTableRange] = useState<"all" | "7d" | "14d" | "30d" | "custom">("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showCal, setShowCal] = useState(false);
  const calRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (days.length > 0 && !startDate) {
      setStartDate(toISO(days[0].date));
      setEndDate(toISO(days[days.length - 1].date));
    }
  }, [days, startDate]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (calRef.current && !calRef.current.contains(e.target as Node)) setShowCal(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = useMemo(() => {
    if (tableRange === "7d") return days.slice(-7);
    if (tableRange === "14d") return days.slice(-14);
    if (tableRange === "30d") return days.slice(-30);
    if (tableRange === "custom" && startDate && endDate) {
      return days.filter((d) => {
        const iso = toISO(d.date);
        return iso >= startDate && iso <= endDate;
      });
    }
    return days;
  }, [days, tableRange, startDate, endDate]);

  const minDate = days.length > 0 ? toISO(days[0].date) : "";
  const maxDate = days.length > 0 ? toISO(days[days.length - 1].date) : "";

  const ranges: { key: typeof tableRange; label: string }[] = [
    { key: "7d", label: "近7日" },
    { key: "14d", label: "近14日" },
    { key: "30d", label: "近30日" },
    { key: "all", label: "全部" },
  ];

  return (
    <div className="bg-[#1a1d2e] rounded-xl border border-[#2a2e45] overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 md:p-6 pb-0 gap-3">
        <h3 className="text-lg font-semibold text-[#e4e6f0]">明細表格</h3>
        <div className="flex gap-2 flex-wrap items-center">
          {ranges.map((r) => (
            <button
              key={r.key}
              onClick={() => { setTableRange(r.key); setShowCal(false); }}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                tableRange === r.key
                  ? "bg-[#2a3a5c] text-sky-300 border border-sky-400/40"
                  : "bg-[#0f1117] text-[#8b8fa3] hover:bg-[#232740] border border-[#2a2e45]"
              }`}
            >
              {r.label}
            </button>
          ))}
          <div className="relative" ref={calRef}>
            <button
              onClick={() => { setShowCal(!showCal); if (tableRange !== "custom") setTableRange("custom"); }}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                tableRange === "custom"
                  ? "bg-[#2a3a5c] text-sky-300 border border-sky-400/40"
                  : "bg-[#0f1117] text-[#8b8fa3] hover:bg-[#232740] border border-[#2a2e45]"
              }`}
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              自訂
            </button>
            {showCal && (
              <div className="absolute top-full right-0 mt-2 bg-[#1a1d2e] border border-[#2a2e45] rounded-lg p-4 shadow-xl z-50 min-w-[240px]">
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-[#8b8fa3] block mb-1">開始日期</label>
                    <input
                      type="date"
                      value={startDate}
                      min={minDate}
                      max={maxDate}
                      onChange={(e) => { setStartDate(e.target.value); setTableRange("custom"); }}
                      className="w-full bg-[#0f1117] border border-[#2a2e45] rounded-lg px-3 py-2 text-sm text-[#e4e6f0] focus:border-sky-400/50 focus:outline-none [color-scheme:dark]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#8b8fa3] block mb-1">結束日期</label>
                    <input
                      type="date"
                      value={endDate}
                      min={minDate}
                      max={maxDate}
                      onChange={(e) => { setEndDate(e.target.value); setTableRange("custom"); }}
                      className="w-full bg-[#0f1117] border border-[#2a2e45] rounded-lg px-3 py-2 text-sm text-[#e4e6f0] focus:border-sky-400/50 focus:outline-none [color-scheme:dark]"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

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
            {filtered.map((day, i) => (
              <tr
                key={day.date}
                className={`border-b border-[#2a2e45]/50 hover:bg-[#232740] transition-colors ${
                  i === filtered.length - 1 ? "bg-[#1e2a3a]" : ""
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
                const total = filtered.reduce((s, d) => s + (d.platforms[name] ?? 0), 0);
                return (
                  <td key={name} className={`text-right py-3 px-3 tabular-nums ${total > 0 ? "text-emerald-400/80" : "text-[#3a3e55]"}`}>
                    {total}
                  </td>
                );
              })}
              {brandNames.map((name) => {
                const total = filtered.reduce((s, d) => s + (d.brands[name] ?? 0), 0);
                return (
                  <td key={name} className={`text-right py-3 px-3 tabular-nums ${total > 0 ? "text-emerald-400/80" : "text-[#3a3e55]"}`}>
                    {total}
                  </td>
                );
              })}
              <td className="text-right py-3 px-3 text-sky-400/80 tabular-nums">
                {filtered.reduce((s, d) => s + d.dailyTotal, 0)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
