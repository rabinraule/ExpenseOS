import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useTransactionStore } from "@/store/transaction-store";

export function FloatingAction() {
  const openModal = useTransactionStore((state) => state.openModal);

  return (
    <motion.button
      onClick={openModal}
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.97 }}
      className="fixed bottom-8 right-8 z-20 inline-flex h-14 items-center gap-3 rounded-2xl border border-primary/40 bg-primary px-5 font-semibold text-primary-foreground shadow-glow"
    >
      <Plus size={20} />
      New Transaction
    </motion.button>
  );
}
