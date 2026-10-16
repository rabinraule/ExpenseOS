import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/card";
import type { TrendPoint } from "@/types/finance";
import { formatCurrency } from "@/utils/currency";

export function IncomeExpenseChart({ data, isEmpty, isLoading }: { data: TrendPoint[]; isEmpty?: boolean; isLoading?: boolean }) {
  return (
    <Card className="h-80">
      <h3 className="text-lg font-semibold">Income vs Expense</h3>
      <p className="mb-5 text-sm text-muted-foreground">Cashflow comparison</p>
      <div className="relative h-56">
        {(isEmpty || isLoading) && (
          <div className="absolute inset-0 z-10 grid place-items-center rounded-2xl border border-dashed border-border bg-card/60 text-center backdrop-blur-sm">
            <div>
              <p className="font-medium">{isLoading ? "Loading cashflow" : "No cashflow yet"}</p>
              <p className="mt-1 text-sm text-muted-foreground">Income and expenses appear here automatically.</p>
            </div>
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} tickFormatter={(value) => formatCurrency(Number(value), true)} />
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 14 }} formatter={(value) => formatCurrency(Number(value))} />
            <Bar dataKey="income" fill="#2dd4bf" radius={[8, 8, 0, 0]} />
            <Bar dataKey="expense" fill="#f59e0b" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
