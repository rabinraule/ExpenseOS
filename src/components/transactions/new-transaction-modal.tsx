import { FormEvent, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { useTransactionStore } from "@/store/transaction-store";
import type { TransactionType } from "@/types/finance";

const categories = ["Housing", "Food", "Travel", "Health", "Utilities", "Salary", "Investment", "Other"];

export function NewTransactionModal() {
  const { isModalOpen, closeModal, addTransaction, isSaving, error } = useTransactionStore();
  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [note, setNote] = useState("");

  const canSubmit = useMemo(() => Number(amount) > 0 && category.trim().length > 0 && !isSaving, [amount, category, isSaving]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    await addTransaction({
      type,
      amount: Number(amount),
      category,
      note,
    });

    setAmount("");
    setNote("");
    setCategory(type === "income" ? "Salary" : "Food");
  }

  return (
    <AnimatePresence>
      {isModalOpen && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center bg-background/72 p-6 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.form
            onSubmit={handleSubmit}
            className="glass-panel w-full max-w-lg rounded-[24px] p-6 shadow-glow"
            initial={{ opacity: 0, scale: 0.96, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 18 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold tracking-normal">New Transaction</h2>
                <p className="mt-1 text-sm text-muted-foreground">Saved locally with an activity event.</p>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={closeModal} aria-label="Close transaction modal">
                <X size={18} />
              </Button>
            </div>

            <div className="space-y-5">
              <SegmentedControl
                value={type}
                options={[
                  { label: "Expense", value: "expense" },
                  { label: "Income", value: "income" },
                ]}
                onChange={(nextType) => {
                  setType(nextType);
                  setCategory(nextType === "income" ? "Salary" : "Food");
                }}
              />

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-muted-foreground">Amount</span>
                <input
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  inputMode="decimal"
                  placeholder="0"
                  className="h-14 w-full rounded-2xl border border-border bg-muted/45 px-4 text-2xl font-semibold outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-muted-foreground">Category</span>
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="h-12 w-full rounded-2xl border border-border bg-muted/45 px-4 text-foreground outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                >
                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-muted-foreground">Note</span>
                <input
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Optional detail"
                  className="h-12 w-full rounded-2xl border border-border bg-muted/45 px-4 outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                />
              </label>

              {error && <p className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
            </div>

            <div className="mt-7 flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="submit" disabled={!canSubmit}>
                {isSaving ? "Saving..." : "Save Transaction"}
              </Button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
