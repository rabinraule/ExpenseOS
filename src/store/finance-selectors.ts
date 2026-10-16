import type { ActivityItem, ActivityLogRecord, CapitalEventRecord, CategorySlice, SummaryMetric, Timeframe, TransactionRecord, TrendPoint } from "@/types/finance";

const categoryColors = ["#2dd4bf", "#a78bfa", "#f59e0b", "#34d399", "#60a5fa", "#fb7185", "#f472b6", "#c084fc"];

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function startOfWeek(date: Date) {
  const day = date.getDay();
  const diff = day === 0 ? 6 : day - 1;
  return startOfDay(new Date(date.getFullYear(), date.getMonth(), date.getDate() - diff));
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1).getTime();
}

function startOfYear(date: Date) {
  return new Date(date.getFullYear(), 0, 1).getTime();
}

function formatDelta(value: number, label: string) {
  if (value === 0) return "no activity yet";
  return `${value > 0 ? "+" : "-"}${Math.abs(value).toLocaleString("en-IN")} ${label}`;
}

function transactionSignedAmount(transaction: TransactionRecord) {
  return transaction.type === "income" ? transaction.amount : -transaction.amount;
}

function capitalSignedAmount(event: CapitalEventRecord) {
  return event.amount;
}

export function selectTotalCapitalAdded(capitalEvents: CapitalEventRecord[]) {
  return capitalEvents.reduce((total, event) => total + event.amount, 0);
}

export function selectTotalExpenses(transactions: TransactionRecord[]) {
  return transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((total, transaction) => total + transaction.amount, 0);
}

export function selectCurrentBalance(transactions: TransactionRecord[], capitalEvents: CapitalEventRecord[]) {
  return selectTotalCapitalAdded(capitalEvents) - selectTotalExpenses(transactions);
}

export function selectSummaryMetrics(transactions: TransactionRecord[], capitalEvents: CapitalEventRecord[]): SummaryMetric[] {
  const now = new Date();
  const todayStart = startOfDay(now);
  const weekStart = startOfWeek(now);
  const monthStart = startOfMonth(now);

  const expenses = transactions.filter((transaction) => transaction.type === "expense");
  const income = transactions.filter((transaction) => transaction.type === "income");
  const sum = (items: TransactionRecord[]) => items.reduce((total, transaction) => total + transaction.amount, 0);

  const totalCapitalAdded = selectTotalCapitalAdded(capitalEvents);
  const totalExpenses = selectTotalExpenses(transactions);
  const currentBalance = totalCapitalAdded - totalExpenses;
  const todaySpending = sum(expenses.filter((transaction) => transaction.createdAt >= todayStart));
  const weeklySpending = sum(expenses.filter((transaction) => transaction.createdAt >= weekStart));
  const monthlySpending = sum(expenses.filter((transaction) => transaction.createdAt >= monthStart));
  const lifetimeIncome = sum(income) + totalCapitalAdded;
  const lifetimeExpenses = totalExpenses;

  return [
    { id: "balance", label: "Current Balance", value: currentBalance, delta: formatDelta(currentBalance, "net balance"), trend: currentBalance > 0 ? "up" : currentBalance < 0 ? "down" : "flat", featured: true },
    { id: "today", label: "Today's Spending", value: todaySpending, delta: formatDelta(todaySpending, "today"), trend: todaySpending > 0 ? "up" : "flat" },
    { id: "weekly", label: "Weekly Spending", value: weeklySpending, delta: formatDelta(weeklySpending, "this week"), trend: weeklySpending > 0 ? "up" : "flat" },
    { id: "monthly", label: "Monthly Spending", value: monthlySpending, delta: formatDelta(monthlySpending, "this month"), trend: monthlySpending > 0 ? "up" : "flat" },
    { id: "income", label: "Lifetime Income", value: lifetimeIncome, delta: formatDelta(lifetimeIncome, "recorded"), trend: lifetimeIncome > 0 ? "up" : "flat" },
    { id: "expenses", label: "Lifetime Expenses", value: lifetimeExpenses, delta: formatDelta(lifetimeExpenses, "recorded"), trend: lifetimeExpenses > 0 ? "up" : "flat" },
  ];
}

