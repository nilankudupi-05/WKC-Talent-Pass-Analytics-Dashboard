import type { DailyMetric } from "@/types";

export interface TrendPoint {
  date: string;
  value: number | null;
}

export interface TrendSeries {
  daily: TrendPoint[];
  dma3: TrendPoint[];
  dma7: TrendPoint[];
  dma15: TrendPoint[];
  dma30: TrendPoint[];
}

interface DailyTotal {
  date: string;
  spend: number;
  revenue: number;
}

const DMA_WINDOWS = [3, 7, 15, 30] as const;

/** Sums spend/revenue per date and returns rows sorted oldest-first. */
export function dailyTotals(metrics: DailyMetric[]): DailyTotal[] {
  const byDate = new Map<string, DailyTotal>();

  for (const metric of metrics) {
    const row = byDate.get(metric.date) ?? { date: metric.date, spend: 0, revenue: 0 };
    row.spend += metric.spend;
    row.revenue += metric.revenue;
    byDate.set(metric.date, row);
  }

  return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Simple N-day moving average of `values`. A point is null until `window` days of
 * history exist (no partial-window averages), matching the standard DMA definition.
 */
function movingAverage(dates: string[], values: number[], window: number): TrendPoint[] {
  const points: TrendPoint[] = [];
  let windowSum = 0;

  for (let i = 0; i < values.length; i++) {
    windowSum += values[i];
    if (i >= window) {
      windowSum -= values[i - window];
    }
    const hasFullWindow = i >= window - 1;
    points.push({ date: dates[i], value: hasFullWindow ? windowSum / window : null });
  }

  return points;
}

/** Blended N-day ROAS: rolling sum(revenue) / rolling sum(spend), not an average of daily ratios. */
function movingRoas(dates: string[], spend: number[], revenue: number[], window: number): TrendPoint[] {
  const points: TrendPoint[] = [];
  let spendSum = 0;
  let revenueSum = 0;

  for (let i = 0; i < spend.length; i++) {
    spendSum += spend[i];
    revenueSum += revenue[i];
    if (i >= window) {
      spendSum -= spend[i - window];
      revenueSum -= revenue[i - window];
    }
    const hasFullWindow = i >= window - 1;
    points.push({ date: dates[i], value: hasFullWindow ? (spendSum > 0 ? revenueSum / spendSum : null) : null });
  }

  return points;
}

export function buildSpendTrend(metrics: DailyMetric[]): TrendSeries {
  const totals = dailyTotals(metrics);
  const dates = totals.map((t) => t.date);
  const spend = totals.map((t) => t.spend);

  return {
    daily: totals.map((t) => ({ date: t.date, value: t.spend })),
    dma3: movingAverage(dates, spend, 3),
    dma7: movingAverage(dates, spend, 7),
    dma15: movingAverage(dates, spend, 15),
    dma30: movingAverage(dates, spend, 30),
  };
}

export function buildRevenueTrend(metrics: DailyMetric[]): TrendSeries {
  const totals = dailyTotals(metrics);
  const dates = totals.map((t) => t.date);
  const revenue = totals.map((t) => t.revenue);

  return {
    daily: totals.map((t) => ({ date: t.date, value: t.revenue })),
    dma3: movingAverage(dates, revenue, 3),
    dma7: movingAverage(dates, revenue, 7),
    dma15: movingAverage(dates, revenue, 15),
    dma30: movingAverage(dates, revenue, 30),
  };
}

/** ROAS trend uses blended (rolling-sum) ratios, not an average of daily ROAS values. */
export function buildRoasTrend(metrics: DailyMetric[]): TrendSeries {
  const totals = dailyTotals(metrics);
  const dates = totals.map((t) => t.date);
  const spend = totals.map((t) => t.spend);
  const revenue = totals.map((t) => t.revenue);

  return {
    daily: totals.map((t) => ({ date: t.date, value: t.spend > 0 ? t.revenue / t.spend : null })),
    dma3: movingRoas(dates, spend, revenue, 3),
    dma7: movingRoas(dates, spend, revenue, 7),
    dma15: movingRoas(dates, spend, revenue, 15),
    dma30: movingRoas(dates, spend, revenue, 30),
  };
}

/** Mean of the non-null points actually plotted (ignores leading nulls before a DMA window fills). */
export function averageOf(points: TrendPoint[]): number | null {
  const values = points.map((p) => p.value).filter((v): v is number => v !== null);
  if (values.length === 0) return null;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export const DMA_WINDOW_LABELS: Record<(typeof DMA_WINDOWS)[number], string> = {
  3: "3-day moving average",
  7: "7-day moving average",
  15: "15-day moving average",
  30: "30-day moving average",
};
