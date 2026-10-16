# ExpenseOS

A local-first personal finance system that runs as a **native desktop app**.

Transactions, capital events and an immutable activity trail live in a SQLite database
on your own machine — no server, no account, no cloud sync. The UI is a React SPA
wrapped in a Tauri 2 desktop shell.

> **Status: v0.1.0 — early.** Dashboard, Transactions, Capital Ledger and Activity
> History are functional. Analytics, Calendar and Settings are routed placeholders.
> There is no editing or deleting yet: records are append-only.

---

## Tech stack

| Layer | Choice | Version |
|---|---|---|
| Desktop shell | Tauri | ^2.0.0 |
| Backend language | Rust (edition 2021) | — |
| DB access from Rust | `tauri-plugin-sql` (SQLite feature) | ^2.0.0 |
| UI | React | ^19.0.0 |
| Routing | `react-router-dom` | ^7.0.0 |
| Build tool | Vite + `@vitejs/plugin-react` | ^6.0.0 / ^4.3.0 |
| Language | TypeScript (strict) | ^5.7.0 |
| Styling | Tailwind CSS + `tailwind-merge` + `clsx` | ^3.4.17 |
| Animation | Framer Motion | ^12.0.0 |
| Charts | Recharts | ^2.15.0 |
| Icons | lucide-react | ^0.468.0 |
| State | Zustand (+ `persist` middleware) | ^5.0.0 |
| ORM / schema | Drizzle ORM + drizzle-kit | ^0.45.2 / ^0.31.0 |
| Database | SQLite (`expenseos.db`, via Tauri SQL plugin) | — |
| Font | Inter | — |

---

## Requirements

- **Node.js 18+** and **npm**
- **Rust toolchain** (`rustup`, stable) — required for the Tauri shell
- **Windows:** Microsoft C++ Build Tools + WebView2 (WebView2 ships with Windows 11
  and current Windows 10; the NSIS bundler is used for installers)
