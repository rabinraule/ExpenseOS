import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/layout/sidebar";
import { TopHeader } from "@/components/layout/top-header";
import { AddCapitalModal } from "@/components/capital/add-capital-modal";
import { NewTransactionModal } from "@/components/transactions/new-transaction-modal";
import { useDatabaseInit } from "@/hooks/use-database-init";
import { useSidebarStore } from "@/store/sidebar-store";
import { useTransactionStore } from "@/store/transaction-store";

export function AppLayout() {
  const { error, isReady } = useDatabaseInit();
  const setCollapsed = useSidebarStore((state) => state.setCollapsed);
  const loadFinancialData = useTransactionStore((state) => state.loadFinancialData);

  useEffect(() => {
    if (window.innerWidth < 960) {
      setCollapsed(true);
    }
  }, [setCollapsed]);

  useEffect(() => {
    if (isReady) {
      void loadFinancialData();
    }
  }, [isReady, loadFinancialData]);

  return (
    <div className="flex h-screen bg-background bg-premium-radial text-foreground transition-colors duration-300">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopHeader />
        {error && (
          <div className="mx-8 mt-4 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
            SQLite initialization failed: {error.message}
          </div>
        )}
        <main className="min-h-0 flex-1 overflow-y-auto px-8 py-7">
          <Outlet />
        </main>
        <AddCapitalModal />
        <NewTransactionModal />
      </div>
    </div>
  );
}
