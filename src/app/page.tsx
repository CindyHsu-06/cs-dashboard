"use client";

import { useEffect, useState, useMemo } from "react";
import { DashboardData, fetchDashboardData } from "@/lib/fetchData";
import ChartSetup from "@/components/ChartSetup";
import KPICards from "@/components/KPICards";
import TrendChart from "@/components/TrendChart";
import PieChart from "@/components/PieChart";
import DateFilter from "@/components/DateFilter";
import DetailTable from "@/components/DetailTable";
import ShopeeMetrics from "@/components/ShopeeMetrics";
import CategoryBreakdown from "@/components/CategoryBreakdown";

export default function Home() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<"all" | "7d" | "14d" | "30d">("all");
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
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredData = useMemo(() => {
    if (!data) return null;
    let days = data.days;
    if (range === "7d") days = days.slice(-7);
    else if (range === "14d") days = days.slice(-14);
    else if (range === "30d") days = days.slice(-30);
    return { ...data, days, grandTotal: days.reduce((s, d) => s + d.dailyTotal, 0) };
  }, [data, range]);

  const toggleLine = (key: string) => {
    setSelectedLines((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
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
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">客服進線監控</h1>
          <p className="text-sm text-[#8b8fa3] mt-1">Customer Service Dashboard</p>
        </div>
        <div className="text-xs text-[#8b8fa3] bg-[#1a1d2e] px-3 py-1.5 rounded-lg border border-[#2a2e45]">
          最後更新：{lastUpdated}
        </div>
      </div>

      {/* KPI Cards */}
      <KPICards data={filteredData} />

      {/* Filters */}
      <DateFilter
        range={range}
        onRangeChange={setRange}
        selectedLines={selectedLines}
        platformNames={filteredData.platformNames}
        brandNames={filteredData.brandNames}
        onLineToggle={toggleLine}
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
      <footer className="text-center text-xs text-[#8b8fa3] py-4 border-t border-[#2a2e45]">
        2C 客服進線監控系統 &copy; {new Date().getFullYear()}
      </footer>
    </main>
  );
}
