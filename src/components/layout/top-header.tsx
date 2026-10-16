import { useLocation } from "react-router-dom";
import { Moon, Plus, Search, SunMedium } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useThemeStore } from "@/store/theme-store";
import { useTransactionStore } from "@/store/transaction-store";

const routeTitles: Record<string, string> = {
  "/": "Dashboard",
  "/transactions": "Transactions",
  "/capital-ledger": "Capital Ledger",
  "/analytics": "Analytics",
  "/calendar": "Calendar",
  "/activity-history": "Activity History",
  "/settings": "Settings",
};

export function TopHeader() {
  const { theme, toggleTheme } = useThemeStore();
  const openModal = useTransactionStore((state) => state.openModal);
  const location = useLocation();
  const today = new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <header className="flex h-20 shrink-0 items-center justify-between border-b border-border/70 px-8">
      <div>
        <p className="text-sm text-muted-foreground">{today}</p>
        <h2 className="text-2xl font-semibold tracking-normal">{routeTitles[location.pathname] ?? "ExpenseOS"}</h2>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden h-11 min-w-80 items-center gap-3 rounded-2xl border border-border bg-muted/45 px-4 text-muted-foreground lg:flex">
          <Search size={18} />
          <span className="text-sm">Search transactions, activity, categories</span>
        </div>
        <Button variant="subtle" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === "midnight" ? <SunMedium size={18} /> : <Moon size={18} />}
        </Button>
        <Button onClick={openModal}>
          <Plus size={18} />
          New Transaction
        </Button>
      </div>
    </header>
  );
}
