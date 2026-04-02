export interface DayData {
  date: string;
  platforms: Record<string, number>;
  brands: Record<string, number>;
  dailyTotal: number;
}

export interface DashboardData {
  days: DayData[];
  platformNames: string[];
  brandNames: string[];
  grandTotal: number;
}

function normalizeNumber(val: string): number {
  const fullToHalf: Record<string, string> = {
    "０": "0", "１": "1", "２": "2", "３": "3", "４": "4",
    "５": "5", "６": "6", "７": "7", "８": "8", "９": "9",
  };
  const normalized = val.replace(/[０-９]/g, (ch) => fullToHalf[ch] || ch).trim();
  const n = parseFloat(normalized);
  return isNaN(n) ? 0 : n;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        result.push(current);
        current = "";
      } else {
        current += ch;
      }
    }
  }
  result.push(current);
  return result;
}

const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTQRwK1X6nwxgRIwUX_utrvFCwnJzGTGpXvgzMNIqjum2fDTDO-3BfcgWD87rgMsg/pub?output=csv";

export async function fetchDashboardData(): Promise<DashboardData> {
  const res = await fetch(SHEET_CSV_URL, { cache: "no-store" });
  const text = await res.text();
  const lines = text.split(/\r?\n/).filter((l) => l.trim());

  if (lines.length < 3) throw new Error("Not enough rows in CSV");

  const dateRow = parseCSVLine(lines[1]);

  // Find date columns (col index 2+, matching M/D pattern)
  const dateIndices: number[] = [];
  const dates: string[] = [];
  for (let i = 2; i < dateRow.length; i++) {
    const cell = dateRow[i].trim();
    if (cell.match(/^\d+\/\d+$/)) {
      dateIndices.push(i);
      dates.push(cell);
    }
  }

  const platformNames: string[] = [];
  const brandNames: string[] = [];
  const platformRows: number[][] = [];
  const brandRows: number[][] = [];

  // Row indices (0-based in lines array):
  // 0 = header, 1 = dates
  // 2-5 = platforms (LINE OA, 電話, 蝦皮, MOMO) — label in col[0]
  // 6-17 = brands — label in col[1]
  // 18 = 小計, 19 = 總計
  for (let r = 2; r < lines.length; r++) {
    const cols = parseCSVLine(lines[r]);

    // Skip summary rows
    const col0 = (cols[0] || "").trim();
    const col1 = (cols[1] || "").trim();
    if (col0.match(/總計|小計/i) || (!col0 && !col1)) continue;

    const values = dateIndices.map((ci) => normalizeNumber(cols[ci] || "0"));

    if (r <= 5) {
      // Platform rows: label in col[0]
      platformNames.push(col0);
      platformRows.push(values);
    } else {
      // Brand rows: label in col[1]
      if (col1) {
        brandNames.push(col1);
        brandRows.push(values);
      }
    }
  }

  // Build day-by-day data, only include days that have at least some data
  const allDays: DayData[] = dates.map((date, di) => {
    const platforms: Record<string, number> = {};
    platformNames.forEach((name, pi) => {
      platforms[name] = platformRows[pi]?.[di] ?? 0;
    });

    const brands: Record<string, number> = {};
    brandNames.forEach((name, bi) => {
      brands[name] = brandRows[bi]?.[di] ?? 0;
    });

    const dailyTotal =
      Object.values(platforms).reduce((s, v) => s + v, 0);

    return { date, platforms, brands, dailyTotal };
  });

  // Filter out days with zero activity
  const days = allDays.filter((d) => d.dailyTotal > 0);
  const grandTotal = days.reduce((s, d) => s + d.dailyTotal, 0);

  return { days, platformNames, brandNames, grandTotal };
}
