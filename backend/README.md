# Finance App Backend

Behavior-driven personal finance application built with FastAPI, PostgreSQL, and Docker.

## Quick Start

1. **Copy environment file**
   ```bash
   cp .env.example .env
   ```

2. **Update `.env` with your credentials**
   - Set a secure `SECRET_KEY`
   - Add your `MINIMAX_API_KEY`

3. **Start with Docker**
   ```bash
   docker-compose up --build
   ```

4. **Run database migrations**
   ```bash
   docker-compose exec api alembic upgrade head
   ```

5. **Access the API**
   - API: http://localhost:8000
   - Docs: http://localhost:8000/api/docs
   - Health: http://localhost:8000/health

## Project Structure

```
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── endpoints/   # API route handlers
│   │       └── router.py
│   ├── core/
│   │   ├── config.py        # Settings
│   │   ├── database.py      # DB connection
│   │   └── security.py      # JWT & password hashing
│   ├── models/              # SQLAlchemy models
│   ├── schemas/             # Pydantic schemas
│   ├── services/            # Business logic
│   └── main.py              # FastAPI app
├── alembic/                 # Database migrations
├── docker-compose.yml
├── Dockerfile
└── requirements.txt
```

## Development

**Without Docker:**
```bash
# Install dependencies
pip install -r requirements.txt

# Run database (needs PostgreSQL & Redis)
# Update DATABASE_URL and REDIS_URL in .env

# Run migrations
alembic upgrade head

# Start server
uvicorn app.main:app --reload
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/auth/me` - Get current user

### Coming Soon
- Transactions CRUD
- Reflections tracking
- Goals management
- Budget calculations
- Streak tracking
- Wishlist with cooldowns
- Peer benchmarks
- LLM insights via Minimax
