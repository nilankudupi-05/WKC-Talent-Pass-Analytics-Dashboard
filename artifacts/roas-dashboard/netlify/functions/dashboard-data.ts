import { JWT } from "google-auth-library";
import type { Category, DailyMetric, DashboardData } from "../../src/types";

// Row 1 in each tab is a merged group header ("Ad Spend" / "Revenues" / "ROAS");
// row 2 has the real column headers; data starts row 3. We recompute ROAS ourselves
// rather than reading the sheet's ROAS block, so those columns aren't fetched.
const RANGES = {
  showcasesSpend: "'Showcases Detail'!A3:E2000",
  showcasesRevenue: "'Showcases Detail'!G3:K2000",
  websiteSalesSpend: "'Website Sales Detail'!A3:F2000",
  websiteSalesRevenue: "'Website Sales Detail'!H3:M2000",
} as const;

interface ColumnMap {
  index: number;
  label: string;
}

// Showcases Detail: sub-category names line up identically across both blocks.
const SHOWCASES_SPEND_COLUMNS: ColumnMap[] = [
  { index: 1, label: "Bengaluru" },
  { index: 2, label: "Mumbai" },
  { index: 3, label: "Pune" },
];
const SHOWCASES_REVENUE_COLUMNS: ColumnMap[] = SHOWCASES_SPEND_COLUMNS;

// Website Sales Detail: the two blocks use different labels for the same sub-category
// (confirmed with the team), so we map both onto one canonical label per sub-category.
// "All Competitions - Generic - Old Ad" (spend-only, from the first few days) is dropped.
// "Unknown" (revenue-only — sales that can't be attributed to a specific competition)
// is kept as its own sub-category with no spend, so its ROAS naturally shows as "—".
const WEBSITE_SALES_SPEND_COLUMNS: ColumnMap[] = [
  { index: 2, label: "CW" },
  { index: 3, label: "Handwriting" },
  { index: 4, label: "LEGO" },
];
const WEBSITE_SALES_REVENUE_COLUMNS: ColumnMap[] = [
  { index: 1, label: "Unknown" },
  { index: 2, label: "CW" }, // sheet header: "Color Wizards"
  { index: 3, label: "Handwriting" }, // sheet header: "Handwriting Champs"
  { index: 4, label: "LEGO" }, // sheet header: "Build It!"
];
const WEBSITE_SALES_REVENUE_ONLY_LABELS = ["Unknown"];

function getAuthClient(): JWT {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  if (!email || !rawKey) {
    throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY");
  }
  return new JWT({
    email,
    // .env / Netlify UI store the key's newlines as literal "\n" — convert back.
    key: rawKey.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
}

async function fetchValueRanges(auth: JWT, spreadsheetId: string, ranges: string[]): Promise<string[][][]> {
  const params = new URLSearchParams();
  for (const range of ranges) params.append("ranges", range);
  params.set("valueRenderOption", "FORMATTED_VALUE");

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet?${params.toString()}`;
  const res = await auth.request<{ valueRanges: Array<{ values?: string[][] }> }>({ url });
  return res.data.valueRanges.map((valueRange) => valueRange.values ?? []);
}

function parseNumber(raw: string | undefined): number {
  if (!raw) return 0;
  const cleaned = raw.replace(/,/g, "").trim();
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

/** Maps each dated row to { label: value } using the given column positions. */
function rowsToDateMap(rows: string[][], columns: ColumnMap[]): Map<string, Record<string, number>> {
  const map = new Map<string, Record<string, number>>();
  for (const row of rows) {
    const date = row[0]?.trim();
    if (!date) continue;
    const entry: Record<string, number> = {};
    for (const column of columns) {
      entry[column.label] = parseNumber(row[column.index]);
    }
    map.set(date, entry);
  }
  return map;
}

function buildCategoryMetrics(
  category: Category,
  spendRows: string[][],
  spendColumns: ColumnMap[],
  revenueRows: string[][],
  revenueColumns: ColumnMap[],
  revenueOnlyLabels: string[] = [],
): DailyMetric[] {
  const spendByDate = rowsToDateMap(spendRows, spendColumns);
  const revenueByDate = rowsToDateMap(revenueRows, revenueColumns);
  const labels = [...new Set([...spendColumns.map((c) => c.label), ...revenueOnlyLabels])];
  const dates = new Set([...spendByDate.keys(), ...revenueByDate.keys()]);

  const metrics: DailyMetric[] = [];
  for (const date of dates) {
    for (const label of labels) {
      const spend = spendByDate.get(date)?.[label] ?? 0;
      const revenue = revenueByDate.get(date)?.[label] ?? 0;
      if (spend === 0 && revenue === 0) continue;
      metrics.push({
        date,
        category,
        subCategory: label,
        spend,
        revenue,
        roas: spend > 0 ? Math.round((revenue / spend) * 100) / 100 : null,
      });
    }
  }
  return metrics;
}

export default async (): Promise<Response> => {
  try {
    const sheetId = process.env.GOOGLE_SHEET_ID;
    if (!sheetId) throw new Error("Missing GOOGLE_SHEET_ID");

    const auth = getAuthClient();
    const [showcasesSpendRows, showcasesRevenueRows, websiteSalesSpendRows, websiteSalesRevenueRows] =
      await fetchValueRanges(auth, sheetId, [
        RANGES.showcasesSpend,
        RANGES.showcasesRevenue,
        RANGES.websiteSalesSpend,
        RANGES.websiteSalesRevenue,
      ]);

    const metrics: DailyMetric[] = [
      ...buildCategoryMetrics("Showcases", showcasesSpendRows, SHOWCASES_SPEND_COLUMNS, showcasesRevenueRows, SHOWCASES_REVENUE_COLUMNS),
      ...buildCategoryMetrics(
        "Website Sales",
        websiteSalesSpendRows,
        WEBSITE_SALES_SPEND_COLUMNS,
        websiteSalesRevenueRows,
        WEBSITE_SALES_REVENUE_COLUMNS,
        WEBSITE_SALES_REVENUE_ONLY_LABELS,
      ),
    ];

    const dates = metrics.map((m) => m.date).sort();
    const categories: Category[] = ["Showcases", "Website Sales"];
    const subCategories = [...new Set(metrics.map((m) => m.subCategory))].sort();

    const data: DashboardData = {
      generatedAt: new Date().toISOString(),
      dateRange: { start: dates[0] ?? "", end: dates[dates.length - 1] ?? "" },
      metrics,
      categories,
      subCategories,
    };

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "content-type": "application/json", "cache-control": "public, max-age=300" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
};
