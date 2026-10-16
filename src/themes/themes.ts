export type ThemeName = "midnight" | "clean-light";

export const themes: Record<ThemeName, { label: string; description: string }> = {
  midnight: {
    label: "Midnight",
    description: "Dark modern workspace",
  },
  "clean-light": {
    label: "Clean Light",
    description: "Bright productivity mode",
  },
};
