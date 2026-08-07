import { useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DailyMetric } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { formatRoas } from "@/lib/utils";

interface RoasTrendChartProps {
  metrics: DailyMetric[];
  subCategories: string[];
}

interface TrendPoint {
  date: string;
  spend: number;
  revenue: number;
  roas: number | null;
}

const ALL_SUB_CATEGORIES = "All";

export function RoasTrendChart({ metrics, subCategories }: RoasTrendChartProps) {
  const [selected, setSelected] = useState<string>(ALL_SUB_CATEGORIES);

  const trend = useMemo<TrendPoint[]>(() => {
    const filtered = selected === ALL_SUB_CATEGORIES ? metrics : metrics.filter((m) => m.subCategory === selected);

    const byDate = new Map<string, { spend: number; revenue: number }>();
    for (const metric of filtered) {
      const entry = byDate.get(metric.date) ?? { spend: 0, revenue: 0 };
      entry.spend += metric.spend;
      entry.revenue += metric.revenue;
      byDate.set(metric.date, entry);
    }

    return Array.from(byDate.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, { spend, revenue }]) => ({
        date,
        spend,
        revenue,
        roas: spend > 0 ? Math.round((revenue / spend) * 100) / 100 : null,
      }));
  }, [metrics, selected]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle>ROAS trend</CardTitle>
        <Select value={selected} onChange={(e) => setSelected(e.target.value)} aria-label="Filter by sub-category">
          <option value={ALL_SUB_CATEGORIES}>All sub-categories</option>
          {subCategories.map((sub) => (
            <option key={sub} value={sub}>
              {sub}
            </option>
          ))}
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} minTickGap={24} />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(value: number) => `${value}x`}
                width={48}
              />
              <Tooltip
                formatter={(value: number) => formatRoas(value)}
                labelFormatter={(label: string) => label}
              />
              <Line
                type="monotone"
                dataKey="roas"
                stroke="#4f46e5"
                strokeWidth={2}
                dot={false}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
