// TODO(M3): replace mockDashboardData with fetch("/.netlify/functions/dashboard-data")
import { mockDashboardData } from "@/mock/dashboardData";
import { RoasTrendChart } from "@/components/RoasTrendChart";
import { CategorySpendTable } from "@/components/CategorySpendTable";

export function DashboardPage() {
  const { metrics, subCategories, dateRange } = mockDashboardData;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8">
      <header>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">WKC Ad Spend &amp; ROAS</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {dateRange.start} &ndash; {dateRange.end}
        </p>
      </header>

      <RoasTrendChart metrics={metrics} subCategories={subCategories} />
      <CategorySpendTable metrics={metrics} />
    </div>
  );
}
