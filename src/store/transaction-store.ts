import { create } from "zustand";
import { listActivityLogs } from "@/services/activity-service";
import { createCapitalEvent, listCapitalEvents } from "@/services/capital-service";
import { createTransaction, listTransactions } from "@/services/transaction-service";
import type { ActivityLogRecord, CapitalEventDraft, CapitalEventRecord, TransactionDraft, TransactionRecord } from "@/types/finance";

interface TransactionState {
  transactions: TransactionRecord[];
  capitalEvents: CapitalEventRecord[];
  activityLogs: ActivityLogRecord[];
  hasLoaded: boolean;
  isLoading: boolean;
  isSaving: boolean;
  isModalOpen: boolean;
  isCapitalModalOpen: boolean;
  error: string | null;
  openModal: () => void;
  closeModal: () => void;
  openCapitalModal: () => void;
  closeCapitalModal: () => void;
  loadFinancialData: () => Promise<void>;
  loadTransactions: () => Promise<void>;
  addTransaction: (draft: TransactionDraft) => Promise<void>;
  addCapitalEvent: (draft: CapitalEventDraft) => Promise<void>;
}

export const useTransactionStore = create<TransactionState>((set) => ({
  transactions: [],
  capitalEvents: [],
  activityLogs: [],
  hasLoaded: false,
  isLoading: false,
  isSaving: false,
  isModalOpen: false,
  isCapitalModalOpen: false,
  error: null,
  openModal: () => set({ isModalOpen: true, error: null }),
  closeModal: () => set({ isModalOpen: false }),
  openCapitalModal: () => set({ isCapitalModalOpen: true, error: null }),
  closeCapitalModal: () => set({ isCapitalModalOpen: false }),
  loadFinancialData: async () => {
    set({ isLoading: true, error: null });
    try {
      const [transactions, capitalEvents, activityLogs] = await Promise.all([listTransactions(), listCapitalEvents(), listActivityLogs()]);
      set({ transactions, capitalEvents, activityLogs, hasLoaded: true, isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Failed to load transactions", isLoading: false });
    }
  },
  loadTransactions: async () => {
    await useTransactionStore.getState().loadFinancialData();
  },
  addTransaction: async (draft) => {
    set({ isSaving: true, error: null });
    try {
      const transaction = await createTransaction(draft);
      const activityLogs = await listActivityLogs();
      set((state) => ({
        transactions: [transaction, ...state.transactions],
        activityLogs,
        isSaving: false,
        isModalOpen: false,
        hasLoaded: true,
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Failed to save transaction", isSaving: false });
    }
  },
  addCapitalEvent: async (draft) => {
    set({ isSaving: true, error: null });
    try {
      const { transactions, capitalEvents } = useTransactionStore.getState();
      const capitalEvent = await createCapitalEvent(draft, transactions, capitalEvents);
      const activityLogs = await listActivityLogs();
      set((state) => ({
        capitalEvents: [capitalEvent, ...state.capitalEvents].sort((a, b) => b.createdAt - a.createdAt),
        activityLogs,
        isSaving: false,
        isCapitalModalOpen: false,
        hasLoaded: true,
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Failed to save capital event", isSaving: false });
    }
  },
}));
