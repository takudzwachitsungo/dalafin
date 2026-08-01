# 📜 Dalafin: Feature Breakdown & User Stories

**Product Name:** Dalafin  
**Product Vision:** A lightweight, offline-first mobile financial companion and behavioral discipline trainer for everyday people in developing markets.

---

## 🏛️ Epic 1: Pocket Wallets & Account Setup (Multi-Currency)

### US-1.1: Multi-Pocket Setup
- **User Story:** As a user in Zimbabwe/emerging market, I want to track my money across USD Cash, Mobile Money (EcoCash), and Bank accounts, so that I have a single clear picture of my total available liquid cash.
- **Acceptance Criteria:** Account creation with name, type (Cash, Mobile Money, Bank), currency, and initial balance.

### US-1.2: Instant Offline Expense Logging
- **User Story:** As a busy user purchasing an item, I want to log an expense in under 3 seconds offline, so that logging is effortless.
- **Acceptance Criteria:** Log requires Amount + Category + Account. Instant local database save.

### US-1.3: Transaction Fee & Tariff Engine
- **User Story:** As a user making payments via EcoCash or bank card, I want the app to automatically calculate and include transaction fees (e.g. 2% IMTT / EcoCash tariffs), so that my wallet balance accurately reflects the total deduction.
- **Acceptance Criteria:** Auto-calculates fees and debits `Base Amount + Fee Amount`.

---

## ⚡ Epic 2: Daily Budgeting & Adaptive Spend Velocity Engine

### US-2.1: Dynamic Daily Cap & Rollover
- **User Story:** As a user wanting to stay within my means, I want my unused daily allowance to roll over to tomorrow, so that I am rewarded for restraint today.
- **Acceptance Criteria:** Unspent daily cap rolls over to `Rollover Budget` (max 3 days).

### US-2.2: Spend Velocity & Anomaly Warning Flags
- **User Story:** As a user spending money throughout the day, I want to receive real-time pacing alerts if I spend too fast early in the day, so that I can adjust.
- **Acceptance Criteria:** Flags velocity spikes if >75% of daily cap is spent before 12:00 PM.

---

## 🛡️ Epic 3: The Behavioral Impulse Shield

### US-3.1: Before-You-Buy Work-Hour Calculator
- **User Story:** As a user considering a purchase, I want to see how many hours of work the item represents and its 5-year investment cost, so that I evaluate the purchase against real effort.
- **Acceptance Criteria:** Displays `Hours = Amount / Hourly Rate` and 5-year investment value at 7% p.a.

### US-3.2: Emergency Pause ($50+)
- **User Story:** As a user logging a purchase over $50, I want an Emergency Pause modal to trigger, so that I cool off or provide a written justification.
- **Acceptance Criteria:** Forces 24-hour wait or 20-character written reason.

---

## 🔄 Epic 4: Recurring Expenses & Smart Bill Reminders

### US-4.1: Recurring Bill Tracking
- **User Story:** As a user with recurring bills (ZESA, Data, Rent), I want to register my recurring obligations, so that I know committed funds.
- **Acceptance Criteria:** Tracks name, amount, frequency, due day, category.

### US-4.2: Bill Reminders
- **User Story:** As a user, I want push notifications 1-2 days before a recurring bill is due.
- **Acceptance Criteria:** Schedules local notifications for upcoming bills.

---

## 🔒 Epic 5: Wishlist Cooldown Queue

### US-5.1: Wishlist Icebox
- **User Story:** As a user wanting a non-essential item, I want to place it in a Wishlist queue, so that I test if my desire is genuine.
- **Acceptance Criteria:** 14 to 45-day cooldown icebox based on price.

---

## 🌙 Epic 6: Nightly Reflections & AI Trigger Analysis

### US-6.1: Nightly 10-Second Reflection
- **User Story:** As a user ending my day at 8:00 PM, I want to complete a quick reflection, so that I build spending self-awareness.
- **Acceptance Criteria:** 8:00 PM push prompt for mood & notes.

### US-6.2: AI Emotional Trigger Detection
- **User Story:** As a user, I want Minimax AI to parse my reflection notes, so that I learn my emotional overspending triggers.
- **Acceptance Criteria:** AI extracts psychological triggers and returns tailored advice.

---

## 📊 Epic 7: Visual Trends & Milestone Celebrations

### US-7.1: 30-Day Spending Heat Map
- **User Story:** As a user reviewing my month, I want a color-coded calendar, so that I spot good days vs over-budget days.
- **Acceptance Criteria:** 7-column calendar grid (Green = under cap, Amber = 80-100%, Red = over cap).

### US-7.2: Milestone Celebrations
- **User Story:** As a user reaching a streak milestone, I want celebration animations, so that I feel proud.
- **Acceptance Criteria:** Triggers confetti on 7-day streak, 30-day streak, $100 saved.
