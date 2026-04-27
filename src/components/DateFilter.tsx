"use client";

import { useState, useRef, useEffect } from "react";

export type DateRange = "all" | "7d" | "14d" | "30d" | "custom";

const MONTH_NAMES = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];

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
  const [displayYear, setDisplayYear] = useState(2026);
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

  const minDate = availableDates.length > 0 ? toISODate(availableDates[0]) : "";
  const maxDate = availableDates.length > 0 ? toISODate(availableDates[availableDates.length - 1]) : "";

  // All data is currently in 2026; future-proofed for cross-year data
  const availableYearMonths = new Set(
    availableDates.map((d) => {
      const mm = d.split("/")[0]?.padStart(2, "0");
      return mm ? `2026-${mm}` : "";
    }).filter(Boolean)
  );

  function selectMonth(mm: string) {
    const yyyy = String(displayYear);
    const lastDay = new Date(displayYear, parseInt(mm), 0).getDate();
    const start = `${yyyy}-${mm}-01`;
    const end = `${yyyy}-${mm}-${String(lastDay).padStart(2, "0")}`;
    onCustomDateChange(start, end);
  }

  const matchedYearMonth = (() => {
    if (range !== "custom") return { year: 0, month: "" };
    const m = customStart.match(/^(\d{4})-(\d{2})-01$/);
    if (!m) return { year: 0, month: "" };
    const yyyy = m[1];
    const mm = m[2];
    const lastDay = new Date(parseInt(yyyy), parseInt(mm), 0).getDate();
    if (customEnd === `${yyyy}-${mm}-${String(lastDay).padStart(2, "0")}`) {
      return { year: parseInt(yyyy), month: mm };
    }
    return { year: 0, month: "" };
  })();
  const matchedMonth = matchedYearMonth.year === displayYear ? matchedYearMonth.month : "";

  const presets: { key: DateRange; label: string }[] = [
    { key: "7d", label: "近7日" },
    { key: "14d", label: "近14日" },
    { key: "30d", label: "近30日" },
  ];

  function getTriggerLabel() {
    if (range === "7d") return `近7日 · ${formatRange(maxDate, 7)}`;
    if (range === "14d") return `近14日 · ${formatRange(maxDate, 14)}`;
    if (range === "30d") return `近30日 · ${formatRange(maxDate, 30)}`;
    if (range === "custom" && matchedYearMonth.month) return `${matchedYearMonth.year}年${parseInt(matchedYearMonth.month)}月 · ${shortDate(customStart)} ~ ${shortDate(customEnd)}`;
    if (range === "custom" && customStart && customEnd) return `自訂 · ${shortDate(customStart)} ~ ${shortDate(customEnd)}`;
    return "選擇區間";
  }

  // The "全部" button + the integrated picker button
  const isUnified = range !== "all";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2 flex-wrap items-center">
        <span className="text-sm text-[#8b8fa3] mr-1">日期：</span>

        {/* 全部 - separate button */}
        <button
          onClick={() => { onRangeChange("all"); setShowCalendar(false); }}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            range === "all"
              ? "bg-[#2a3a5c] text-sky-300 border border-sky-400/40"
              : "bg-[#1a1d2e] text-[#8b8fa3] hover:bg-[#232740] border border-[#2a2e45]"
          }`}
        >
          全部
        </button>

        {/* Unified picker button (近7/14/30日 + 自訂) */}
        <div className="relative" ref={calRef}>
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
              isUnified
                ? "bg-[#2a3a5c] text-sky-300 border border-sky-400/40"
                : "bg-[#1a1d2e] text-[#8b8fa3] hover:bg-[#232740] border border-[#2a2e45]"
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {isUnified ? getTriggerLabel() : "選擇區間"}
            <svg className={`w-3 h-3 transition-transform ${showCalendar ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showCalendar && (
            <div className="absolute top-full left-0 mt-2 bg-[#1a1d2e] border border-[#2a2e45] rounded-xl shadow-2xl z-50 flex w-[460px] overflow-hidden">
              {/* Left sidebar - quick presets */}
              <div className="w-[110px] bg-[#0f1117] border-r border-[#2a2e45] p-2 space-y-0.5">
                {presets.map((p) => (
                  <button
                    key={p.key}
                    onClick={() => { onRangeChange(p.key); setShowCalendar(false); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                      range === p.key
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
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setDisplayYear(displayYear - 1)}
                      className="text-[#8b8fa3] hover:text-sky-300 transition-colors p-0.5"
                      aria-label="Previous year"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <span className="text-sm text-[#c0c3d1] font-medium min-w-[40px] text-center tabular-nums">{displayYear}</span>
                    <button
                      onClick={() => setDisplayYear(displayYear + 1)}
                      className="text-[#8b8fa3] hover:text-sky-300 transition-colors p-0.5"
                      aria-label="Next year"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-1.5 mb-4">
                  {Array.from({ length: 12 }, (_, i) => {
                    const mm = String(i + 1).padStart(2, "0");
                    const hasData = availableYearMonths.has(`${displayYear}-${mm}`);
                    const isActive = matchedMonth === mm;
                    return (
                      <button
                        key={mm}
                        onClick={() => { if (hasData) selectMonth(mm); }}
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
                      value={customStart}
                      min={minDate}
                      max={maxDate}
                      onChange={(e) => onCustomDateChange(e.target.value, customEnd)}
                      className="flex-1 bg-[#0f1117] border border-[#2a2e45] rounded-lg px-2 py-1.5 text-xs text-[#e4e6f0] focus:border-sky-400/50 focus:outline-none [color-scheme:dark]"
                    />
                    <span className="text-[#6b7084] text-xs">~</span>
                    <input
                      type="date"
                      value={customEnd}
                      min={minDate}
                      max={maxDate}
                      onChange={(e) => onCustomDateChange(customStart, e.target.value)}
                      className="flex-1 bg-[#0f1117] border border-[#2a2e45] rounded-lg px-2 py-1.5 text-xs text-[#e4e6f0] focus:border-sky-400/50 focus:outline-none [color-scheme:dark]"
                    />
                  </div>
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

function toISODate(shortDate: string): string {
  const parts = shortDate.split("/");
  if (parts.length !== 2) return "";
  return `2026-${parts[0].padStart(2, "0")}-${parts[1].padStart(2, "0")}`;
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
