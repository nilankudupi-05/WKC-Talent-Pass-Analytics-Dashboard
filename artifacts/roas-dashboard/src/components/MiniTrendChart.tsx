import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { TrendPoint } from "@/lib/trend";
import { averageOf } from "@/lib/trend";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface MiniTrendChartProps {
  title: string;
  points: TrendPoint[];
  formatValue: (value: number) => string;
  color: string;
  wide?: boolean;
}

export function MiniTrendChart({ title, points, formatValue, color, wide = false }: MiniTrendChartProps) {
  const average = averageOf(points);

  return (
    <Card>
      <CardHeader className="flex flex-row items-baseline justify-between gap-3 py-3">
        <CardTitle>{title}</CardTitle>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          Avg: <span className="font-medium text-slate-900 dark:text-slate-100">{average === null ? "—" : formatValue(average)}</span>
        </span>
      </CardHeader>
      <CardContent>
        <div className={cn("w-full", wide ? "h-64" : "h-48")}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={points} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} minTickGap={24} />
              <YAxis tick={{ fontSize: 11 }} width={56} tickFormatter={(v: number) => formatValue(v)} />
              <Tooltip formatter={(value: number) => formatValue(value)} />
              <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} connectNulls={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
