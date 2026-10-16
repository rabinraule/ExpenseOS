import type { HTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <section className={cn("glass-panel rounded-[var(--radius)] p-5", className)} {...props} />;
}
