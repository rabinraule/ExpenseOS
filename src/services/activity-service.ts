import { getDatabase } from "@/database/client";
import type { ActivityLogRecord } from "@/types/finance";
import { isTauriRuntime } from "@/utils/runtime";

const STORAGE_KEY = "expenseos-activity-logs";

export interface ActivityLogInput {
  id?: string;
  actionType: string;
  entityType: string;
  entityId: string;
  oldData?: unknown;
  newData?: unknown;
  timestamp?: number;
}

function readPreviewActivityLogs(): ActivityLogRecord[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as ActivityLogRecord[]) : [];
}

function parseJsonField(value: unknown) {
  if (typeof value !== "string" || value.length === 0) return undefined;

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

export async function listActivityLogs(): Promise<ActivityLogRecord[]> {
  if (!isTauriRuntime()) {
    return readPreviewActivityLogs().sort((a, b) => b.timestamp - a.timestamp);
  }

  const db = await getDatabase();
  const rows = await db.select<Array<Record<string, unknown>>>(
    `SELECT id, action_type, entity_type, entity_id, old_data, new_data, timestamp
     FROM activity_logs
     ORDER BY timestamp DESC`,
  );

  return rows.map((row) => ({
    id: String(row.id),
    actionType: String(row.action_type),
    entityType: String(row.entity_type),
    entityId: String(row.entity_id),
    oldData: parseJsonField(row.old_data),
    newData: parseJsonField(row.new_data),
    timestamp: Number(row.timestamp),
  }));
}

export async function appendActivityLog(input: ActivityLogInput): Promise<ActivityLogRecord> {
  const record: ActivityLogRecord = {
    id: input.id ?? crypto.randomUUID(),
    actionType: input.actionType,
    entityType: input.entityType,
    entityId: input.entityId,
    oldData: input.oldData,
    newData: input.newData,
    timestamp: input.timestamp ?? Date.now(),
  };

  if (!isTauriRuntime()) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([record, ...readPreviewActivityLogs()].sort((a, b) => b.timestamp - a.timestamp)));
    return record;
  }

  const db = await getDatabase();

  await db.execute(
    `INSERT INTO activity_logs (id, action_type, entity_type, entity_id, old_data, new_data, timestamp)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      record.id,
      record.actionType,
      record.entityType,
      record.entityId,
      record.oldData ? JSON.stringify(record.oldData) : null,
      record.newData ? JSON.stringify(record.newData) : null,
      record.timestamp,
    ],
  );

  return record;
}
