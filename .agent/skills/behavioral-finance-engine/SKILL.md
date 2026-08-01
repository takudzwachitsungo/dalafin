---
name: behavioral-finance-engine
description: Rules, formulas, and behavioral intervention mechanisms powering Dalafin's impulse control, budget rollover, and goal tracking.
---

# Behavioral Finance Engine Specification

## 1. Mathematical Formulas & Rules
- **Daily Budget Limit**:
  $$\text{Daily Limit} = \frac{\text{Monthly Income} - \text{Fixed Expenses}}{30}$$
- **Rollover Bonus**:
  $$\text{Unused Today} = \max(0, \text{Daily Limit} - \text{Spent Today})$$
  $$\text{Rollover Budget} = \min(3 \times \text{Daily Limit}, \text{Rollover Budget} + \text{Unused Today})$$
- **Work Hour Equivalent**:
  $$\text{Hourly Rate} = \frac{\text{Monthly Income}}{160}$$
  $$\text{Hours Required} = \frac{\text{Purchase Amount}}{\text{Hourly Rate}}$$
- **Investment Opportunity Cost (5-Year Projection at 7% p.a.)**:
  $$\text{Future Value} = \text{Amount} \times (1 + 0.07)^5$$

## 2. Behavioral Intervention Thresholds
- **Emergency Pause Trigger**: Threshold = $\$100.00$. Mandatory 24-hour waiting countdown or $\ge 20$ character written justification override.
- **Wishlist Cooldown Scaling**:
  - Price $\le \$50$: 14 days
  - Price $\$50.01 - \$150$: 30 days
  - Price $> \$150$: 45 days
