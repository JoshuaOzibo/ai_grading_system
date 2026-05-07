import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  delta?: string;
  trend?: "up" | "down";
  icon: LucideIcon;
  accent?: "primary" | "blue" | "purple" | "green";
}

const accentMap = {
  primary: "from-primary/15 to-primary/5 text-primary",
  blue: "from-chart-2/20 to-chart-2/5 text-chart-2",
  purple: "from-chart-3/20 to-chart-3/5 text-chart-3",
  green: "from-success/20 to-success/5 text-success",
};

export function StatCard({ label, value, delta, trend = "up", icon: Icon, accent = "primary" }: StatCardProps) {
  return (
    <Card className="overflow-hidden border-border/60 shadow-card transition hover:shadow-soft hover:-translate-y-0.5">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {label}
            </p>
            <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
            {delta && (
              <div
                className={cn(
                  "mt-2 inline-flex items-center gap-1 text-xs font-medium",
                  trend === "up" ? "text-success" : "text-destructive",
                )}
              >
                {trend === "up" ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {delta}
              </div>
            )}
          </div>
          <div
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br",
              accentMap[accent],
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
