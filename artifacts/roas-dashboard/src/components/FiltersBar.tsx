import type { Category } from "@/types";
import { Select } from "@/components/ui/Select";

export const ALL = "All";

interface FiltersBarProps {
  categories: Category[];
  subCategories: string[];
  category: string;
  subCategory: string;
  onCategoryChange: (value: string) => void;
  onSubCategoryChange: (value: string) => void;
}

export function FiltersBar({
  categories,
  subCategories,
  category,
  subCategory,
  onCategoryChange,
  onSubCategoryChange,
}: FiltersBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
        Category
        <Select value={category} onChange={(e) => onCategoryChange(e.target.value)} aria-label="Filter by category">
          <option value={ALL}>All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </label>
      <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
        Sub-category
        <Select value={subCategory} onChange={(e) => onSubCategoryChange(e.target.value)} aria-label="Filter by sub-category">
          <option value={ALL}>All sub-categories</option>
          {subCategories.map((sub) => (
            <option key={sub} value={sub}>
              {sub}
            </option>
          ))}
        </Select>
      </label>
    </div>
  );
}
