# 💎 Dalafin — Financial Discipline Companion & Wealth Trainer

Dalafin is a modern, offline-first mobile personal finance application and behavioral discipline trainer. Built specifically to help users in developing markets (such as Zimbabwe and across Africa) build healthy money habits, curb impulse spending, track multi-pocket funds (USD Cash, EcoCash, Bank Accounts), and automatically account for transaction fees and tariffs.

---

## ✨ Key Features

- 🏛️ **Multi-Pocket Wallets & Multi-Currency**: Track USD Cash, Mobile Money (EcoCash USD/ZiG), and Bank accounts with instant 100% offline logging.
- 💳 **Transaction Fee & Tariff Engine**: Automatically calculates and debits EcoCash tariffs, 2% IMTT bank transfer taxes, and transaction fees.
- ⚡ **Adaptive Daily Budget & Rollover**: Dynamic daily caps that adapt to spend velocity, carrying forward unspent funds as a rollover bonus (max 3 days).
- 🛡️ **Behavioral Impulse Shield**:
  - **Before-You-Buy Calculator**: Converts prices into hours of labor and 5-year investment opportunity cost.
  - **Emergency Pause ($50+)**: Mandatory 24-hour wait or written justification override for non-essential spend.
  - **Wishlist Cooldown Queue**: Scaled 14 to 45-day icebox for non-essentials.
- 🔄 **Recurring Bills & Subscription Reminders**: Track rent, ZESA electricity tokens, data bundles, and subscriptions with upcoming due date notifications.
- 🌙 **Nightly Reflections & Minimax AI**: 10-second evening reflection check-in analyzed by AI to uncover emotional triggers behind impulse spending.
- 📊 **30-Day Spending Heat Map & Milestone Celebrations**: Calendar heat maps, streak tracking, and celebratory confetti animations.

---

## 🛠️ Technology Stack

### Mobile App (`mobile/`)
- **Framework**: Flutter (iOS & Android)
- **Design System**: Dark Glassmorphic UI (Emerald `#10B981`, Amber `#F59E0B`, Rose `#EF4444`, Slate `#0F172A`)
- **State Management**: Riverpod / BLoC
- **Local Database**: Offline-First SQLite / Isar DB

### Backend (`backend/`)
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL with SQLAlchemy ORM
- **AI Integration**: Minimax LLM API (`abab5.5-chat`)
- **Authentication**: JWT Auth with Bcrypt Hashing
- **Scheduler**: Background Cron Tasks (midnight rollover & recurring checks)

---

## 🚀 Getting Started

### 1. Backend Server Setup

```bash
cd backend
# Create python virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run FastAPI server
uvicorn main:app --reload --port 8000
```

API documentation available at `http://localhost:8000/docs` (Swagger UI).

### 2. Flutter Mobile Setup

```bash
cd mobile
flutter pub get
flutter run
```

---

## 📜 License

MIT License
