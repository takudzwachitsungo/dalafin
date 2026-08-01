---
name: fastapi-sqlalchemy-guide
description: Architectural standards, FastAPI router design, SQLAlchemy ORM patterns, Pydantic schemas, and security practices for the Dalafin backend.
---

# FastAPI & SQLAlchemy Backend Architecture Guide

## 1. API Route Conventions
- **RESTful Endpoints**: Group endpoints logically under `/api/v1` or modular router paths (`auth.py`, `transactions.py`, `budget.py`, `insights.py`, `reports.py`).
- **Dependencies**: Use FastAPI dependency injection (`Depends(get_db)`, `Depends(get_current_user)`) for DB sessions and JWT auth.
- **Error Handling**: Raise explicit `HTTPException` with informative error status codes (`400 Bad Request`, `401 Unauthorized`, `404 Not Found`, `422 Unprocessable Entity`).

## 2. SQLAlchemy & Database Performance
- **Models**: Inherit from `database.Base`. Always include proper indexes on foreign keys (`user_id`), date fields, and query filters (`category`, `status`).
- **Session Management**: Utilize session contexts safely and avoid keeping transactions open across external HTTP or LLM API calls.
- **Pydantic Validation**: Keep request/response DTO schemas strictly defined in `schemas.py` using `from_attributes = True` for ORM compatibility.

## 3. Security Guidelines
- **Auth**: Passwords hashed using bcrypt/argon2. JWT tokens signed with `SECRET_KEY` and configurable expiry.
- **CORS**: Explicitly configure `CORS_ORIGINS` in `config.py` for frontend origin matching.
