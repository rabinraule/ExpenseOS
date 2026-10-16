import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card } from "@/components/ui/card";
import type { CategorySlice } from "@/types/finance";
import { formatCurrency } from "@/utils/currency";

export function CategoryDonut({ data, isEmpty, isLoading }: { data: CategorySlice[]; isEmpty?: boolean; isLoading?: boolean }) {
  return (
    <Card className="h-80">
      <h3 className="text-lg font-semibold">Category Distribution</h3>
      <p className="mb-4 text-sm text-muted-foreground">Where money moved this month</p>
      <div className="relative grid h-56 grid-cols-[1fr_140px] items-center gap-2">
        {(isEmpty || isLoading || data.length === 0) && (
          <div className="absolute inset-0 z-10 grid place-items-center rounded-2xl border border-dashed border-border bg-card/60 text-center backdrop-blur-sm">
            <div>
              <p className="font-medium">{isLoading ? "Loading categories" : "No categories yet"}</p>
              <p className="mt-1 text-sm text-muted-foreground">Expense categories populate from saved transactions.</p>
            </div>
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={56} outerRadius={86} paddingAngle={4}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 14 }} formatter={(value) => formatCurrency(Number(value))} />
          </PieChart>
        </ResponsiveContainer>
        <div className="space-y-3">
          {data.map((item) => (
            <div key={item.name} className="flex items-center gap-2 text-sm">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="min-w-0 flex-1 truncate text-muted-foreground">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
