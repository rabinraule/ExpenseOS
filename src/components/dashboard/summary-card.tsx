import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import type { SummaryMetric } from "@/types/finance";
import { formatCurrency } from "@/utils/currency";
import { cn } from "@/utils/cn";

export function SummaryCard({ metric }: { metric: SummaryMetric }) {
  const TrendIcon = metric.trend === "up" ? ArrowUpRight : metric.trend === "down" ? ArrowDownRight : Minus;

  return (
    <motion.div whileHover={{ y: -3 }} transition={{ type: "spring", stiffness: 280, damping: 24 }} className={cn(metric.featured && "lg:col-span-2")}>
      <Card className={cn("relative h-full overflow-hidden", metric.featured && "border-primary/35 p-6 shadow-glow")}>
        {metric.featured && <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">{metric.label}</p>
            <p className={cn("mt-3 font-semibold tracking-normal", metric.featured ? "text-4xl" : "text-2xl")}>
              {formatCurrency(metric.value, metric.value >= 900000)}
            </p>
          </div>
          <div className={cn("rounded-2xl p-2.5", metric.trend === "up" && "bg-success/12 text-success", metric.trend === "down" && "bg-danger/12 text-danger", metric.trend === "flat" && "bg-muted text-muted-foreground")}>
            <TrendIcon size={18} />
          </div>
        </div>
        <p className="mt-5 text-sm text-muted-foreground">{metric.delta}</p>
      </Card>
    </motion.div>
  );
}
