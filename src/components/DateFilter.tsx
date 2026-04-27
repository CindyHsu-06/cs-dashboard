"use client";

import { useState, useRef, useEffect } from "react";

export type DateRange = "all" | "7d" | "14d" | "30d" | "custom";

interface Props {
  range: DateRange;
  onRangeChange: (range: DateRange) => void;
  customStart: string;
  customEnd: string;
  onCustomDateChange: (start: string, end: string) => void;
  selectedLines: string[];
  platformNames: string[];
  brandNames: string[];
  onLineToggle: (key: string) => void;
  availableDates: string[];
}

export default function DateFilter({
  range,
  onRangeChange,
  customStart,
  customEnd,
  onCustomDateChange,
  selectedLines,
  platformNames,
  brandNames,
  onLineToggle,
  availableDates,
}: Props) {
  const [showCalendar, setShowCalendar] = useState(false);
  const calRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (calRef.current && !calRef.current.contains(e.target as Node)) {
        setShowCalendar(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const ranges: { key: DateRange; label: string }[] = [
    { key: "7d", label: "近7日" },
    { key: "14d", label: "近14日" },
    { key: "30d", label: "近30日" },
    { key: "all", label: "全部" },
  ];

  const minDate = availableDates.length > 0 ? toISODate(availableDates[0]) : "";
  const maxDate = availableDates.length > 0 ? toISODate(availableDates[availableDates.length - 1]) : "";

  // Extract unique months from available dates
  const availableMonths = Array.from(new Set(
    availableDates.map((d) => {
      const parts = d.split("/");
      return parts[0]?.padStart(2, "0") || "";
    }).filter(Boolean)
  )).sort();

  function selectMonth(mm: string) {
    const lastDay = new Date(2026, parseInt(mm), 0).getDate();
    const start = `2026-${mm}-01`;
    const end = `2026-${mm}-${String(lastDay).padStart(2, "0")}`;
    onCustomDateChange(start, end);
  }

  // Detect if custom range matches a single full month
  const matchedMonth = (() => {
    if (range !== "custom") return "";
    const m = customStart.match(/^2026-(\d{2})-01$/);
    if (!m) return "";
    const mm = m[1];
    const lastDay = new Date(2026, parseInt(mm), 0).getDate();
    return customEnd === `2026-${mm}-${String(lastDay).padStart(2, "0")}` ? mm : "";
  })();

  return (
    <div className="flex flex-col gap-3">
      {/* Date range */}
      <div className="flex gap-2 flex-wrap items-center">
        <span className="text-sm text-[#8b8fa3] mr-1">日期：</span>
        {ranges.map((r) => (
          <button
            key={r.key}
            onClick={() => { onRangeChange(r.key); setShowCalendar(false); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              range === r.key
                ? "bg-[#2a3a5c] text-sky-300 border border-sky-400/40"
                : "bg-[#1a1d2e] text-[#8b8fa3] hover:bg-[#232740] border border-[#2a2e45]"
            }`}
          >
            {r.label}
          </button>
        ))}

        {/* Custom date picker */}
        <div className="relative" ref={calRef}>
          <button
            onClick={() => { setShowCalendar(!showCalendar); if (range !== "custom") onRangeChange("custom"); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
              range === "custom"
                ? "bg-[#2a3a5c] text-sky-300 border border-sky-400/40"
                : "bg-[#1a1d2e] text-[#8b8fa3] hover:bg-[#232740] border border-[#2a2e45]"
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            自訂
            {range === "custom" && customStart && customEnd && (
              <span className="text-xs text-[#8b8fa3] ml-1">{customStart} ~ {customEnd}</span>
            )}
          </button>

          {showCalendar && (
            <div className="absolute top-full left-0 mt-2 bg-[#1a1d2e] border border-[#2a2e45] rounded-lg p-4 shadow-xl z-50 min-w-[280px]">
              {availableMonths.length > 0 && (
                <div className="mb-3">
                  <label className="text-xs text-[#8b8fa3] block mb-1.5">按月選擇</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {availableMonths.map((mm) => (
                      <button
                        key={mm}
                        onClick={() => selectMonth(mm)}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                          matchedMonth === mm
                            ? "bg-[#2a3a5c] text-sky-300 border-sky-400/40"
                            : "bg-[#0f1117] text-[#8b8fa3] border-[#2a2e45] hover:bg-[#232740]"
                        }`}
                      >
                        {parseInt(mm)}月
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="space-y-3 pt-3 border-t border-[#2a2e45]">
                <div>
                  <label className="text-xs text-[#8b8fa3] block mb-1">開始日期</label>
                  <input
                    type="date"
                    value={customStart}
                    min={minDate}
                    max={maxDate}
                    onChange={(e) => onCustomDateChange(e.target.value, customEnd)}
                    className="w-full bg-[#0f1117] border border-[#2a2e45] rounded-lg px-3 py-2 text-sm text-[#e4e6f0] focus:border-sky-400/50 focus:outline-none [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#8b8fa3] block mb-1">結束日期</label>
                  <input
                    type="date"
                    value={customEnd}
                    min={minDate}
                    max={maxDate}
                    onChange={(e) => onCustomDateChange(customStart, e.target.value)}
                    className="w-full bg-[#0f1117] border border-[#2a2e45] rounded-lg px-3 py-2 text-sm text-[#e4e6f0] focus:border-sky-400/50 focus:outline-none [color-scheme:dark]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Line toggles */}
      <div className="flex gap-2 flex-wrap items-center">
        <span className="text-sm text-[#8b8fa3] mr-1">趨勢線：</span>
        {platformNames.map((name) => {
          const key = `p_${name}`;
          return (
            <button
              key={key}
              onClick={() => onLineToggle(key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                selectedLines.includes(key)
                  ? "bg-[#2a3a5c] text-sky-300 border border-sky-400/40"
                  : "bg-[#1a1d2e] text-[#8b8fa3] hover:bg-[#232740] border border-[#2a2e45]"
              }`}
            >
              {name}
            </button>
          );
        })}
        <span className="text-[#3a3e55] mx-1">|</span>
        {brandNames.map((name) => {
          const key = `b_${name}`;
          return (
            <button
              key={key}
              onClick={() => onLineToggle(key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                selectedLines.includes(key)
                  ? "bg-[#3a2a5c] text-violet-300 border border-violet-400/40"
                  : "bg-[#1a1d2e] text-[#8b8fa3] hover:bg-[#232740] border border-[#2a2e45]"
              }`}
            >
              mo+_{name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Convert "3/30" or "4/2" to "2026-03-30" or "2026-04-02" */
function toISODate(shortDate: string): string {
  const parts = shortDate.split("/");
  if (parts.length !== 2) return "";
  const m = parts[0].padStart(2, "0");
  const d = parts[1].padStart(2, "0");
  const year = parseInt(m) >= 1 && parseInt(m) <= 12 ? "2026" : "2026";
  return `${year}-${m}-${d}`;
}
