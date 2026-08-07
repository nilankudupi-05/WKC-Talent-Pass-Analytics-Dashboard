import { useMemo } from "react";
import type { Category, DailyMetric } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Table, Tbody, Td, Th, Thead, Tr } from "@/components/ui/Table";
import { formatInr, formatRoas } from "@/lib/utils";

interface CategorySpendTableProps {
  metrics: DailyMetric[];
}

interface CategoryRow {
  category: Category;
  subCategory: string;
  spend: number;
  revenue: number;
  roas: number | null;
}

export function CategorySpendTable({ metrics }: CategorySpendTableProps) {
  const rows = useMemo<CategoryRow[]>(() => {
    const byKey = new Map<string, CategoryRow>();

    for (const metric of metrics) {
      const key = `${metric.category}::${metric.subCategory}`;
      const row = byKey.get(key) ?? {
        category: metric.category,
        subCategory: metric.subCategory,
        spend: 0,
        revenue: 0,
        roas: null,
      };
      row.spend += metric.spend;
      row.revenue += metric.revenue;
      byKey.set(key, row);
    }

    return Array.from(byKey.values())
      .map((row) => ({ ...row, roas: row.spend > 0 ? Math.round((row.revenue / row.spend) * 100) / 100 : null }))
      .sort((a, b) => a.category.localeCompare(b.category) || a.subCategory.localeCompare(b.subCategory));
  }, [metrics]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spend vs. revenue by category</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <Thead>
            <Tr>
              <Th>Category</Th>
              <Th>Sub-category</Th>
              <Th className="text-right">Spend</Th>
              <Th className="text-right">Revenue</Th>
              <Th className="text-right">ROAS</Th>
            </Tr>
          </Thead>
          <Tbody>
            {rows.map((row) => (
              <Tr key={`${row.category}-${row.subCategory}`}>
                <Td>{row.category}</Td>
                <Td>{row.subCategory}</Td>
                <Td className="text-right">{formatInr(row.spend)}</Td>
                <Td className="text-right">{formatInr(row.revenue)}</Td>
                <Td className="text-right">{formatRoas(row.roas)}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </CardContent>
    </Card>
  );
}
