import { JWT } from "google-auth-library";
import type { Category, DailyMetric, DashboardData } from "../../src/types";

// Each tab holds an "Ad Spend" block and a "Revenues" block side by side.
// Row 1 is a merged group header ("Ad Spend" / "Revenues" / "ROAS"); row 2 has the
// real column headers; data starts row 3. Every range below starts at row 2 so the
// header row comes back with the data and columns can be located by name rather than
// by position — see resolveColumns(). Ranges are deliberately unbounded at the end so
// the sheet can grow without silently truncating.
//
// We recompute ROAS ourselves rather than reading the sheet's ROAS block, so those
// columns aren't fetched.
const RANGES = {
  showcasesSpend: "'Showcases Detail'!A2:E",
  showcasesRevenue: "'Showcases Detail'!G2:K",
  websiteSalesSpend: "'Website Sales Detail'!A2:F",
  websiteSalesRevenue: "'Website Sales Detail'!H2:M",
} as const;

interface SubCategoryColumn {
  /** Canonical sub-category name, used everywhere in the UI. */
  label: string;
  /** Exact header text in row 2 of the sheet for this block. */
  header: string;
}

interface ResolvedColumn {
  index: number;
  label: string;
}

// Showcases Detail: the sub-category headers are identical across both blocks.
const SHOWCASES_SPEND_COLUMNS: SubCategoryColumn[] = [
  { label: "Bengaluru", header: "Bengaluru" },
  { label: "Mumbai", header: "Mumbai" },
  { label: "Pune", header: "Pune" },
];
const SHOWCASES_REVENUE_COLUMNS: SubCategoryColumn[] = SHOWCASES_SPEND_COLUMNS;

// Website Sales Detail: the two blocks use different header text for the same
// sub-category (confirmed with the team), so both map onto one canonical label.
//
// "All Competitions - Generic - Old Ad" (spend-only, from the first few days) is
// intentionally not listed, which drops it from the dashboard.
// "Unknown" (revenue-only — sales that can't be attributed to a specific competition)
// is kept as its own sub-category with no spend, so its ROAS naturally shows as "—".
const WEBSITE_SALES_SPEND_COLUMNS: SubCategoryColumn[] = [
  { label: "CW", header: "CW" },
  { label: "Handwriting", header: "Handwriting" },
  { label: "LEGO", header: "LEGO" },
];
const WEBSITE_SALES_REVENUE_COLUMNS: SubCategoryColumn[] = [
  { label: "Unknown", header: "Unknown" },
  { label: "CW", header: "Color Wizards" },
  { label: "Handwriting", header: "Handwriting Champs" },
  { label: "LEGO", header: "Build It!" },
];

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

/**
 * UNFORMATTED_VALUE, not FORMATTED_VALUE: dates come back as serial numbers rather
 * than whatever the sheet happens to display, and money keeps its paise instead of
 * being rounded to the displayed whole rupees. Both downstream consumers assume ISO
 * dates (they sort lexicographically), so reading display text would make correctness
 * depend on the sheet's date format setting.
 */
async function fetchValueRanges(auth: JWT, spreadsheetId: string, ranges: string[]): Promise<unknown[][][]> {
  const params = new URLSearchParams();
  for (const range of ranges) params.append("ranges", range);
  params.set("valueRenderOption", "UNFORMATTED_VALUE");

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet?${params.toString()}`;
  const res = await auth.request<{ valueRanges: Array<{ values?: unknown[][] }> }>({ url });
  return res.data.valueRanges.map((valueRange) => valueRange.values ?? []);
}

/** Sheets serial dates count days from 1899-12-30. Returns null for blank/among-trailing rows. */
const SHEETS_EPOCH_UTC = Date.UTC(1899, 11, 30);

function toIsoDate(raw: unknown): string | null {
  if (typeof raw === "number" && Number.isFinite(raw)) {
    // floor, not round: a datetime cell carries a fractional day we want to discard.
    const date = new Date(SHEETS_EPOCH_UTC + Math.floor(raw) * 86_400_000);
    return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
  }
  // A text-formatted date cell still comes back as a string. Accept it only if it is
  // already ISO — anything else would sort wrongly and is better dropped loudly.
  if (typeof raw === "string" && /^\d{4}-\d{2}-\d{2}$/.test(raw.trim())) return raw.trim();
  return null;
}

function parseNumber(raw: unknown): number {
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : 0;
  if (typeof raw !== "string") return 0;
  const cleaned = raw.replace(/,/g, "").trim();
  if (!cleaned) return 0;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Locates each expected column by its header text in row 2 instead of trusting a
 * hardcoded position, and throws if one is missing. Inserting or reordering a column
 * in the sheet would otherwise silently pair one competition's spend with another's
 * revenue — a wrong number is worse than a visible error on a finance dashboard.
 */
function resolveColumns(rows: unknown[][], columns: SubCategoryColumn[], blockName: string): ResolvedColumn[] {
  const headerRow = rows[0] ?? [];
  const normalized = headerRow.map((cell) => String(cell ?? "").trim().toLowerCase());

  return columns.map(({ label, header }) => {
    const index = normalized.indexOf(header.trim().toLowerCase());
    if (index === -1) {
      const found = headerRow.map((cell) => String(cell ?? "").trim()).filter(Boolean).join(" | ");
      throw new Error(
        `${blockName}: expected a column headed "${header}" in row 2, but that row reads: ${found || "(empty)"}. ` +
          `The sheet layout changed — update the column map in netlify/functions/dashboard-data.ts.`,
      );
    }
    return { index, label };
  });
}

/** Maps each dated row to { label: value } using the resolved column positions. */
function rowsToDateMap(rows: unknown[][], columns: ResolvedColumn[]): Map<string, Record<string, number>> {
  const map = new Map<string, Record<string, number>>();
  for (const row of rows) {
    const date = toIsoDate(row[0]);
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
  spendRows: unknown[][],
  spendColumns: SubCategoryColumn[],
  revenueRows: unknown[][],
  revenueColumns: SubCategoryColumn[],
): DailyMetric[] {
  const resolvedSpend = resolveColumns(spendRows, spendColumns, `${category} ad spend block`);
  const resolvedRevenue = resolveColumns(revenueRows, revenueColumns, `${category} revenue block`);

  // Row 1 of each range is the header row resolved above; the rest is data.
  const spendByDate = rowsToDateMap(spendRows.slice(1), resolvedSpend);
  const revenueByDate = rowsToDateMap(revenueRows.slice(1), resolvedRevenue);

  const labels = [...new Set([...resolvedSpend.map((c) => c.label), ...resolvedRevenue.map((c) => c.label)])];
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
      ...buildCategoryMetrics(
        "Showcases",
        showcasesSpendRows,
        SHOWCASES_SPEND_COLUMNS,
        showcasesRevenueRows,
        SHOWCASES_REVENUE_COLUMNS,
      ),
      ...buildCategoryMetrics(
        "Website Sales",
        websiteSalesSpendRows,
        WEBSITE_SALES_SPEND_COLUMNS,
        websiteSalesRevenueRows,
        WEBSITE_SALES_REVENUE_COLUMNS,
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
