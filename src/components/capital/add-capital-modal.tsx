import { FormEvent, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTransactionStore } from "@/store/transaction-store";

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

export function AddCapitalModal() {
  const { isCapitalModalOpen, closeCapitalModal, addCapitalEvent, isSaving, error } = useTransactionStore();
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(todayInputValue);

  const canSubmit = useMemo(() => Number(amount) > 0 && source.trim().length > 0 && date.trim().length > 0 && !isSaving, [amount, source, date, isSaving]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    await addCapitalEvent({
      amount: Number(amount),
      source,
      note,
      date,
    });

    setAmount("");
    setSource("");
    setNote("");
    setDate(todayInputValue());
  }

  return (
    <AnimatePresence>
      {isCapitalModalOpen && (
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
                <h2 className="text-2xl font-semibold tracking-normal">Add Capital</h2>
                <p className="mt-1 text-sm text-muted-foreground">Creates a balance snapshot and activity event.</p>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={closeCapitalModal} aria-label="Close capital modal">
                <X size={18} />
              </Button>
            </div>

            <div className="space-y-5">
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
                <span className="mb-2 block text-sm font-medium text-muted-foreground">Source</span>
                <input
                  value={source}
                  onChange={(event) => setSource(event.target.value)}
                  placeholder="Salary, savings, transfer"
                  className="h-12 w-full rounded-2xl border border-border bg-muted/45 px-4 outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                />
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

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-muted-foreground">Date</span>
                <input
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  type="date"
                  className="h-12 w-full rounded-2xl border border-border bg-muted/45 px-4 outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                />
              </label>

              {error && <p className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
            </div>

            <div className="mt-7 flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={closeCapitalModal}>
                Cancel
              </Button>
              <Button type="submit" disabled={!canSubmit}>
                {isSaving ? "Saving..." : "Add Capital"}
              </Button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
