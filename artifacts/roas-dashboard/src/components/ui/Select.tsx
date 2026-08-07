import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 shadow-sm",
        "focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400",
        "dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100",
        className,
      )}
      {...props}
    />
  );
}
