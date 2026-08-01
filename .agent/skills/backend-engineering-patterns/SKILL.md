---
name: backend-engineering-patterns
description: Advanced backend system architecture, asynchronous processing, database indexing, caching strategies, rate limiting, and clean API design.
---

# Backend Engineering & System Architecture Standards

## 1. Data Integrity & Transactions
- **ACID Safety**: Ensure database mutations across related entities (e.g. updating user balance, creating transaction, updating category spent) execute inside explicit database transactions.
- **Concurrency Control**: Use optimistic locking or select-for-update where race conditions could occur.

## 2. API Design & Middleware
- **Rate Limiting**: Protect authentication and expensive LLM endpoints using sliding-window rate limiters (e.g., `slowapi` or Redis token buckets).
- **Asynchronous Task Processing**: Delegate heavy or long-running work (e.g. Excel/PDF report rendering, batch background analysis) to background tasks or queue workers (Celery/ARQ/FastAPI BackgroundTasks).
- **Caching**: Utilize Redis for volatile data like user session validation, daily aggregated metrics, or external LLM response caching.