function bucketKey(timestamp: number, timeframe: Timeframe) {
  const date = new Date(timestamp);

  if (timeframe === "day") {
    return {
      key: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}`,
      label: new Intl.DateTimeFormat("en-IN", { hour: "2-digit" }).format(date),
      start: new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours()).getTime(),
    };
  }

  if (timeframe === "year") {
    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: new Intl.DateTimeFormat("en-IN", { month: "short" }).format(date),
      start: new Date(date.getFullYear(), date.getMonth(), 1).getTime(),
    };
  }

  return {
    key: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
    label: new Intl.DateTimeFormat("en-IN", { weekday: timeframe === "week" ? "short" : undefined, day: timeframe === "month" ? "2-digit" : undefined }).format(date),
    start: startOfDay(date),
  };
}

function timeframeStart(timeframe: Timeframe) {
  const now = new Date();
  if (timeframe === "day") return startOfDay(now);
  if (timeframe === "week") return startOfWeek(now);
  if (timeframe === "month") return startOfMonth(now);
  return startOfYear(now);
}

export function selectTrendPoints(transactions: TransactionRecord[], capitalEvents: CapitalEventRecord[], timeframe: Timeframe): TrendPoint[] {
  const start = timeframeStart(timeframe);
  const buckets = new Map<string, TrendPoint & { start: number }>();
  let runningBalance = 0;

  const events = [
    ...transactions.map((transaction) => ({
      timestamp: transaction.createdAt,
      income: transaction.type === "income" ? transaction.amount : 0,
      expense: transaction.type === "expense" ? transaction.amount : 0,
      balanceDelta: transaction.type === "expense" ? -transaction.amount : 0,
    })),
    ...capitalEvents.map((event) => {
      const amount = capitalSignedAmount(event);
      return {
        timestamp: event.createdAt,
        income: amount > 0 ? amount : 0,
        expense: 0,
        balanceDelta: amount,
      };
    }),
  ].sort((a, b) => a.timestamp - b.timestamp);

  for (const event of events) {
    runningBalance += event.balanceDelta;
    if (event.timestamp < start) continue;

    const bucket = bucketKey(event.timestamp, timeframe);
    const existing = buckets.get(bucket.key) ?? { label: bucket.label, income: 0, expense: 0, balance: runningBalance, start: bucket.start };
    existing.income += event.income;
    existing.expense += event.expense;
    existing.balance = runningBalance;
    buckets.set(bucket.key, existing);
  }

  return Array.from(buckets.values())
    .sort((a, b) => a.start - b.start)
    .map(({ start: _start, ...point }) => point);
}

export function selectCategoryDistribution(transactions: TransactionRecord[]): CategorySlice[] {
  const totals = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce<Map<string, number>>((map, transaction) => {
      map.set(transaction.category, (map.get(transaction.category) ?? 0) + transaction.amount);
      return map;
    }, new Map());

  return Array.from(totals.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name, value], index) => ({ name, value, color: categoryColors[index % categoryColors.length] }));
}

export function selectActivities(transactions: TransactionRecord[], capitalEvents: CapitalEventRecord[]): ActivityItem[] {
  const transactionItems: ActivityItem[] = transactions.map((transaction) => {
    const signedAmount = transactionSignedAmount(transaction);
    return {
      id: `transaction-${transaction.id}`,
      title: transaction.type === "income" ? "Income Added" : "Expense Logged",
      subtitle: transaction.note || transaction.category,
      amount: signedAmount,
      type: transaction.type,
      timestamp: new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(transaction.createdAt)),
    };
  });

  const capitalItems: ActivityItem[] = capitalEvents.map((event) => ({
    id: `capital-${event.id}`,
    title: "Capital Updated",
    subtitle: event.source,
    amount: capitalSignedAmount(event),
    type: capitalSignedAmount(event) >= 0 ? "income" : "expense",
    timestamp: new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(event.createdAt)),
    balanceBefore: event.balanceBefore,
    balanceAfter: event.balanceAfter,
  }));

  return [...transactionItems, ...capitalItems]
    .sort((a, b) => {
      const aSource = transactions.find((transaction) => `transaction-${transaction.id}` === a.id)?.createdAt ?? capitalEvents.find((event) => `capital-${event.id}` === a.id)?.createdAt ?? 0;
      const bSource = transactions.find((transaction) => `transaction-${transaction.id}` === b.id)?.createdAt ?? capitalEvents.find((event) => `capital-${event.id}` === b.id)?.createdAt ?? 0;
      return bSource - aSource;
    })
    .slice(0, 8);
}

function getAmountFromPayload(payload: unknown) {
  if (payload && typeof payload === "object" && "amount" in payload) {
    return Number((payload as { amount: unknown }).amount);
  }

  return 0;
}

function getTextFromPayload(payload: unknown, key: "note" | "category" | "source") {
  if (payload && typeof payload === "object" && key in payload) {
    const value = (payload as Record<string, unknown>)[key];
    return typeof value === "string" ? value : undefined;
  }

  return undefined;
}

function getBalanceFromPayload(payload: unknown, key: "balanceBefore" | "balanceAfter" | "balance") {
  if (payload && typeof payload === "object" && key in payload) {
    const value = (payload as Record<string, unknown>)[key];
    return typeof value === "number" ? value : undefined;
  }

  return undefined;
}

export function selectActivityItemsFromLogs(logs: ActivityLogRecord[]): ActivityItem[] {
  return logs
    .slice()
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 8)
    .map((log) => {
      const isCapital = log.entityType === "capital_event";
      const isIncome = log.actionType === "income_added" || log.actionType === "capital_added";
      const amount = getAmountFromPayload(log.newData) * (isIncome ? 1 : -1);
      const title =
        log.actionType === "capital_added"
          ? "Capital Added"
          : log.actionType === "income_added"
            ? "Income Added"
            : log.actionType === "expense_logged"
              ? "Expense Logged"
              : "System Activity";

      return {
        id: log.id,
        title,
        subtitle:
          getTextFromPayload(log.newData, "note") ??
          getTextFromPayload(log.newData, "source") ??
          getTextFromPayload(log.newData, "category") ??
          log.entityType,
        amount,
        type: isIncome ? "income" : "expense",
        timestamp: new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(log.timestamp)),
        balanceBefore: isCapital ? getBalanceFromPayload(log.newData, "balanceBefore") ?? getBalanceFromPayload(log.oldData, "balance") : undefined,
        balanceAfter: isCapital ? getBalanceFromPayload(log.newData, "balanceAfter") : undefined,
      };
    });
}
