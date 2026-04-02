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
  preSale: number | null;
  orderPayment: number | null;
  logistics: number | null;
  productIssue: number | null;
  afterSale: number | null;
  complaint: number | null;
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

const BASE_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTQRwK1X6nwxgRIwUX_utrvFCwnJzGTGpXvgzMNIqjum2fDTDO-3BfcgWD87rgMsg/pub";

const SHEET_CSV_URL = `${BASE_URL}?output=csv`;
const SHOPEE_CSV_URL = `${BASE_URL}?gid=583268971&single=true&output=csv`;
const CATEGORY_CSV_URL = `${BASE_URL}?gid=1880927677&single=true&output=csv`;

async function fetchCSV(url: string): Promise<string[][]> {
  const res = await fetch(url, { cache: "no-store" });
  const text = await res.text();
  return text.split(/\r?\n/).filter((l) => l.trim()).map(parseCSVLine);
}

function parseShopeeCSV(rows: string[][]): ShopeeMonthData[] {
  // Row 0 = header, rows 1+ = data
  // Columns: 月份, 訪客數, 聊聊詢問數, 聊聊訪客數, 訪客詢問率, 已回應聊聊數, 未回應聊聊數, 回應率, 平均對話時間, 買家數, 訂單數, 件數, 銷售額, 轉換率
  if (rows.length < 2) return [];
  const result: ShopeeMonthData[] = [];
  for (let i = 1; i < rows.length; i++) {
    const c = rows[i];
    const month = (c[0] || "").trim();
    if (!month) continue;
    result.push({
      month,
      visitors: normalizeNumber(c[1] || "0"),
      chatInquiries: normalizeNumber(c[2] || "0"),
      chatVisitors: normalizeNumber(c[3] || "0"),
      inquiryRate: (c[4] || "0%").trim(),
      respondedChats: normalizeNumber(c[5] || "0"),
      unrespondedChats: normalizeNumber(c[6] || "0"),
      responseRate: (c[7] || "0%").trim(),
      avgChatTime: (c[8] || "0s").trim(),
      buyers: normalizeNumber(c[9] || "0"),
      orders: normalizeNumber(c[10] || "0"),
      items: normalizeNumber(c[11] || "0"),
      sales: normalizeNumber(c[12] || "0"),
      conversionRate: (c[13] || "0%").trim(),
    });
  }
  return result;
}

function parseCategoryCSV(rows: string[][]): CategoryData[] {
  // Row 0 = header, rows 1+ = data
  // Columns: 月份, 平台, 售前諮詢, 訂單/金流, 物流配送, 商品問題, 售後服務, 客訴/其他
  if (rows.length < 2) return [];
  const result: CategoryData[] = [];
  for (let i = 1; i < rows.length; i++) {
    const c = rows[i];
    const month = (c[0] || "").trim();
    const platform = (c[1] || "").trim();
    if (!month || !platform) continue;

    const parseNullable = (val: string): number | null => {
      const trimmed = (val || "").trim();
      if (trimmed === "") return null;
      const n = normalizeNumber(trimmed);
      return n;
    };

    result.push({
      month,
      platform,
      preSale: parseNullable(c[2]),
      orderPayment: parseNullable(c[3]),
      logistics: parseNullable(c[4]),
      productIssue: parseNullable(c[5]),
      afterSale: parseNullable(c[6]),
      complaint: parseNullable(c[7]),
    });
  }
  return result;
}

export async function fetchDashboardData(): Promise<DashboardData> {
  // Fetch all three sheets in parallel
  const [mainRows, shopeeRows, categoryRows] = await Promise.all([
    fetchCSV(SHEET_CSV_URL),
    fetchCSV(SHOPEE_CSV_URL).catch(() => [] as string[][]),
    fetchCSV(CATEGORY_CSV_URL).catch(() => [] as string[][]),
  ]);

  // --- Parse main sheet (進線數據) ---
  if (mainRows.length < 3) throw new Error("Not enough rows in CSV");

  const dateRow = mainRows[1];
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

  for (let r = 2; r < mainRows.length; r++) {
    const cols = mainRows[r];
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
    const platformTotal = Object.values(platforms).reduce((s, v) => s + v, 0);
    const brandTotal = Object.values(brands).reduce((s, v) => s + v, 0);
    const dailyTotal = platformTotal + brandTotal;
    return { date, platforms, brands, dailyTotal };
  });

  const days = allDays.filter((d) => d.dailyTotal > 0);
  const grandTotal = days.reduce((s, d) => s + d.dailyTotal, 0);

  // --- Parse Shopee & Category sheets ---
  const shopeeData = parseShopeeCSV(shopeeRows);
  const categoryData = parseCategoryCSV(categoryRows);

  return { days, platformNames, brandNames, grandTotal, shopeeData, categoryData };
}
