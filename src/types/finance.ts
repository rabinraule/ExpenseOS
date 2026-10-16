export type TransactionType = "income" | "expense";
export type Timeframe = "day" | "week" | "month" | "year";

export interface SummaryMetric {
  id: string;
  label: string;
  value: number;
  delta: string;
  trend: "up" | "down" | "flat";
  featured?: boolean;
}

export interface TrendPoint {
  label: string;
  income: number;
  expense: number;
  balance: number;
}

export interface CategorySlice {
  name: string;
  value: number;
  color: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  type: TransactionType;
  timestamp: string;
  balanceBefore?: number;
  balanceAfter?: number;
}

export type ActivityFilter = "all" | "transactions" | "capital" | "system";

export interface ActivityLogRecord {
  id: string;
  actionType: string;
  entityType: string;
  entityId: string;
  oldData?: unknown;
  newData?: unknown;
  timestamp: number;
}

export interface TransactionDraft {
  type: TransactionType;
  amount: number;
  category: string;
  note?: string;
}

export interface TransactionRecord extends TransactionDraft {
  id: string;
  createdAt: number;
  updatedAt: number;
}

export interface CapitalEventRecord {
  id: string;
  amount: number;
  source: string;
  note?: string;
  balanceBefore: number;
  balanceAfter: number;
  createdAt: number;
}

export interface CapitalEventDraft {
  amount: number;
  source: string;
  note?: string;
  date: string;
}
