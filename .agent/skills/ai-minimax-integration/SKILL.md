---
name: ai-minimax-integration
description: Guidelines for Minimax LLM prompt engineering, response parsing, fallback handling, and spending/reflection analysis services.
---

# Minimax AI Integration & Prompting Guidelines

## 1. Core Services & Endpoints
- **Service Class**: `MinimaxService` in `backend/services/llm.py` using model `abab5.5-chat`.
- **Primary Capabilities**:
  1. `categorize_transaction(description, amount)`: Predicts category (`Food & Dining`, `Entertainment`, `Shopping`, `Transport`, `Bills & Utilities`, `Health & Fitness`, `Other`).
  2. `analyze_spending_pattern(spending_data)`: Returns concise, non-judgmental spending feedback under 100 words.
  3. `analyze_reflection(reflection_text, regret_purchase)`: Extracts emotional triggers and actionable behavioral suggestions.
  4. `generate_impulse_question(item_name, price)`: Generates mindfulness reflection questions under 20 words.

## 2. Fallback & Reliability Design
- Every LLM call MUST be wrapped in a `try...except` block with sensible fallbacks (e.g. defaulting to `"Other"` category or non-blocking standard messages).
- Set explicit timeouts (30.0s max) to prevent blocking HTTP handler threads.
