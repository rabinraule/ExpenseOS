import { useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, ReceiptText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { fadeUp } from "@/animations/transitions";
import { useTransactionStore } from "@/store/transaction-store";
import { formatCurrency } from "@/utils/currency";
import { cn } from "@/utils/cn";

function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

export function TransactionsPage() {
  const { transactions, isLoading, loadTransactions, openModal } = useTransactionStore();

  useEffect(() => {
    void loadTransactions();
  }, [loadTransactions]);

  return (
    <motion.div {...fadeUp} className="pb-20">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-primary">Local transaction ledger</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-normal">Transactions</h2>
        </div>
        <Button onClick={openModal}>
          <Plus size={18} />
          New Transaction
        </Button>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="grid grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr] border-b border-border bg-muted/35 px-5 py-4 text-sm font-medium text-muted-foreground">
          <span>Details</span>
          <span>Category</span>
          <span>Date</span>
          <span className="text-right">Amount</span>
        </div>

        {isLoading && <div className="p-6 text-sm text-muted-foreground">Loading local ledger...</div>}

        {!isLoading && transactions.length === 0 && (
          <div className="grid min-h-80 place-items-center p-8 text-center">
            <div>
              <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-primary/12 text-primary">
                <ReceiptText size={26} />
              </div>
              <h3 className="text-xl font-semibold">No transactions yet</h3>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">Add the first local event and ExpenseOS will keep the ledger and activity trail in sync.</p>
              <Button className="mt-5" onClick={openModal}>
                <Plus size={18} />
                New Transaction
              </Button>
            </div>
          </div>
        )}

        {!isLoading &&
          transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="grid grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr] items-center border-b border-border/70 px-5 py-4 last:border-0 hover:bg-muted/25"
            >
              <div className="min-w-0">
                <p className="font-medium">{transaction.note || (transaction.type === "income" ? "Income Added" : "Expense Logged")}</p>
                <p className="text-sm capitalize text-muted-foreground">{transaction.type}</p>
              </div>
              <span className="text-sm text-muted-foreground">{transaction.category}</span>
              <span className="text-sm text-muted-foreground">{formatDate(transaction.createdAt)}</span>
              <span className={cn("text-right font-semibold", transaction.type === "income" ? "text-success" : "text-warning")}>
                {transaction.type === "income" ? "+" : "-"}
                {formatCurrency(transaction.amount)}
              </span>
            </div>
          ))}
      </Card>
    </motion.div>
  );
}
