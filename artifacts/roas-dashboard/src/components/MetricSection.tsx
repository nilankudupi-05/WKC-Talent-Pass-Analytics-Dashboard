import type { TrendSeries } from "@/lib/trend";
import { MiniTrendChart } from "@/components/MiniTrendChart";

interface MetricSectionProps {
  metricLabel: string;
  series: TrendSeries;
  formatValue: (value: number) => string;
  color: string;
}

export function MetricSection({ metricLabel, series, formatValue, color }: MetricSectionProps) {
  return (
    <div className="flex flex-col gap-4">
      <MiniTrendChart title={`Daily ${metricLabel}`} points={series.daily} formatValue={formatValue} color={color} wide />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <MiniTrendChart title={`${metricLabel} — 3-day average`} points={series.dma3} formatValue={formatValue} color={color} />
        <MiniTrendChart title={`${metricLabel} — 7-day average`} points={series.dma7} formatValue={formatValue} color={color} />
        <MiniTrendChart title={`${metricLabel} — 15-day average`} points={series.dma15} formatValue={formatValue} color={color} />
        <MiniTrendChart title={`${metricLabel} — 30-day average`} points={series.dma30} formatValue={formatValue} color={color} />
      </div>
    </div>
  );
}
