import { useEffect, useState } from "react";
import { type DatabaseInitStatus, initializeDatabase } from "@/database/client";

export function useDatabaseInit() {
  const [isReady, setIsReady] = useState(false);
  const [status, setStatus] = useState<DatabaseInitStatus | "initializing">("initializing");
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    initializeDatabase()
      .then((nextStatus) => {
        setStatus(nextStatus);
        setIsReady(true);
      })
      .catch((cause) => {
        setError(cause instanceof Error ? cause : new Error("Database initialization failed"));
      });
  }, []);

  return { isReady, status, error };
}
