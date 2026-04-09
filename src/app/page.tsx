"use client";

import { useEffect, useState, useMemo } from "react";
import { DashboardData, fetchDashboardData } from "@/lib/fetchData";
import ChartSetup from "@/components/ChartSetup";
import KPICards from "@/components/KPICards";
import TrendChart from "@/components/TrendChart";
import PieChart from "@/components/PieChart";
import DateFilter, { DateRange } from "@/components/DateFilter";
import DetailTable from "@/components/DetailTable";
import ShopeeMetrics from "@/components/ShopeeMetrics";
import CategoryBreakdown from "@/components/CategoryBreakdown";

/** Convert "3/30" → "2026-03-30" for comparison */
function toISO(shortDate: string): string {
  const parts = shortDate.split("/");
  if (parts.length !== 2) return "";
  return `2026-${parts[0].padStart(2, "0")}-${parts[1].padStart(2, "0")}`;
}

/** Filter days by N calendar days back from the last date in the array */
function filterByCalendarDays<T extends { date: string }>(days: T[], n: number): T[] {
  if (days.length === 0) return days;
  const lastISO = toISO(days[days.length - 1].date);
  const lastDate = new Date(lastISO);
  lastDate.setDate(lastDate.getDate() - (n - 1));
  const cutoff = lastDate.toISOString().slice(0, 10);
  return days.filter((d) => toISO(d.date) >= cutoff);
}

export default function Home() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<DateRange>("all");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [selectedLines, setSelectedLines] = useState<string[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  useEffect(() => {
    fetchDashboardData()
      .then((d) => {
        setData(d);
        setLastUpdated(new Date().toLocaleString("zh-TW"));

        // Auto-select all lines that have actual data
        const keys: string[] = [];
        d.platformNames.forEach((name) => {
          const total = d.days.reduce((s, day) => s + (day.platforms[name] ?? 0), 0);
          if (total > 0) keys.push(`p_${name}`);
        });
        d.brandNames.forEach((name) => {
          const total = d.days.reduce((s, day) => s + (day.brands[name] ?? 0), 0);
          if (total > 0) keys.push(`b_${name}`);
        });
        setSelectedLines(keys);

        // Set custom date defaults
        if (d.days.length > 0) {
          setCustomStart(toISO(d.days[0].date));
          setCustomEnd(toISO(d.days[d.days.length - 1].date));
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredData = useMemo(() => {
    if (!data) return null;
    let days = data.days;
    if (range === "7d") days = filterByCalendarDays(days, 7);
    else if (range === "14d") days = filterByCalendarDays(days, 14);
    else if (range === "30d") days = filterByCalendarDays(days, 30);
    else if (range === "custom" && customStart && customEnd) {
      days = days.filter((d) => {
        const iso = toISO(d.date);
        return iso >= customStart && iso <= customEnd;
      });
    }
    return { ...data, days, grandTotal: days.reduce((s, d) => s + d.dailyTotal, 0) };
  }, [data, range, customStart, customEnd]);

  const toggleLine = (key: string) => {
    setSelectedLines((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleCustomDateChange = (start: string, end: string) => {
    setCustomStart(start);
    setCustomEnd(end);
    setRange("custom");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-10 h-10 border-4 border-sky-400/60 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-[#8b8fa3]">載入資料中...</p>
        </div>
      </div>
    );
  }

  if (error || !filteredData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-400">
          <p className="text-xl font-semibold mb-2">載入失敗</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-[1400px] mx-auto px-4 py-6 md:px-6 md:py-8 space-y-6">
      <ChartSetup />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <img src="/logo.jpg" alt="Logo" className="h-10 md:h-12 w-auto rounded" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#e4e6f0]">客服進線監控</h1>
            <p className="text-sm text-[#6b7084] mt-1">Customer Service Dashboard</p>
          </div>
        </div>
        <div className="text-xs text-[#6b7084] bg-[#1a1d2e] px-3 py-1.5 rounded-lg border border-[#2a2e45]">
          最後更新：{lastUpdated}
        </div>
      </div>

      {/* KPI Cards */}
      <KPICards data={filteredData} />

      {/* Filters */}
      <DateFilter
        range={range}
        onRangeChange={setRange}
        customStart={customStart}
        customEnd={customEnd}
        onCustomDateChange={handleCustomDateChange}
        selectedLines={selectedLines}
        platformNames={filteredData.platformNames}
        brandNames={filteredData.brandNames}
        onLineToggle={toggleLine}
        availableDates={data?.days.map((d) => d.date) || []}
      />

      {/* Trend Chart + Platform Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TrendChart
            days={filteredData.days}
            platformNames={filteredData.platformNames}
            brandNames={filteredData.brandNames}
            selectedLines={selectedLines}
          />
        </div>
        <PieChart
          days={filteredData.days}
          platformNames={filteredData.platformNames}
          brandNames={filteredData.brandNames}
          selectedLines={selectedLines}
        />
      </div>

      {/* Shopee Metrics */}
      <ShopeeMetrics data={filteredData.shopeeData} />

      {/* Issue Category Breakdown */}
      <CategoryBreakdown data={filteredData.categoryData} />

      {/* Detail Table */}
      <DetailTable
        days={filteredData.days}
        platformNames={filteredData.platformNames}
        brandNames={filteredData.brandNames}
      />

      {/* Footer */}
      <footer className="text-center text-xs text-[#6b7084] py-4 border-t border-[#2a2e45]">
        2C 客服進線監控系統 &copy; {new Date().getFullYear()}
      </footer>
    </main>
  );
}
