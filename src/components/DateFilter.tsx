"use client";

interface Props {
  range: "all" | "7d" | "14d" | "30d";
  onRangeChange: (range: "all" | "7d" | "14d" | "30d") => void;
  selectedLines: string[];
  platformNames: string[];
  brandNames: string[];
  onLineToggle: (key: string) => void;
}

export default function DateFilter({
  range,
  onRangeChange,
  selectedLines,
  platformNames,
  brandNames,
  onLineToggle,
}: Props) {
  const ranges: { key: Props["range"]; label: string }[] = [
    { key: "7d", label: "近7日" },
    { key: "14d", label: "近14日" },
    { key: "30d", label: "近30日" },
    { key: "all", label: "全部" },
  ];

  return (
    <div className="flex flex-col gap-3">
      {/* Date range */}
      <div className="flex gap-2 flex-wrap items-center">
        <span className="text-sm text-[#8b8fa3] mr-1">日期：</span>
        {ranges.map((r) => (
          <button
            key={r.key}
            onClick={() => onRangeChange(r.key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              range === r.key
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                : "bg-[#1a1d2e] text-[#8b8fa3] hover:bg-[#232740] border border-[#2a2e45]"
            }`}
          >
            {r.label}
          </button>
        ))}
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
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
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
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
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
