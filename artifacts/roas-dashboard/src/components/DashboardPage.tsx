import { useEffect, useMemo, useState } from "react";
import type { DashboardData } from "@/types";
import { buildRoasTrend, buildSpendTrend, buildRevenueTrend } from "@/lib/trend";
import { formatInr, formatRoas } from "@/lib/utils";
import { FiltersBar, ALL } from "@/components/FiltersBar";
import { Tabs } from "@/components/ui/Tabs";
import { MetricSection } from "@/components/MetricSection";
import { CategorySpendTable } from "@/components/CategorySpendTable";
import { Card, CardContent } from "@/components/ui/Card";

type MetricTab = "roas" | "spend" | "revenue";

const TABS: Array<{ value: MetricTab; label: string }> = [
  { value: "roas", label: "ROAS" },
  { value: "spend", label: "Ad Spend" },
  { value: "revenue", label: "Revenue" },
];

function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch("/.netlify/functions/dashboard-data")
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error ?? `Request failed with status ${res.status}`);
        }
        return res.json() as Promise<DashboardData>;
      })
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load dashboard data");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { data, error };
}

export function DashboardPage() {
  const { data, error } = useDashboardData();
  const [category, setCategory] = useState<string>(ALL);
  const [subCategory, setSubCategory] = useState<string>(ALL);
  const [activeTab, setActiveTab] = useState<MetricTab>("roas");

  const metrics = data?.metrics ?? [];

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

  if (error) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <Card>
          <CardContent className="text-sm text-red-600 dark:text-red-400">Couldn&apos;t load dashboard data: {error}</CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <Card>
          <CardContent className="text-sm text-slate-500 dark:text-slate-400">Loading dashboard data&hellip;</CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8">
      <header>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">WKC Ad Spend &amp; ROAS</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {data.dateRange.start} &ndash; {data.dateRange.end}
        </p>
      </header>

      <FiltersBar
        categories={data.categories}
        subCategories={data.subCategories}
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
