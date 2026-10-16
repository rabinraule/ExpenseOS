import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/card";
import type { TrendPoint } from "@/types/finance";
import { formatCurrency } from "@/utils/currency";

export function ExpenseTrendChart({ data, isEmpty, isLoading }: { data: TrendPoint[]; isEmpty?: boolean; isLoading?: boolean }) {
  return (
    <Card className="h-80">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Expense Trend</h3>
          <p className="text-sm text-muted-foreground">Spending velocity and balance movement</p>
        </div>
      </div>
      <div className="relative h-56">
        {(isEmpty || isLoading) && (
          <div className="absolute inset-0 z-10 grid place-items-center rounded-2xl border border-dashed border-border bg-card/60 text-center backdrop-blur-sm">
            <div>
              <p className="font-medium">{isLoading ? "Loading financial history" : "No expense trend yet"}</p>
              <p className="mt-1 text-sm text-muted-foreground">Add transactions to draw this chart.</p>
            </div>
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.42} />
                <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} tickFormatter={(value) => formatCurrency(Number(value), true)} />
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 14 }} formatter={(value) => formatCurrency(Number(value))} />
            <Area type="monotone" dataKey="expense" stroke="#a78bfa" strokeWidth={3} fill="url(#expenseGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
