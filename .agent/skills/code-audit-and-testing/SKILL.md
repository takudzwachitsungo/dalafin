---
name: code-audit-and-testing
description: Guidelines for code quality audits, static analysis, unit/integration testing with Pytest & Vitest, security reviews, and linting.
---

# Code Audit & Testing Standards

## 1. Test Automation & Coverage
- **Backend Testing (Pytest + HTTPX)**:
  - Unit tests for financial formulas (rollover calculation, work-hour conversions).
  - Integration tests for FastAPI endpoints using `TestClient` or `AsyncClient`.
  - Mock external services (Minimax API calls) to ensure reliable, fast test runs.
- **Frontend Testing (Vitest + React Testing Library / Playwright)**:
  - Unit test critical hooks (`AppContext`, calculation helpers).
  - Component tests for modal workflows (`EmergencyPause`, `BeforeYouBuyCalculator`).

## 2. Quality & Security Auditing Checklist
- **No Swallowed Exceptions**: Never use bare `except:` or empty `catch` blocks without logging and handling.
- **Input Sanitation**: Validate all path/query params and JSON payloads via Pydantic/Zod.
- **Dependency Audit**: Routinely check and resolve vulnerabilities via `npm audit` and `pip-audit`.
- **Linting & Formatting**: Enforce strict TypeScript types, ESLint rules, and Python Black/Ruff formatting.
