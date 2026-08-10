export type Category = "Website Sales" | "Showcases";

export interface DailyMetric {
  /** ISO date, yyyy-mm-dd. Converted from the sheet's serial date in dashboard-data.ts. */
  date: string;
  category: Category;
  /**
   * Canonical sub-category name (e.g. "Pune", "LEGO"). Resolved from the sheet's row-2
   * column headers by the column maps in dashboard-data.ts, which reconcile the different
   * header text the ad-spend and revenue blocks use for the same sub-category.
   */
  subCategory: string;
  /** Meta ad spend, INR */
  spend: number;
  /** Razorpay revenue (Amount excl. GST), INR */
  revenue: number;
  /** revenue / spend; null when spend is 0 (rendered as "—") */
  roas: number | null;
}

export interface DashboardData {
  generatedAt: string;
  dateRange: { start: string; end: string };
  metrics: DailyMetric[];
  categories: Category[];
  subCategories: string[];
}
