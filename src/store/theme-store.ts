import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ThemeName } from "@/themes/themes";

interface ThemeState {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  toggleTheme: () => void;
  applyTheme: () => void;
}

function setDocumentTheme(theme: ThemeName) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.classList.toggle("dark", theme === "midnight");
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "midnight",
      setTheme: (theme) => {
        set({ theme });
        setDocumentTheme(theme);
      },
      toggleTheme: () => {
        const next = get().theme === "midnight" ? "clean-light" : "midnight";
        get().setTheme(next);
      },
      applyTheme: () => setDocumentTheme(get().theme),
    }),
    {
      name: "expenseos-theme",
      onRehydrateStorage: () => (state) => state?.applyTheme(),
    },
  ),
);
