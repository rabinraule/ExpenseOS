import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fadeUp } from "@/animations/transitions";

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

export function PlaceholderPage({ title, description, icon: Icon }: PlaceholderPageProps) {
  return (
    <motion.div {...fadeUp} className="grid min-h-[calc(100vh-180px)] place-items-center">
      <Card className="w-full max-w-3xl p-8">
        <div className="mb-8 flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/12 text-primary">
            <Icon size={26} />
          </div>
          <div>
            <h2 className="text-2xl font-semibold">{title}</h2>
            <p className="mt-1 text-muted-foreground">{description}</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="mt-4 h-48" />
      </Card>
    </motion.div>
  );
}
