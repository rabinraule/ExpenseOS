import { useMemo } from "react";
import { motion } from "framer-motion";
import { Plus, WalletCards } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { fadeUp } from "@/animations/transitions";
import { selectCurrentBalance, selectTotalCapitalAdded, selectTotalExpenses } from "@/store/finance-selectors";
import { useTransactionStore } from "@/store/transaction-store";
import type { SummaryMetric } from "@/types/finance";
import { formatCurrency } from "@/utils/currency";

function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(timestamp));
}

export function CapitalLedgerPage() {
  const { transactions, capitalEvents, isLoading, openCapitalModal } = useTransactionStore();

  const summary = useMemo<SummaryMetric[]>(() => {
    const currentBalance = selectCurrentBalance(transactions, capitalEvents);
    const totalCapital = selectTotalCapitalAdded(capitalEvents);
    const totalExpenses = selectTotalExpenses(transactions);

    return [
      { id: "balance", label: "Current Balance", value: currentBalance, delta: "capital minus expenses", trend: currentBalance > 0 ? "up" : currentBalance < 0 ? "down" : "flat", featured: true },
      { id: "capital", label: "Total Capital Added", value: totalCapital, delta: totalCapital > 0 ? "tracked in ledger" : "no capital yet", trend: totalCapital > 0 ? "up" : "flat" },
      { id: "expenses", label: "Total Expenses", value: totalExpenses, delta: totalExpenses > 0 ? "from transactions" : "no expenses yet", trend: totalExpenses > 0 ? "up" : "flat" },
      { id: "remaining", label: "Remaining Balance", value: currentBalance, delta: "available locally", trend: currentBalance > 0 ? "up" : currentBalance < 0 ? "down" : "flat" },
    ];
  }, [transactions, capitalEvents]);

  return (
    <motion.div {...fadeUp} className="pb-20">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-primary">Capital event ledger</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-normal">Capital Ledger</h2>
        </div>
        <Button onClick={openCapitalModal}>
          <Plus size={18} />
          Add Capital
        </Button>
      </div>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summary.map((metric) => (
          <SummaryCard key={metric.id} metric={metric} />
        ))}
      </section>

      <Card className="mt-5 overflow-hidden p-0">
        <div className="grid grid-cols-[0.8fr_1fr_0.8fr_0.9fr_0.9fr_1.1fr] border-b border-border bg-muted/35 px-5 py-4 text-sm font-medium text-muted-foreground">
          <span>Date</span>
          <span>Source</span>
          <span className="text-right">Amount</span>
          <span className="text-right">Balance Before</span>
          <span className="text-right">Balance After</span>
          <span>Note</span>
        </div>

        {isLoading && <div className="p-6 text-sm text-muted-foreground">Loading capital ledger...</div>}

        {!isLoading && capitalEvents.length === 0 && (
          <div className="grid min-h-80 place-items-center p-8 text-center">
            <div>
              <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-primary/12 text-primary">
                <WalletCards size={26} />
              </div>
              <h3 className="text-xl font-semibold">No capital added yet</h3>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">Add the first capital event to establish your local balance history.</p>
              <Button className="mt-5" onClick={openCapitalModal}>
                <Plus size={18} />
                Add Capital
              </Button>
            </div>
          </div>
        )}

        {!isLoading &&
          capitalEvents.map((event) => (
            <div
              key={event.id}
              className="grid grid-cols-[0.8fr_1fr_0.8fr_0.9fr_0.9fr_1.1fr] items-center border-b border-border/70 px-5 py-4 text-sm last:border-0 hover:bg-muted/25"
            >
              <span className="text-muted-foreground">{formatDate(event.createdAt)}</span>
              <span className="min-w-0 truncate font-medium">{event.source}</span>
              <span className="text-right font-semibold text-success">+{formatCurrency(event.amount)}</span>
              <span className="text-right text-muted-foreground">{formatCurrency(event.balanceBefore)}</span>
              <span className="text-right text-foreground">{formatCurrency(event.balanceAfter)}</span>
              <span className="min-w-0 truncate text-muted-foreground">{event.note || "-"}</span>
            </div>
          ))}
      </Card>
    </motion.div>
  );
}
