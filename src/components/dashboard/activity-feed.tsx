import { ArrowDown, ArrowUp, CircleDollarSign } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { ActivityItem } from "@/types/finance";
import { formatCurrency, formatSignedCurrency } from "@/utils/currency";
import { cn } from "@/utils/cn";

export function ActivityFeed({ activities, isEmpty, isLoading }: { activities: ActivityItem[]; isEmpty?: boolean; isLoading?: boolean }) {
  return (
    <Card className="h-full">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Recent Activity</h3>
          <p className="text-sm text-muted-foreground">Immutable financial event stream</p>
        </div>
        <CircleDollarSign className="text-primary" size={22} />
      </div>
      <div className="space-y-3">
        {(isEmpty || isLoading || activities.length === 0) && (
          <div className="grid min-h-52 place-items-center rounded-2xl border border-dashed border-border bg-muted/25 p-6 text-center">
            <div>
              <p className="font-medium">{isLoading ? "Loading activity" : "No activity yet"}</p>
              <p className="mt-1 text-sm text-muted-foreground">Every saved financial change will appear here.</p>
            </div>
          </div>
        )}
        {activities.map((activity) => {
          const isIncome = activity.type === "income";
          const Icon = isIncome ? ArrowUp : ArrowDown;

          return (
            <div key={activity.id} className="rounded-2xl border border-border/70 bg-muted/32 p-4 transition hover:bg-muted/55">
              <div className="flex items-start gap-3">
                <div className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", isIncome ? "bg-success/12 text-success" : "bg-warning/12 text-warning")}>
                  <Icon size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">{activity.subtitle}</p>
                    </div>
                    <p className={cn("shrink-0 font-semibold", isIncome ? "text-success" : "text-warning")}>{formatSignedCurrency(activity.amount)}</p>
                  </div>
                  {activity.balanceBefore !== undefined && activity.balanceAfter !== undefined && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Balance: {formatCurrency(activity.balanceBefore)} &rarr; {formatCurrency(activity.balanceAfter)}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-muted-foreground">{activity.timestamp}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
