export type Category = "Website Sales" | "Showcases" | "Uncategorized";

export interface DailyMetric {
  /** ISO date, yyyy-mm-dd */
  date: string;
  category: Category;
  /** Free text from the Category Mapping sheet; "Uncategorized" when no mapping match */
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
  subCategories: string[];
}
