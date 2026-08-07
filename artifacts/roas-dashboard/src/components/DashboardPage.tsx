// TODO(M3): replace mockDashboardData with fetch("/.netlify/functions/dashboard-data")
import { useMemo, useState } from "react";
import { mockDashboardData } from "@/mock/dashboardData";
import { buildRoasTrend, buildSpendTrend, buildRevenueTrend } from "@/lib/trend";
import { formatInr, formatRoas } from "@/lib/utils";
import { FiltersBar, ALL } from "@/components/FiltersBar";
import { Tabs } from "@/components/ui/Tabs";
import { MetricSection } from "@/components/MetricSection";
import { CategorySpendTable } from "@/components/CategorySpendTable";

type MetricTab = "roas" | "spend" | "revenue";

const TABS: Array<{ value: MetricTab; label: string }> = [
  { value: "roas", label: "ROAS" },
  { value: "spend", label: "Ad Spend" },
  { value: "revenue", label: "Revenue" },
];

export function DashboardPage() {
  const { metrics, categories, subCategories, dateRange } = mockDashboardData;
  const [category, setCategory] = useState<string>(ALL);
  const [subCategory, setSubCategory] = useState<string>(ALL);
  const [activeTab, setActiveTab] = useState<MetricTab>("roas");

  const filteredMetrics = useMemo(
    () =>
      metrics.filter(
        (m) => (category === ALL || m.category === category) && (subCategory === ALL || m.subCategory === subCategory),
      ),
    [metrics, category, subCategory],
  );

  const roasSeries = useMemo(() => buildRoasTrend(filteredMetrics), [filteredMetrics]);
  const spendSeries = useMemo(() => buildSpendTrend(filteredMetrics), [filteredMetrics]);
  const revenueSeries = useMemo(() => buildRevenueTrend(filteredMetrics), [filteredMetrics]);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8">
      <header>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">WKC Ad Spend &amp; ROAS</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {dateRange.start} &ndash; {dateRange.end}
        </p>
      </header>

      <FiltersBar
        categories={categories}
        subCategories={subCategories}
        category={category}
        subCategory={subCategory}
        onCategoryChange={setCategory}
        onSubCategoryChange={setSubCategory}
      />

      <Tabs value={activeTab} onChange={(tab) => setActiveTab(tab)} tabs={TABS} />

      {activeTab === "roas" && (
        <MetricSection metricLabel="ROAS" series={roasSeries} formatValue={formatRoas} color="#4f46e5" />
      )}
      {activeTab === "spend" && (
        <MetricSection metricLabel="Ad Spend" series={spendSeries} formatValue={formatInr} color="#dc2626" />
      )}
      {activeTab === "revenue" && (
        <MetricSection metricLabel="Revenue" series={revenueSeries} formatValue={formatInr} color="#059669" />
      )}

      <CategorySpendTable metrics={filteredMetrics} />
    </div>
  );
}
