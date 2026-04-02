export interface DayData {
  date: string;
  platforms: Record<string, number>;
  brands: Record<string, number>;
  dailyTotal: number;
}

export interface ShopeeMonthData {
  month: string;
  visitors: number;
  chatInquiries: number;
  chatVisitors: number;
  inquiryRate: string;
  respondedChats: number;
  unrespondedChats: number;
  responseRate: string;
  avgChatTime: string;
  buyers: number;
  orders: number;
  items: number;
  sales: number;
  conversionRate: string;
}

export interface CategoryData {
  month: string;
  platform: string;
  preSale: number | null;       // 售前諮詢
  orderPayment: number | null;  // 訂單/金流
  logistics: number | null;     // 物流配送
  productIssue: number | null;  // 商品問題
  afterSale: number | null;     // 售後服務
  complaint: number | null;     // 客訴/其他
}

export interface DashboardData {
  days: DayData[];
  platformNames: string[];
  brandNames: string[];
  grandTotal: number;
  shopeeData: ShopeeMonthData[];
  categoryData: CategoryData[];
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

// Demo data from user's Shopee export (aggregated across all shops)
function getDemoShopeeData(): ShopeeMonthData[] {
  return [
    {
      month: "2026/04",
      visitors: 958,
      chatInquiries: 12,
      chatVisitors: 12,
      inquiryRate: "1.25%",
      respondedChats: 12,
      unrespondedChats: 0,
      responseRate: "100.00%",
      avgChatTime: "30min34s",
      buyers: 1,
      orders: 1,
      items: 2,
      sales: 1610,
      conversionRate: "8.33%",
    },
  ];
}

// Placeholder category data — to be filled in by user
function getDemoCategoryData(): CategoryData[] {
  return [
    { month: "2026/04", platform: "蝦皮", preSale: 5, orderPayment: 2, logistics: 1, productIssue: 2, afterSale: 1, complaint: 1 },
    { month: "2026/04", platform: "LINE OA", preSale: null, orderPayment: null, logistics: null, productIssue: null, afterSale: null, complaint: null },
    { month: "2026/04", platform: "電話", preSale: null, orderPayment: null, logistics: null, productIssue: null, afterSale: null, complaint: null },
    { month: "2026/04", platform: "MOMO", preSale: null, orderPayment: null, logistics: null, productIssue: null, afterSale: null, complaint: null },
  ];
}

export async function fetchDashboardData(): Promise<DashboardData> {
  const res = await fetch(SHEET_CSV_URL, { cache: "no-store" });
  const text = await res.text();
  const lines = text.split(/\r?\n/).filter((l) => l.trim());

  if (lines.length < 3) throw new Error("Not enough rows in CSV");

  const dateRow = parseCSVLine(lines[1]);

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

  for (let r = 2; r < lines.length; r++) {
    const cols = parseCSVLine(lines[r]);
    const col0 = (cols[0] || "").trim();
    const col1 = (cols[1] || "").trim();
    if (col0.match(/總計|小計/i) || (!col0 && !col1)) continue;

    const values = dateIndices.map((ci) => normalizeNumber(cols[ci] || "0"));

    if (r <= 5) {
      platformNames.push(col0);
      platformRows.push(values);
    } else {
      if (col1) {
        brandNames.push(col1);
        brandRows.push(values);
      }
    }
  }

  const allDays: DayData[] = dates.map((date, di) => {
    const platforms: Record<string, number> = {};
    platformNames.forEach((name, pi) => {
      platforms[name] = platformRows[pi]?.[di] ?? 0;
    });

    const brands: Record<string, number> = {};
    brandNames.forEach((name, bi) => {
      brands[name] = brandRows[bi]?.[di] ?? 0;
    });

    const dailyTotal = Object.values(platforms).reduce((s, v) => s + v, 0);
    return { date, platforms, brands, dailyTotal };
  });

  const days = allDays.filter((d) => d.dailyTotal > 0);
  const grandTotal = days.reduce((s, d) => s + d.dailyTotal, 0);

  return {
    days,
    platformNames,
    brandNames,
    grandTotal,
    shopeeData: getDemoShopeeData(),
    categoryData: getDemoCategoryData(),
  };
}
