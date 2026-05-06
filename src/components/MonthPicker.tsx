"use client";

import { useState, useRef, useEffect } from "react";

const MONTH_NAMES = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];

interface Props {
  /** Selected month in "YYYY/MM" format (e.g., "2026/04") */
  value: string;
  onChange: (month: string) => void;
  /** Months with actual data, in "YYYY/MM" format */
  availableMonths: string[];
  align?: "left" | "right";
}

export default function MonthPicker({ value, onChange, availableMonths, align = "right" }: Props) {
  const [show, setShow] = useState(false);

  // Initial display year follows the current value
  const initialYear = (() => {
    const m = value.match(/^(\d{4})\//);
    return m ? parseInt(m[1]) : 2026;
  })();
  const [displayYear, setDisplayYear] = useState(initialYear);

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setShow(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const availableSet = new Set(availableMonths);
  const valueMatch = value.match(/^(\d{4})\/(\d{2})$/);
  const selectedYear = valueMatch ? parseInt(valueMatch[1]) : 0;
  const selectedMonth = valueMatch ? valueMatch[2] : "";

  function selectMonth(mm: string) {
    onChange(`${displayYear}/${mm}`);
    setShow(false);
  }

  function getLabel() {
    if (valueMatch) return `${selectedYear}年${parseInt(selectedMonth)}月`;
    return "選擇月份";
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setShow(!show)}
        className="px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 bg-[#2a3a5c] text-sky-300 border border-sky-400/40 hover:bg-[#324a6e] transition-all"
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        {getLabel()}
        <svg className={`w-3 h-3 transition-transform ${show ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {show && (
        <div className={`absolute top-full ${align === "right" ? "right-0" : "left-0"} mt-2 bg-[#1a1d2e] border border-[#2a2e45] rounded-xl shadow-2xl z-50 w-[280px] p-4`}>
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
          <div className="grid grid-cols-3 gap-1.5">
            {Array.from({ length: 12 }, (_, i) => {
              const mm = String(i + 1).padStart(2, "0");
              const hasData = availableSet.has(`${displayYear}/${mm}`);
              const isActive = selectedYear === displayYear && selectedMonth === mm;
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
        </div>
      )}
    </div>
  );
}
