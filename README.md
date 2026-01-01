# Finance Tracker

A modern personal finance tracking application with AI-powered insights and impulse purchase prevention.

## Features

- 💰 **Expense Tracking**: Log daily expenses with categories
- 💵 **Income Management**: Track multiple income sources
- 🎯 **Financial Goals**: Set and monitor savings goals
- 🔥 **Streak Tracking**: Build healthy spending habits
- 🛡️ **Impulse Control**: Smart intervention before impulse purchases
- 📊 **AI Insights**: Real-time spending pattern analysis
- 📈 **Visual Reports**: Heat maps and trend analysis
- 📑 **Excel Reports**: Export detailed financial reports
- 🌙 **Daily Reflections**: Track financial decisions and learnings

## Tech Stack

**Backend:**
- FastAPI (Python)
- PostgreSQL
- SQLAlchemy ORM
- JWT Authentication
- Alembic Migrations

**Frontend:**
- React 18
- TypeScript
- Vite
- TailwindCSS
- Framer Motion
- React Router

## Deployment

See [DEPLOY.md](DEPLOY.md) for quick deployment guide or [DO_DEPLOYMENT.md](DO_DEPLOYMENT.md) for detailed Digital Ocean deployment instructions.

### Quick Deploy

```bash
./prepare-deploy.sh
```

## Local Development

### Backend

```bash
cd backend
docker-compose up -d
```

API will be available at `http://localhost:8000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend will be available at `http://localhost:5173`

## Environment Variables

### Backend (.env)

```env
DATABASE_URL=postgresql://user:password@localhost:5432/finance
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
CORS_ORIGINS=http://localhost:5173
```

### Frontend (.env)

```env
VITE_API_BASE_URL=http://localhost:8000
```

## API Documentation

Once deployed, visit `/docs` for interactive API documentation (Swagger UI).

## License

MIT

## Support

For deployment help, see [DO_DEPLOYMENT.md](DO_DEPLOYMENT.md)
