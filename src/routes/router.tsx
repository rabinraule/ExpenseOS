import { createBrowserRouter } from "react-router-dom";
import { BarChart3, CalendarDays, Settings } from "lucide-react";
import { AppLayout } from "@/layouts/app-layout";
import { ActivityHistoryPage } from "@/pages/activity-history";
import { CapitalLedgerPage } from "@/pages/capital-ledger";
import { DashboardPage } from "@/pages/dashboard";
import { PlaceholderPage } from "@/pages/placeholder-page";
import { TransactionsPage } from "@/pages/transactions";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      {
        path: "transactions",
        element: <TransactionsPage />,
      },
      {
        path: "capital-ledger",
        element: <CapitalLedgerPage />,
      },
      {
        path: "analytics",
        element: <PlaceholderPage title="Analytics" description="Deeper reporting modules can be added without changing the shell." icon={BarChart3} />,
      },
      {
        path: "calendar",
        element: <PlaceholderPage title="Calendar" description="A timeline view for spending and income events." icon={CalendarDays} />,
      },
      {
        path: "activity-history",
        element: <ActivityHistoryPage />,
      },
      {
        path: "settings",
        element: <PlaceholderPage title="Settings" description="Theme, storage, and desktop preferences foundation." icon={Settings} />,
      },
    ],
  },
]);
