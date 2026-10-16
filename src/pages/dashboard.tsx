import { useMemo } from "react";
import { motion } from "framer-motion";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { CategoryDonut } from "@/components/dashboard/category-donut";
import { ExpenseTrendChart } from "@/components/dashboard/expense-trend-chart";
import { FloatingAction } from "@/components/dashboard/floating-action";
import { IncomeExpenseChart } from "@/components/dashboard/income-expense-chart";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { fadeUp } from "@/animations/transitions";
import { selectActivityItemsFromLogs, selectActivities, selectCategoryDistribution, selectSummaryMetrics, selectTrendPoints } from "@/store/finance-selectors";
import { useDashboardStore } from "@/store/dashboard-store";
import { useTransactionStore } from "@/store/transaction-store";
import type { Timeframe } from "@/types/finance";

const timeframeOptions: { label: string; value: Timeframe }[] = [
  { label: "Day", value: "day" },
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
  { label: "Year", value: "year" },
];

export function DashboardPage() {
  const { timeframe, setTimeframe } = useDashboardStore();
  const { transactions, capitalEvents, activityLogs, isLoading, hasLoaded } = useTransactionStore();
  const summary = useMemo(() => selectSummaryMetrics(transactions, capitalEvents), [transactions, capitalEvents]);
  const trend = useMemo(() => selectTrendPoints(transactions, capitalEvents, timeframe), [transactions, capitalEvents, timeframe]);
  const categories = useMemo(() => selectCategoryDistribution(transactions), [transactions]);
  const activities = useMemo(
    () => (activityLogs.length > 0 ? selectActivityItemsFromLogs(activityLogs) : selectActivities(transactions, capitalEvents)),
    [activityLogs, transactions, capitalEvents],
  );
  const isEmpty = hasLoaded && transactions.length === 0 && capitalEvents.length === 0;

  return (
    <motion.div {...fadeUp} className="pb-24">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-primary">Financial command center</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-normal">Money movement, at a glance</h2>
        </div>
        <SegmentedControl value={timeframe} options={timeframeOptions} onChange={setTimeframe} />
      </div>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summary.map((metric) => (
          <SummaryCard key={metric.id} metric={metric} />
        ))}
      </section>

      <section className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1.25fr_0.95fr]">
        <ExpenseTrendChart data={trend} isEmpty={isEmpty} isLoading={isLoading && !hasLoaded} />
        <IncomeExpenseChart data={trend} isEmpty={isEmpty} isLoading={isLoading && !hasLoaded} />
      </section>

      <section className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <CategoryDonut data={categories} isEmpty={isEmpty} isLoading={isLoading && !hasLoaded} />
        <ActivityFeed activities={activities} isEmpty={isEmpty} isLoading={isLoading && !hasLoaded} />
      </section>

      <FloatingAction />
    </motion.div>
  );
}
