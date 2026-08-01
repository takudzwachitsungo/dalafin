# 💳 Transaction Fee & Tariff Engine Specification

## 1. Overview

In Zimbabwe and many emerging African markets, financial transactions via mobile money (EcoCash) or bank transfer incur transaction tariffs, taxes (such as the 2% IMTT Intermediated Money Transfer Tax), and withdrawal charges.

Dalafin's **Tariff Fee Engine** ensures that when a user logs an expense, the app automatically calculates the applicable tariff and debits the total (`Base Amount + Fee`) from the corresponding wallet balance.

---

## 2. Tariff Schedules

### A. EcoCash USD (`ecocash_usd`)
Tiered fee structure for EcoCash USD transactions:

| Transaction Amount Range | Fee Amount ($) |
| :--- | :--- |
| $\$0.01 - \$2.00$ | $\$0.05$ |
| $\$2.01 - \$5.00$ | $\$0.12$ |
| $\$5.01 - \$10.00$ | $\$0.25$ |
| $\$10.01 - \$20.00$ | $\$0.45$ |
| $\$20.01 - \$50.00$ | $\$0.95$ |
| $\$50.01 - \$100.00$ | $\$1.85$ |
| $> \$100.00$ | $2.0\%$ of transaction amount |

### B. IMTT 2% Bank Tax (`imtt_2percent`)
Standard tax applied to electronic bank transfers and card payments:
$$\text{Fee} = \text{Amount} \times 0.02$$

### C. EcoCash ZiG (`ecocash_zig`)
Standard mobile tariff applied to local currency mobile transactions:
$$\text{Fee} = \text{Amount} \times 0.025$$

---

## 3. Implementation Locations
- **Backend Service**: [`backend/services/fee_engine.py`](file:///C:/Users/takud/OneDrive/Documents/Projects/Fin/dalafin/backend/services/fee_engine.py)
- **Mobile Dart Utility**: [`mobile/lib/core/utils/tariff_calculator.dart`](file:///C:/Users/takud/OneDrive/Documents/Projects/Fin/dalafin/mobile/lib/core/utils/tariff_calculator.dart)
