"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { DayData } from "@/lib/fetchData";

const MONTH_NAMES = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];

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

function filterByCalendarDays<T extends { date: string }>(days: T[], n: number): T[] {
  if (days.length === 0) return days;
  const lastISO = toISO(days[days.length - 1].date);
  const lastDate = new Date(lastISO);
  lastDate.setDate(lastDate.getDate() - (n - 1));
  const cutoff = lastDate.toISOString().slice(0, 10);
  return days.filter((d) => toISO(d.date) >= cutoff);
}

function shortDate(iso: string): string {
  if (!iso) return "";
  const m = iso.match(/^\d{4}-(\d{2})-(\d{2})$/);
  if (!m) return iso;
  return `${parseInt(m[1])}/${parseInt(m[2])}`;
}

function formatRange(maxDate: string, days: number): string {
  if (!maxDate) return "";
  const end = new Date(maxDate);
  const start = new Date(maxDate);
  start.setDate(end.getDate() - (days - 1));
  return `${start.getMonth() + 1}/${start.getDate()} ~ ${end.getMonth() + 1}/${end.getDate()}`;
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
    if (tableRange === "7d") return filterByCalendarDays(days, 7);
    if (tableRange === "14d") return filterByCalendarDays(days, 14);
    if (tableRange === "30d") return filterByCalendarDays(days, 30);
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

  const presets: { key: typeof tableRange; label: string }[] = [
    { key: "7d", label: "近7日" },
    { key: "14d", label: "近14日" },
    { key: "30d", label: "近30日" },
  ];

  function getTriggerLabel() {
    if (tableRange === "7d") return `近7日 · ${formatRange(maxDate, 7)}`;
    if (tableRange === "14d") return `近14日 · ${formatRange(maxDate, 14)}`;
    if (tableRange === "30d") return `近30日 · ${formatRange(maxDate, 30)}`;
    if (tableRange === "custom" && matchedMonth) return `${parseInt(matchedMonth)}月 · ${shortDate(startDate)} ~ ${shortDate(endDate)}`;
    if (tableRange === "custom" && startDate && endDate) return `自訂 · ${shortDate(startDate)} ~ ${shortDate(endDate)}`;
    return "選擇區間";
  }

  const isUnified = tableRange !== "all";

  const availableMonths = Array.from(new Set(
    days.map((d) => d.date.split("/")[0]?.padStart(2, "0") || "").filter(Boolean)
  )).sort();

  function selectMonth(mm: string) {
    const lastDay = new Date(2026, parseInt(mm), 0).getDate();
    setStartDate(`2026-${mm}-01`);
    setEndDate(`2026-${mm}-${String(lastDay).padStart(2, "0")}`);
    setTableRange("custom");
  }

  const matchedMonth = (() => {
    if (tableRange !== "custom") return "";
    const m = startDate.match(/^2026-(\d{2})-01$/);
    if (!m) return "";
    const mm = m[1];
    const lastDay = new Date(2026, parseInt(mm), 0).getDate();
    return endDate === `2026-${mm}-${String(lastDay).padStart(2, "0")}` ? mm : "";
  })();

  return (
    <div className="bg-[#1a1d2e] rounded-xl border border-[#2a2e45] overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 md:p-6 pb-0 gap-3">
        <h3 className="text-lg font-semibold text-[#e4e6f0]">明細表格</h3>
        <div className="flex gap-2 flex-wrap items-center">
          {/* 全部 - separate */}
          <button
            onClick={() => { setTableRange("all"); setShowCal(false); }}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              tableRange === "all"
                ? "bg-[#2a3a5c] text-sky-300 border border-sky-400/40"
                : "bg-[#0f1117] text-[#8b8fa3] hover:bg-[#232740] border border-[#2a2e45]"
            }`}
          >
            全部
          </button>

          {/* Unified picker */}
          <div className="relative" ref={calRef}>
            <button
              onClick={() => setShowCal(!showCal)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                isUnified
                  ? "bg-[#2a3a5c] text-sky-300 border border-sky-400/40"
                  : "bg-[#0f1117] text-[#8b8fa3] hover:bg-[#232740] border border-[#2a2e45]"
              }`}
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {isUnified ? getTriggerLabel() : "選擇區間"}
              <svg className={`w-3 h-3 transition-transform ${showCal ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showCal && (
              <div className="absolute top-full right-0 mt-2 bg-[#1a1d2e] border border-[#2a2e45] rounded-xl shadow-2xl z-50 flex w-[460px] overflow-hidden">
                {/* Sidebar */}
                <div className="w-[110px] bg-[#0f1117] border-r border-[#2a2e45] p-2 space-y-0.5">
                  {presets.map((p) => (
                    <button
                      key={p.key}
                      onClick={() => { setTableRange(p.key); setShowCal(false); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all ${
                        tableRange === p.key
                          ? "bg-sky-500/20 text-sky-300 font-medium"
                          : "text-[#c0c3d1] hover:bg-[#1a1d2e]"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {/* Right - month grid + custom dates */}
                <div className="flex-1 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-[#8b8fa3]">按月選擇</span>
                    <span className="text-sm text-[#c0c3d1] font-medium">2026</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 mb-4">
                    {Array.from({ length: 12 }, (_, i) => {
                      const mm = String(i + 1).padStart(2, "0");
                      const hasData = availableMonths.includes(mm);
                      const isActive = matchedMonth === mm;
                      return (
                        <button
                          key={mm}
                          onClick={() => hasData && selectMonth(mm)}
                          disabled={!hasData}
                          className={`text-sm py-2 rounded-lg transition-all ${
                            isActive
                              ? "bg-sky-500/20 text-sky-300 border border-sky-400/50 font-semibold"
                              : hasData
                              ? "text-[#c0c3d1] hover:bg-[#232740] border border-transparent"
                              : "text-[#3a3e55] cursor-not-allowed border border-transparent"
                          }`}
                        >
                          {MONTH_NAMES[i]}
                        </button>
                      );
                    })}
                  </div>
                  <div className="border-t border-[#2a2e45] pt-3 space-y-2">
                    <div className="text-xs text-[#8b8fa3]">或自訂區間</div>
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={startDate}
                        min={minDate}
                        max={maxDate}
                        onChange={(e) => { setStartDate(e.target.value); setTableRange("custom"); }}
                        className="flex-1 bg-[#0f1117] border border-[#2a2e45] rounded-lg px-2 py-1.5 text-xs text-[#e4e6f0] focus:border-sky-400/50 focus:outline-none [color-scheme:dark]"
                      />
                      <span className="text-[#6b7084] text-xs">~</span>
                      <input
                        type="date"
                        value={endDate}
                        min={minDate}
                        max={maxDate}
                        onChange={(e) => { setEndDate(e.target.value); setTableRange("custom"); }}
                        className="flex-1 bg-[#0f1117] border border-[#2a2e45] rounded-lg px-2 py-1.5 text-xs text-[#e4e6f0] focus:border-sky-400/50 focus:outline-none [color-scheme:dark]"
                      />
                    </div>
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
