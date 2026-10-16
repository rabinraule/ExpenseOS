import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Activity, ArrowDown, ArrowUp, CircleDot } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { fadeUp } from "@/animations/transitions";
import { useTransactionStore } from "@/store/transaction-store";
import type { ActivityFilter, ActivityLogRecord } from "@/types/finance";
import { formatCurrency, formatSignedCurrency } from "@/utils/currency";
import { cn } from "@/utils/cn";

const filterOptions: { label: string; value: ActivityFilter }[] = [
  { label: "All", value: "all" },
  { label: "Transactions", value: "transactions" },
  { label: "Capital", value: "capital" },
  { label: "System", value: "system" },
];

function actionTitle(actionType: string) {
  if (actionType === "capital_added") return "Capital Added";
  if (actionType === "income_added") return "Income Added";
  if (actionType === "expense_logged") return "Expense Logged";
  return "System Activity";
}

function activityScope(log: ActivityLogRecord): ActivityFilter {
  if (log.entityType === "transaction") return "transactions";
  if (log.entityType === "capital_event") return "capital";
  return "system";
}

function payloadValue(payload: unknown, key: string) {
  if (payload && typeof payload === "object" && key in payload) {
    return (payload as Record<string, unknown>)[key];
  }

  return undefined;
}

function amountForLog(log: ActivityLogRecord) {
  const amount = Number(payloadValue(log.newData, "amount") ?? 0);
  return log.actionType === "expense_logged" ? -amount : amount;
}

function subtitleForLog(log: ActivityLogRecord) {
  return (
    payloadValue(log.newData, "note") ??
    payloadValue(log.newData, "source") ??
    payloadValue(log.newData, "category") ??
    log.entityType
  );
}

function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

function balanceSnapshot(log: ActivityLogRecord) {
  const before = payloadValue(log.newData, "balanceBefore") ?? payloadValue(log.oldData, "balance");
  const after = payloadValue(log.newData, "balanceAfter");

  if (typeof before !== "number" || typeof after !== "number") return null;

  return { before, after };
}

export function ActivityHistoryPage() {
  const { activityLogs, isLoading } = useTransactionStore();
  const [filter, setFilter] = useState<ActivityFilter>("all");

  const filteredLogs = useMemo(
    () =>
      activityLogs
        .filter((log) => filter === "all" || activityScope(log) === filter)
        .slice()
        .sort((a, b) => b.timestamp - a.timestamp),
    [activityLogs, filter],
  );

  return (
    <motion.div {...fadeUp} className="pb-20">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-primary">Immutable event stream</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-normal">Activity History</h2>
        </div>
        <SegmentedControl value={filter} options={filterOptions} onChange={setFilter} />
      </div>

      <Card className="overflow-hidden p-0">
        <div className="grid grid-cols-[1.1fr_0.8fr_0.8fr_1fr] border-b border-border bg-muted/35 px-5 py-4 text-sm font-medium text-muted-foreground">
          <span>Event</span>
          <span>Type</span>
          <span>Date</span>
          <span className="text-right">Amount / Snapshot</span>
        </div>

        {isLoading && <div className="p-6 text-sm text-muted-foreground">Loading activity history...</div>}

        {!isLoading && filteredLogs.length === 0 && (
          <div className="grid min-h-80 place-items-center p-8 text-center">
            <div>
              <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-primary/12 text-primary">
                <Activity size={26} />
              </div>
              <h3 className="text-xl font-semibold">No activity yet</h3>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">Transactions and capital events will create immutable history entries here.</p>
            </div>
          </div>
        )}

        {!isLoading &&
          filteredLogs.map((log) => {
            const amount = amountForLog(log);
            const isIncome = amount >= 0;
            const snapshot = balanceSnapshot(log);
            const Icon = snapshot ? CircleDot : isIncome ? ArrowUp : ArrowDown;

            return (
              <div
                key={log.id}
                className="grid grid-cols-[1.1fr_0.8fr_0.8fr_1fr] items-center border-b border-border/70 px-5 py-4 last:border-0 hover:bg-muted/25"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", isIncome ? "bg-success/12 text-success" : "bg-warning/12 text-warning")}>
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium">{actionTitle(log.actionType)}</p>
                    <p className="truncate text-sm text-muted-foreground">{String(subtitleForLog(log))}</p>
                  </div>
                </div>
                <span className="text-sm capitalize text-muted-foreground">{activityScope(log).replace("-", " ")}</span>
                <span className="text-sm text-muted-foreground">{formatDate(log.timestamp)}</span>
                <div className="text-right">
                  <p className={cn("font-semibold", isIncome ? "text-success" : "text-warning")}>{formatSignedCurrency(amount)}</p>
                  {snapshot && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatCurrency(snapshot.before)} &rarr; {formatCurrency(snapshot.after)}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
      </Card>
    </motion.div>
  );
}
