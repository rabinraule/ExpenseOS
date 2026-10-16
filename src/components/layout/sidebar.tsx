import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Activity,
  BarChart3,
  CalendarDays,
  ChevronLeft,
  LayoutDashboard,
  LineChart,
  PanelLeft,
  ReceiptText,
  Settings,
  WalletCards,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebarStore } from "@/store/sidebar-store";
import { cn } from "@/utils/cn";

const navItems = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Transactions", path: "/transactions", icon: ReceiptText },
  { label: "Capital Ledger", path: "/capital-ledger", icon: WalletCards },
  { label: "Analytics", path: "/analytics", icon: BarChart3 },
  { label: "Calendar", path: "/calendar", icon: CalendarDays },
  { label: "Activity History", path: "/activity-history", icon: Activity },
  { label: "Settings", path: "/settings", icon: Settings },
];

export function Sidebar() {
  const { isCollapsed, toggle } = useSidebarStore();

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 92 : 280 }}
      transition={{ type: "spring", stiffness: 260, damping: 30 }}
      className="flex h-screen shrink-0 flex-col border-r border-border/80 bg-card/72 px-4 py-5 backdrop-blur-xl"
    >
      <div className="mb-8 flex items-center justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-glow">
            <LineChart size={22} />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold tracking-normal">ExpenseOS</h1>
              <p className="truncate text-xs text-muted-foreground">Local finance system</p>
            </div>
          )}
        </div>
        {!isCollapsed && (
          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Collapse sidebar">
            <ChevronLeft size={18} />
          </Button>
        )}
      </div>

      {isCollapsed && (
        <Button variant="ghost" size="icon" className="mb-5 self-center" onClick={toggle} aria-label="Expand sidebar">
          <PanelLeft size={18} />
        </Button>
      )}

      <nav className="space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            title={isCollapsed ? item.label : undefined}
            className={({ isActive }) =>
              cn(
                "group flex h-12 items-center gap-3 rounded-2xl px-3 text-sm font-medium text-muted-foreground transition",
                isCollapsed && "justify-center",
                isActive && "bg-primary/12 text-foreground ring-1 ring-primary/25",
                !isActive && "hover:bg-muted/80 hover:text-foreground",
              )
            }
          >
            <item.icon size={20} className="shrink-0" />
            {!isCollapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </motion.aside>
  );
}
