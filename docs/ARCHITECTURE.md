# 🏛️ Dalafin: System Architecture & Technical Specifications

## 1. System Overview

Dalafin is a hybrid personal finance application that fuses the multi-account wealth tracking architecture of **Maybe Finance** with an offline-first **Behavioral Impulse Control Engine** designed specifically for users in emerging markets (e.g., Zimbabwe and Africa).

```
                                  SYSTEM ARCHITECTURE
                                  
+----------------------------------------------------------------------------------------+
|                                    FLUTTER MOBILE APP                                  |
|                                                                                        |
|  +---------------------+   +-----------------------+   +----------------------------+  |
|  | presentation/ (UI)  |   | domain/ (Use Cases)   |   | data/ (Repos & Services)   |  |
|  | - Glassmorphic Cards|   | - CalculateRollover   |   | - Local DB (Isar / SQLite) |  |
|  | - Heatmap Grid      |   | - EvaluateImpulse     |   | - Tariff Calculator        |  |
|  | - Motion Animations |   | - FormulateWorkHours  |   | - API Client (Dio + Auth)  |  |
|  +---------------------+   +-----------------------+   +----------------------------+  |
+-------------------------------------------+--------------------------------------------+
                                            |
                                            | REST API & Offline Sync
                                            v
+----------------------------------------------------------------------------------------+
|                                   FASTAPI BACKEND                                      |
|                                                                                        |
|  +---------------------+   +-----------------------+   +----------------------------+  |
|  | routes/             |   | services/             |   | models/ & database.py      |  |
|  | - /accounts         |   | - Fee Engine          |   | - PostgreSQL Tables        |  |
|  | - /api/transactions |   | - Minimax LLM AI      |   | - SQLAlchemy ORM           |  |
|  | - /auth             |   | - Scheduler & Cron    |   | - Alembic Migrations       |  |
|  +---------------------+   +-----------------------+   +----------------------------+  |
+----------------------------------------------------------------------------------------+
```

---

## 2. Core Subsystems

### A. Pocket Wallets & Tariff Engine
- **Multi-Pocket Support**: Tracks USD Cash, EcoCash (Mobile Money), and Bank accounts.
- **Automatic Fee Calculation**: Applies tariff rules (`ecocash_usd`, `imtt_2percent`, `ecocash_zig`) to deduct `Base Amount + Transaction Fee` from the respective wallet balance.

### B. Behavioral Discipline Engine
- **Daily Budget Cap & Rollover**: Unused daily allowance carries forward (up to a 3-day max cap).
- **Before-You-Buy Calculator**: Converts prices to hours of work (`Price / (Monthly Income / 160)`) and projects 5-year investment cost at 7% p.a.
- **Emergency Pause ($50+)**: Triggers a mandatory 24-hour cool-off countdown or a 20-character written justification override for non-essential purchases.
- **Wishlist Icebox**: Cools non-essential desires for 14–45 days.

### C. AI Emotional Trigger Engine
- Integrated with **Minimax LLM (`abab5.5-chat`)** to analyze nightly 8:00 PM reflections and identify psychological overspending triggers.

---

## 3. Database Schema (PostgreSQL / SQLAlchemy)

- **`users`**: Account owner profile, disposable income, currency, timezone.
- **`accounts`**: Wallets (Cash, EcoCash, Bank), currency, balance, tariff type.
- **`transactions`**: Base amount, fee amount, total deducted, category, is_impulse, account_id, emergency_reason.
- **`recurring_expenses`**: Bills, frequency, due day, auto-log setting.
- **`wishlist_items`**: Cooldown days, status (`waiting`, `ready`, `purchased`, `canceled`).
- **`reflections`**: Mood, regret/proud notes, AI-extracted triggers.
