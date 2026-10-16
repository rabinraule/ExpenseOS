import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const transactions = sqliteTable("transactions", {
  id: text("id").primaryKey(),
  type: text("type", { enum: ["income", "expense"] }).notNull(),
  amount: real("amount").notNull(),
  category: text("category").notNull(),
  note: text("note"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const capitalEvents = sqliteTable("capital_events", {
  id: text("id").primaryKey(),
  amount: real("amount").notNull(),
  source: text("source").notNull(),
  note: text("note"),
  balanceBefore: real("balance_before").notNull(),
  balanceAfter: real("balance_after").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const activityLogs = sqliteTable("activity_logs", {
  id: text("id").primaryKey(),
  actionType: text("action_type").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  oldData: text("old_data", { mode: "json" }),
  newData: text("new_data", { mode: "json" }),
  timestamp: integer("timestamp", { mode: "timestamp" }).notNull(),
});

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type CapitalEvent = typeof capitalEvents.$inferSelect;
export type ActivityLog = typeof activityLogs.$inferSelect;
