import type { Category, DailyMetric, DashboardData } from "@/types";

const SUB_CATEGORIES: Array<{ category: Category; subCategory: string }> = [
  { category: "Showcases", subCategory: "Pune" },
  { category: "Showcases", subCategory: "Mumbai" },
  { category: "Showcases", subCategory: "Bengaluru" },
  { category: "Website Sales", subCategory: "LEGO" },
  { category: "Website Sales", subCategory: "CW" },
  { category: "Website Sales", subCategory: "Handwriting" },
  { category: "Website Sales", subCategory: "All Competitions - Generic - Old Ad" },
  { category: "Uncategorized", subCategory: "Uncategorized" },
];

const DAYS = 30;

/** Small deterministic pseudo-random generator so the mock UI looks identical on every run. */
function lcg(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

function isoDate(daysAgo: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

function buildMockMetrics(): DailyMetric[] {
  const rand = lcg(42);
  const metrics: DailyMetric[] = [];

  for (let dayIndex = DAYS - 1; dayIndex >= 0; dayIndex--) {
    const date = isoDate(dayIndex);

    for (const { category, subCategory } of SUB_CATEGORIES) {
      // Exercise the divide-by-zero path: the first day has zero spend everywhere.
      const isZeroSpendDay = dayIndex === DAYS - 1;
      const baseSpend = category === "Uncategorized" ? 400 : 1200 + rand() * 3500;
      const spend = isZeroSpendDay ? 0 : Math.round(baseSpend);

      const revenueMultiplier = category === "Showcases" ? 1.8 : category === "Website Sales" ? 2.4 : 0.6;
      const revenue = Math.round(spend * revenueMultiplier * (0.6 + rand() * 0.8));

      metrics.push({
        date,
        category,
        subCategory,
        spend,
        revenue,
        roas: spend > 0 ? Math.round((revenue / spend) * 100) / 100 : null,
      });
    }
  }

  return metrics;
}

const metrics = buildMockMetrics();

export const mockDashboardData: DashboardData = {
  generatedAt: new Date().toISOString(),
  dateRange: { start: isoDate(DAYS - 1), end: isoDate(0) },
  metrics,
  subCategories: SUB_CATEGORIES.map((s) => s.subCategory),
};
