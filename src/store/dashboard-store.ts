import { create } from "zustand";
import type { Timeframe } from "@/types/finance";

interface DashboardState {
  timeframe: Timeframe;
  setTimeframe: (timeframe: Timeframe) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  timeframe: "week",
  setTimeframe: (timeframe) => set({ timeframe }),
}));
