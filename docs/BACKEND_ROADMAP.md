# ⚙️ Dalafin Backend Architecture & Engineering Roadmap

**Target:** Elevate the FastAPI backend into a production-ready, resilient, and intelligent financial engine with Alembic database migrations, offline delta sync, adaptive velocity analytics, and automated Pytest test coverage.

---

## 🗺️ Backend Phased Implementation Plan

```
+-----------------------------------------------------------------------------------------------+
|                                DALAFIN BACKEND ROADMAP                                        |
|                                                                                               |
|   +--------------------------+   +--------------------------+   +-------------------------+   |
|   | PHASE B1                 |   | PHASE B2                 |   | PHASE B3                |   |
|   | Alembic Migrations & Seed|   | Offline Delta Sync API   |   | Adaptive Velocity Analytics|
|   | • Alembic migration env  |   | • /api/v1/sync endpoint  |   | • Hourly velocity engine|   |
|   | • DB Seeder scripts      |   | • Idempotent batch processing | Day-of-week weights  |   |
|   +--------------------------+   +--------------------------+   +-------------------------+   |
|                                                                                               |
|   +--------------------------+   +--------------------------+   +-------------------------+   |
|   | PHASE B4                 |   | PHASE B5                 |   | PHASE B6                |   |
|   | Recurring Cron Worker    |   | AI Chat Coach & Caching  |   | Pytest & Security Audit |   |
|   | • Auto-deduct recurring  |   | • /insights/chat endpoint|   | • Pytest router tests   |   |
|   | • Midnight rollover task |   | • Redis response cache   |   | • Rate limiting (slowapi)|
|   +--------------------------+   +--------------------------+   +-------------------------+   |
+-----------------------------------------------------------------------------------------------+
```

---

## 📋 Detailed Phase Breakdown

### 🎯 Phase B1: Alembic Migrations & DB Seeders
- [ ] Initialize Alembic environment in `backend/alembic/`.
- [ ] Generate baseline migration script for `users`, `accounts`, `transactions`, `recurring_expenses`, `wishlist_items`, `reflections`, `goals`, `category_limits`.
- [ ] Create `backend/seed.py` database seeder populating standard categories (Food, Transport, Utilities, Entertainment, Shopping) and demo tariff rates.

### ⚡ Phase B2: Offline Delta Sync Endpoint (`/api/v1/sync`)
- [ ] Create `backend/routes/sync.py` to handle batched offline payloads from the Flutter app.
- [ ] Ensure idempotent processing (deduplicate by transaction UUID).
- [ ] Process atomic account balance debits and category limit updates within a single DB transaction.

### 🧠 Phase B3: Adaptive Velocity Analytics Engine
- [ ] Create `backend/services/adaptive_engine.py` calculating spend velocity vs time-of-day expectations.
- [ ] Expose GET `/api/budget/velocity` returning pacing alert status, current velocity percentage, and warning messages.
- [ ] Implement day-of-week adaptive daily limit calculation ($0.9\times$ Mon–Thu, $1.2\times$ Fri–Sat).

### 🔄 Phase B4: Recurring Bill Cron Scheduler
- [ ] Upgrade `backend/services/scheduler.py` (APScheduler) to run daily at 00:05 AM.
- [ ] Scan `recurring_expenses` for due dates and auto-generate pending transactions or push notifications.
- [ ] Execute midnight budget rollover calculation ($100\%$ unspent daily cap carried forward, max 3 days).

### 🤖 Phase B5: Minimax AI Chat Coach & Response Caching
- [ ] Implement POST `/api/insights/chat` endpoint allowing users to ask conversational financial questions to the Minimax AI coach (`abab5.5-chat`).
- [ ] Cache frequent AI response prompts in memory/Redis to optimize response time and reduce API costs.

### 🛡️ Phase B6: Automated Pytest Suite & Security Hardening
- [ ] Write Pytest test suite in `backend/tests/` testing:
  - `test_auth.py`: User registration, login, JWT token verification.
  - `test_tariff_engine.py`: EcoCash USD, IMTT 2%, and ZiG fee calculations.
  - `test_transactions.py`: Transaction posting, account debit, category limit updates.
  - `test_sync.py`: Batch offline sync idempotency.
- [ ] Add `slowapi` rate limiting to sensitive authentication and LLM endpoints.
