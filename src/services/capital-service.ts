import { getDatabase } from "@/database/client";
import { appendActivityLog } from "@/services/activity-service";
import type { CapitalEventDraft, CapitalEventRecord, TransactionRecord } from "@/types/finance";
import { selectCurrentBalance } from "@/store/finance-selectors";
import { isTauriRuntime } from "@/utils/runtime";

const STORAGE_KEY = "expenseos-capital-events";

function readPreviewCapitalEvents(): CapitalEventRecord[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as CapitalEventRecord[]) : [];
}

function writePreviewCapitalEvents(events: CapitalEventRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

function createRecord(draft: CapitalEventDraft, transactions: TransactionRecord[], capitalEvents: CapitalEventRecord[]) {
  const amount = Math.abs(draft.amount);
  const balanceBefore = selectCurrentBalance(transactions, capitalEvents);
  const timestamp = draft.date ? new Date(draft.date).getTime() : Date.now();

  return {
    id: crypto.randomUUID(),
    amount,
    source: draft.source.trim(),
    note: draft.note?.trim() || undefined,
    balanceBefore,
    balanceAfter: balanceBefore + amount,
    createdAt: Number.isNaN(timestamp) ? Date.now() : timestamp,
  } satisfies CapitalEventRecord;
}

export async function listCapitalEvents(): Promise<CapitalEventRecord[]> {
  if (!isTauriRuntime()) {
    return readPreviewCapitalEvents();
  }

  const db = await getDatabase();
  const rows = await db.select<Array<Record<string, unknown>>>(
    `SELECT id, amount, source, note, balance_before, balance_after, created_at
     FROM capital_events
     ORDER BY created_at DESC`,
  );

  return rows.map((row) => ({
    id: String(row.id),
    amount: Number(row.amount),
    source: String(row.source),
    note: row.note ? String(row.note) : undefined,
    balanceBefore: Number(row.balance_before),
    balanceAfter: Number(row.balance_after),
    createdAt: Number(row.created_at),
  }));
}

export async function createCapitalEvent(
  draft: CapitalEventDraft,
  transactions: TransactionRecord[],
  capitalEvents: CapitalEventRecord[],
): Promise<CapitalEventRecord> {
  const record = createRecord(draft, transactions, capitalEvents);

  if (!isTauriRuntime()) {
    const events = [record, ...readPreviewCapitalEvents()].sort((a, b) => b.createdAt - a.createdAt);
    writePreviewCapitalEvents(events);
    await appendActivityLog({
      actionType: "capital_added",
      entityType: "capital_event",
      entityId: record.id,
      oldData: { balance: record.balanceBefore },
      newData: record,
    });
    return record;
  }

  const db = await getDatabase();
  await db.execute(
    `INSERT INTO capital_events (id, amount, source, note, balance_before, balance_after, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [record.id, record.amount, record.source, record.note ?? null, record.balanceBefore, record.balanceAfter, record.createdAt],
  );
  await appendActivityLog({
    actionType: "capital_added",
    entityType: "capital_event",
    entityId: record.id,
    oldData: { balance: record.balanceBefore },
    newData: record,
  });

  return record;
}
