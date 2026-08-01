# 🗺️ Dalafin Implementation & Engineering Roadmap

**Goal:** Build and ship Dalafin as a production-grade, offline-first mobile financial companion for emerging markets.

---

## 🎯 Phase 1: Local Storage & Offline Database Engine
- **Target**: Ensure 100% offline data persistence on mobile devices.
- **Tasks**:
  - [ ] Integrate `isar` or `sqflite` local database in Flutter (`mobile/lib/core/storage/`).
  - [ ] Create local schemas for Accounts, Transactions, Recurring Bills, and Wishlist Items.
  - [ ] Write local repository providers to support CRUD operations without network dependency.

---

## ⚡ Phase 2: Full API Integration & Auth Sync
- **Target**: Seamless sync between mobile app and FastAPI backend.
- **Tasks**:
  - [ ] Implement JWT Authentication screens (Login/Signup/Profile setup).
  - [ ] Connect `http` / `dio` HTTP client to FastAPI REST endpoints (`/auth`, `/accounts`, `/api/transactions`, `/wishlist`).
  - [ ] Build offline delta sync queue (`/api/v1/sync`) to push pending offline transactions when back online.

---

## 🧠 Phase 3: Adaptive Velocity Engine & Anomaly Flags
- **Target**: Real-time spending velocity monitoring and pacing alerts.
- **Tasks**:
  - [ ] Implement hourly spend velocity calculation in Flutter & FastAPI.
  - [ ] Add pacing warning banners (*"⚠️ Pacing Alert: 75% cap used before noon"*).
  - [ ] Implement day-of-week adaptive limit shift while maintaining monthly budget caps.

---

## 🔔 Phase 4: Local Notifications & Reminders
- **Target**: Proactive interventions and bill alerts.
- **Tasks**:
  - [ ] Integrate `flutter_local_notifications` package in mobile.
  - [ ] Schedule 1-2 day advance alerts for recurring bills (ZESA, Data, Rent).
  - [ ] Schedule 8:00 PM nightly reflection prompt notification.
  - [ ] Trigger notification when Wishlist Icebox cooldown timers expire.

---

## 🤖 Phase 5: Minimax AI Coach Integration
- **Target**: AI-driven emotional trigger detection and reflection feedback.
- **Tasks**:
  - [ ] Connect Nightly Reflection Dialog in Flutter to backend `/insights/analyze-reflection` endpoint.
  - [ ] Display extracted emotional triggers (*"Stress after work"*, *"Social pressure"*) and actionable advice.
  - [ ] Generate dynamic pre-purchase reflection questions for impulse purchases.

---

## 📦 Phase 6: Build & Production Release
- **Target**: Deliver production app packages.
- **Tasks**:
  - [ ] Configure Android release signing & generate `app-release.apk` / `app-release.aab`.
  - [ ] Configure iOS Xcode release bundle (`.ipa`).
  - [ ] Dockerize backend FastAPI server for deployment.
