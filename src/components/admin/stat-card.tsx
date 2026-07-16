import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  change,
  icon: Icon,
}: {
  label: string;
  value: string;
  change?: number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  const positive = (change ?? 0) >= 0;
  return (
    <div className="rounded-2xl border border-[hsl(var(--border))] p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-[hsl(var(--muted-foreground))]">{label}</span>
        <Icon className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight tabular-nums">
        {value}
      </p>
      {change !== undefined && (
        <p
          className={cn(
            "mt-2 inline-flex items-center gap-1 text-sm",
            positive ? "text-green-600 dark:text-green-500" : "text-red-500",
          )}
        >
          {positive ? (
            <ArrowUpRight className="h-4 w-4" />
          ) : (
            <ArrowDownRight className="h-4 w-4" />
          )}
          {Math.abs(change)}%
          <span className="text-[hsl(var(--muted-foreground))]">vs 30j</span>
        </p>
      )}
    </div>
  );
}
