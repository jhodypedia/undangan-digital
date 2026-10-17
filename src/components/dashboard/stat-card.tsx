import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function Sparkline({ data, className }: { data: number[]; className?: string }) {
  if (data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const span = max - min || 1;
  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 30 - ((value - min) / span) * 26 - 2;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      viewBox="0 0 100 30"
      preserveAspectRatio="none"
      className={cn("h-8 w-full", className)}
    >
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent,
  index = 0,
  delta,
  spark,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: React.ComponentType<{ className?: string }>;
  accent?: boolean;
  index?: number;
  delta?: number;
  spark?: number[];
}) {
  const positive = (delta ?? 0) >= 0;

  return (
    <Card
      style={{ animationDelay: `${index * 70}ms` }}
      className={cn(
        "group anim-rise card-lift gap-0 border shadow-none",
        accent && "bg-primary text-primary-foreground",
      )}
    >
      <CardContent className="py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p
              className={cn(
                "text-xs font-medium tracking-wide uppercase",
                accent ? "text-primary-foreground/70" : "text-muted-foreground",
              )}
            >
              {label}
            </p>
            <p className="font-display text-3xl leading-none tracking-tight">
              {value}
            </p>
          </div>
          {Icon ? (
            <span
              className={cn(
                "grid size-10 place-items-center rounded-xl transition-transform duration-300 group-hover:scale-110",
                accent
                  ? "bg-primary-foreground/15 text-accent"
                  : "bg-primary/8 text-primary",
              )}
            >
              <Icon className="size-5" />
            </span>
          ) : null}
        </div>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div className="space-y-1">
            {typeof delta === "number" ? (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-medium",
                  accent
                    ? "bg-primary-foreground/15 text-primary-foreground"
                    : positive
                      ? "bg-emerald-500/12 text-emerald-700"
                      : "bg-destructive/10 text-destructive",
                )}
              >
                {positive ? (
                  <ArrowUpRight className="size-3" />
                ) : (
                  <ArrowDownRight className="size-3" />
                )}
                {Math.abs(delta)}%
              </span>
            ) : null}
            {hint ? (
              <p
                className={cn(
                  "text-xs",
                  accent ? "text-primary-foreground/70" : "text-muted-foreground",
                )}
              >
                {hint}
              </p>
            ) : null}
          </div>
          {spark && spark.length > 1 ? (
            <span
              className={cn(
                "w-20 shrink-0",
                accent ? "text-accent" : "text-primary/60",
              )}
            >
              <Sparkline data={spark} />
            </span>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
