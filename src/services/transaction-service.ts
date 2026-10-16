import { getDatabase } from "@/database/client";
import { appendActivityLog } from "@/services/activity-service";
import type { TransactionDraft, TransactionRecord } from "@/types/finance";
import { isTauriRuntime } from "@/utils/runtime";

const STORAGE_KEY = "expenseos-transactions";

function readPreviewTransactions(): TransactionRecord[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as TransactionRecord[]) : [];
}

function writePreviewTransactions(transactions: TransactionRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

function now() {
  return Date.now();
}

function createRecord(draft: TransactionDraft): TransactionRecord {
  const timestamp = now();

  return {
    id: crypto.randomUUID(),
    type: draft.type,
    amount: Math.abs(draft.amount),
    category: draft.category,
    note: draft.note?.trim() || undefined,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export async function listTransactions(): Promise<TransactionRecord[]> {
  if (!isTauriRuntime()) {
    return readPreviewTransactions();
  }

  const db = await getDatabase();
  const rows = await db.select<Array<Record<string, unknown>>>(
    `SELECT id, type, amount, category, note, created_at, updated_at
     FROM transactions
     ORDER BY created_at DESC`,
  );

  return rows.map((row) => ({
    id: String(row.id),
    type: row.type as TransactionRecord["type"],
    amount: Number(row.amount),
    category: String(row.category),
    note: row.note ? String(row.note) : undefined,
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
  }));
}

export async function createTransaction(draft: TransactionDraft): Promise<TransactionRecord> {
  const record = createRecord(draft);

  if (!isTauriRuntime()) {
    const transactions = [record, ...readPreviewTransactions()];
    writePreviewTransactions(transactions);
    await appendActivityLog({
      actionType: record.type === "income" ? "income_added" : "expense_logged",
      entityType: "transaction",
      entityId: record.id,
      newData: record,
    });
    return record;
  }

  const db = await getDatabase();
  await db.execute(
    `INSERT INTO transactions (id, type, amount, category, note, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [record.id, record.type, record.amount, record.category, record.note ?? null, record.createdAt, record.updatedAt],
  );
  await appendActivityLog({
    actionType: record.type === "income" ? "income_added" : "expense_logged",
    entityType: "transaction",
    entityId: record.id,
    newData: record,
  });

  return record;
}