- A Tauri desktop environment. This is a desktop app — `npm run dev` alone gives you
  a browser preview with **no database** (see [Browser preview](#browser-preview)).

---

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Run the desktop app (the real thing)

```bash
npm run dev
```

This starts Vite on `http://127.0.0.1:1420` and launches the Tauri window pointed at
it. First run compiles the Rust side, so expect several minutes; later runs are fast.
The SQLite file `expenseos.db` is created on first write, next to the app's data
directory.

The `tauri:dev` script pins `RUSTUP_HOME` and `CARGO_HOME` to the developer's Windows
profile paths:

```json
"tauri:dev": "cross-env RUSTUP_HOME=C:\\Users\\raule\\.rustup CARGO_HOME=C:\\Users\\raule\\.cargo tauri dev"
```

**If your Rust lives somewhere else, that path is wrong for you** — edit the script or
set the variables in your shell and call `npx tauri dev` directly.

### 3. Build a release

```bash
npm run tauri:build
```

Runs `npm run build` (TypeScript check + Vite bundle into `dist/`) and then bundles the
Tauri app. Output lands in `src-tauri/target/release/bundle/` — on Windows, an NSIS
installer.

### 4. Other scripts

| Script | What it does |
|---|---|
| `npm run dev` | Vite dev server only, port 1420, `strictPort` (no Tauri, no SQLite) |
| `npm run build` | `tsc && vite build` → `dist/` |
| `npm run preview` | Serve the built frontend |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:generate` | drizzle-kit generate from `src/database/schema.ts` into `src/database/migrations` |
| `npm run tauri` | Raw Tauri CLI passthrough |

---

## Architecture

```
┌──────────────────────────── Tauri 2 desktop window ────────────────────────────┐
│                                                                                │
│  React 19 SPA (Vite, TS)                                                       │
│    pages/  ── dashboard · transactions · capital-ledger · activity-history     │
│    store/  ── Zustand: transaction, dashboard, sidebar, theme                  │
│    services/ ── transaction · capital · activity   (async data access)         │
│    database/ ── client (Tauri SQL) · schema (Drizzle)                          │
│                          │                                                     │
│                          │ @tauri-apps/plugin-sql (invoke)                     │
│                          ▼                                                     │
│  Rust: tauri_plugin_sql::Builder ──► SQLite  expenseos.db                      │
└────────────────────────────────────────────────────────────────────────────────┘
```

Data flow: **page → Zustand store → service → `getDatabase()` → SQL**. Selectors in
`src/store/finance-selectors.ts` derive every dashboard figure (balances, trends,
category split, activity feed) from the raw rows, so there is one source of truth and
no duplicated arithmetic in components.

### Database schema

Defined twice — as Drizzle table definitions in `src/database/schema.ts`, and as raw
`CREATE TABLE IF NOT EXISTS` statements in `src/database/client.ts`. **The client is
what actually runs**; keep the two in sync.

```
transactions
  id TEXT PK · type TEXT CHECK(income|expense) · amount REAL · category TEXT
  note TEXT NULL · created_at INTEGER · updated_at INTEGER

capital_events
  id TEXT PK · amount REAL · source TEXT · note TEXT NULL
  balance_before REAL · balance_after REAL · created_at INTEGER

activity_logs
  id TEXT PK · action_type TEXT · entity_type TEXT · entity_id TEXT
  old_data TEXT(JSON) NULL · new_data TEXT(JSON) NULL · timestamp INTEGER
```

Initialization happens once per app load in `src/hooks/use-database-init.ts`, driven by
`AppLayout`. `client.ts` also runs an `ALTER TABLE capital_events ADD COLUMN note` inside
a `try/catch` to migrate databases created before that column existed.

### Core domain rule

```
Current balance = (sum of all capital_events) − (sum of expense transactions)
```

Income transactions do **not** add to the balance — capital events are the only thing
that funds the account. This is deliberate, and it is the one rule to understand before
changing any calculation. `balance_before` / `balance_after` on each capital event are
snapshots taken at insert time from the balance *then*, so editing history later would
invalidate them.

### Activity log

Every write appends an `activity_logs` row: `capital_added`, `income_added` or
`expense_logged`, with `oldData` / `newData` JSON payloads. The Activity History page is
a read-only view of this stream, filterable by All / Transactions / Capital / System.
The log is append-only by design — nothing in the codebase updates or deletes a row.

### Browser preview (no Tauri)

`src/utils/runtime.ts` checks for `window.__TAURI_INTERNALS__`. Outside the Tauri
runtime every service falls back to `localStorage` under these keys:

- `expenseos-transactions`
- `expenseos-capital-events`
- `expenseos-activity-logs`
- `expenseos-theme` (theme store, via Zustand persist)
- `expenseos-sidebar` (sidebar collapse state, via Zustand persist)

`initializeDatabase()` returns `"browser-preview"` instead of `"ready"` and the UI still
works, which makes `npm run dev` in a plain browser a usable design loop. Anything you
enter there is **not** in SQLite and will not appear in the desktop app.

---

## Project structure

```
ExpenseOS/
├── index.html                     # SPA entry
├── vite.config.ts                 # port 1420, @/ → src alias, VITE_/TAURI_ env prefix
├── tailwind.config.ts             # theme tokens, glow/panel shadows, premium-radial bg
├── postcss.config.js
├── drizzle.config.ts              # sqlite dialect, schema + migrations paths
├── tsconfig.json                  # strict, bundler resolution, @/* paths
└── src/
    ├── main.tsx                   # applies theme, mounts RouterProvider
    ├── styles.css                 # Tailwind layers + theme CSS variables
    ├── routes/router.tsx          # route table
    ├── layouts/app-layout.tsx     # sidebar + header + modals + DB init
    ├── pages/                     # dashboard, transactions, capital-ledger,
    │                              # activity-history, placeholder-page
    ├── components/
    │   ├── layout/                # sidebar, top-header
    │   ├── dashboard/             # summary-card, charts, activity-feed, FAB
    │   ├── transactions/          # new-transaction-modal
    │   ├── capital/               # add-capital-modal
    │   └── ui/                    # button, card, segmented-control, skeleton
    ├── store/                     # Zustand stores + finance-selectors
    ├── services/                  # transaction, capital, activity
    ├── database/                  # client (Tauri SQL), schema (Drizzle)
    ├── hooks/use-database-init.ts
    ├── types/finance.ts
    ├── themes/themes.ts
    ├── utils/                     # cn, currency, runtime
    └── animations/transitions.ts
└── src-tauri/
    ├── src/main.rs · src/lib.rs   # plugin registration
    ├── tauri.conf.json            # 1440×940 window, min 1180×760, NSIS bundle
    ├── capabilities/default.json  # core + sql permissions
    ├── Cargo.toml · build.rs
    └── icons/
```

### Routes

| Path | Page | State |
|---|---|---|
| `/` | Dashboard | Live |
| `/transactions` | Transactions ledger | Live |
| `/capital-ledger` | Capital Ledger | Live |
| `/activity-history` | Activity History | Live |
| `/analytics` | Analytics | Placeholder |
| `/calendar` | Calendar | Placeholder |
| `/settings` | Settings | Placeholder |

`createBrowserRouter` is used, so a **desktop host must serve `index.html` for unknown
paths** — fine inside Tauri, relevant if you ever serve the frontend over HTTP.

---

## Features

**Dashboard** — six summary cards (current balance, today/weekly/monthly spending,
lifetime income, lifetime expenses) with a Day/Week/Month/Year timeframe switch driving
an expense trend line, an income-vs-expense chart, a category donut, and an activity
feed. Charts are Recharts; each has loading and empty states.

**Transactions** — a ledger table of every income/expense with category, timestamp and
signed amount. The New Transaction modal takes type, amount, category (Housing, Food,
Travel, Health, Utilities, Salary, Investment, Other) and an optional note. Writes go to
SQLite and append an activity log entry in the same operation.

**Capital Ledger** — capital events with amount, source, optional note and date, plus
`balance before → balance after` snapshots captured at insert time.

**Activity History** — the immutable event stream with filters and balance snapshots.

**Theming** — two themes, **Midnight** (default) and **Clean Light**, applied as a
`data-theme` attribute on `<html>` with all colours as CSS variables consumed by
Tailwind. Persisted across launches. The header button toggles them.

**Currency** — INR only, formatted with `Intl.NumberFormat("en-IN")`; compact notation
kicks in above ₹9,00,000 (`src/utils/currency.ts`). Dates use `en-IN` locale throughout.

---

## Known gaps and rough edges

Read this before you build on it.

- **The UI is completely untested.** There is no test runner, no test files, no lint
  config and no CI. `npm run typecheck` is the only automated check.
- **No edit or delete anywhere.** Transactions and capital events are append-only. This
  is partly why the balance snapshots on capital events stay valid — adding editing means
  deciding what happens to historical snapshots and activity log entries.
- **Drizzle is schema-only.** `drizzle-orm` is imported by `src/database/schema.ts` but
  no runtime query goes through it; every service uses raw SQL through the Tauri SQL
  plugin. The `src/database/migrations` directory referenced by `drizzle.config.ts` **does
  not exist yet** — run `npm run db:generate` once you actually adopt migrations. Today
  the schema is created by hand-written DDL in `client.ts`.
- **The two schema definitions can drift.** Drizzle types and the `CREATE TABLE`
  statements are maintained separately, with nothing checking they agree.
- **`tauri:dev` / `tauri:build` hardcode one machine's Rust paths.** See
  [step 2](#2-run-the-desktop-app-the-real-thing).
- **The search box in the header is decorative.** It is a styled `div` with no input and
  no handler.
- **`allow update, delete: if false` equivalent for the local DB** — nothing enforces the
  domain rules; a service bug can write any balance it likes.
- **`formatCurrency` always assumes INR** and `Intl` formatting is scattered across
  pages rather than centralised in `utils`.
- **`.gitignore` misses a few things** that are currently in the tree: the Vite logs
  (`.vite-dev.out.log`, `.vite-dev.err.log`, `.vite-job.log`), `src-tauri/gen/` is listed
  but present, and there is no entry for editor or OS files.
- **No data export or backup.** The whole point is that the data is local, so a SQLite
  file copy is the backup story — worth an explicit export button before this is used
  for real money.
- **Analytics, Calendar and Settings are placeholders** rendered by `PlaceholderPage`.

---

## Suggested next steps

1. Add a test runner (Vitest) and cover `finance-selectors.ts` — the balance rule and
   the trend bucketing are the two places a regression would quietly lie about money.
2. Commit to one schema source: either generate DDL from Drizzle and run migrations on
   startup, or drop Drizzle and keep the SQL.
3. Add edit/delete with a compensating-entry model so the activity log stays immutable.
4. Make the header search real, backed by a selector over transactions and activity.
5. Add export (JSON/CSV) and a "reveal database file" action in Settings.
6. Move the Rust home paths out of `package.json` into a documented env setup.
