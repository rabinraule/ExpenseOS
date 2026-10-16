import Database from "@tauri-apps/plugin-sql";
import { isTauriRuntime } from "@/utils/runtime";

const DATABASE_URL = "sqlite:expenseos.db";

let dbPromise: Promise<Database> | null = null;

export function getDatabase() {
  if (!isTauriRuntime()) {
    throw new Error("SQLite is available inside the Tauri desktop runtime only.");
  }

  if (!dbPromise) {
    dbPromise = Database.load(DATABASE_URL);
  }

  return dbPromise;
}

export type DatabaseInitStatus = "ready" | "browser-preview";

export async function initializeDatabase(): Promise<DatabaseInitStatus> {
  if (!isTauriRuntime()) {
    return "browser-preview";
  }

  const db = await getDatabase();

  await db.execute(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
      amount REAL NOT NULL,
      category TEXT NOT NULL,
      note TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS capital_events (
      id TEXT PRIMARY KEY,
      amount REAL NOT NULL,
      source TEXT NOT NULL,
      note TEXT,
      balance_before REAL NOT NULL,
      balance_after REAL NOT NULL,
      created_at INTEGER NOT NULL
    );
  `);

  try {
    await db.execute(`ALTER TABLE capital_events ADD COLUMN note TEXT;`);
  } catch {
    // Existing databases may already have the column.
  }

  await db.execute(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id TEXT PRIMARY KEY,
      action_type TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      old_data TEXT,
      new_data TEXT,
      timestamp INTEGER NOT NULL
    );
  `);

  return "ready";
}
