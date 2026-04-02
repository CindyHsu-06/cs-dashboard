"use client";

interface Props {
  range: "all" | "7d" | "14d" | "30d";
  onRangeChange: (range: "all" | "7d" | "14d" | "30d") => void;
  selectedPlatforms: string[];
  platformNames: string[];
  onPlatformToggle: (name: string) => void;
}

export default function DateFilter({
  range,
  onRangeChange,
  selectedPlatforms,
  platformNames,
  onPlatformToggle,
}: Props) {
  const ranges: { key: Props["range"]; label: string }[] = [
    { key: "7d", label: "近7日" },
    { key: "14d", label: "近14日" },
    { key: "30d", label: "近30日" },
    { key: "all", label: "全部" },
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
      <div className="flex gap-2 flex-wrap">
        <span className="text-sm text-[#8b8fa3] self-center mr-1">日期：</span>
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
      <div className="flex gap-2 flex-wrap">
        <span className="text-sm text-[#8b8fa3] self-center mr-1">平台：</span>
        {platformNames.map((name) => (
          <button
            key={name}
            onClick={() => onPlatformToggle(name)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              selectedPlatforms.includes(name)
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                : "bg-[#1a1d2e] text-[#8b8fa3] hover:bg-[#232740] border border-[#2a2e45]"
            }`}
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  );
}
