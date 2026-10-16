import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", '[data-theme="midnight"]'],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "Segoe UI", "sans-serif"],
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        border: "hsl(var(--border))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        accent: "hsl(var(--accent))",
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        danger: "hsl(var(--danger))",
      },
      boxShadow: {
        glow: "0 0 48px hsl(var(--primary) / 0.24)",
        panel: "0 18px 70px hsl(222 47% 4% / 0.25)",
      },
      backgroundImage: {
        "premium-radial":
          "radial-gradient(circle at 20% 10%, hsl(var(--primary) / 0.18), transparent 28%), radial-gradient(circle at 82% 4%, hsl(var(--accent) / 0.16), transparent 26%)",
      },
    },
  },
  plugins: [],
};

export default config;
