import { LucideIcon, TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  delta,
  icon: Icon,
  trend = "up",
}: {
  label: string;
  value: string;
  delta?: string;
  icon?: LucideIcon;
  trend?: "up" | "down";
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm font-medium text-muted-foreground">{label}</div>
            <div className="mt-1 text-2xl font-semibold tracking-tight">{value}</div>
          </div>
          {Icon && (
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <Icon className="size-4" />
            </div>
          )}
        </div>
        {delta && (
          <div
            className={cn(
              "mt-3 flex items-center gap-1 text-xs font-medium",
              trend === "up" ? "text-success" : "text-destructive"
            )}
          >
            {trend === "up" ? (
              <TrendingUp className="size-3.5" />
            ) : (
              <TrendingDown className="size-3.5" />
            )}
            <span>{delta}</span>
            <span className="text-muted-foreground font-normal">vs last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
