# Digital Ocean Deployment Guide

This guide covers deploying the Finance Tracker app to Digital Ocean using App Platform.

## Prerequisites

1. **Digital Ocean Account**: Sign up at [digitalocean.com](https://digitalocean.com)
2. **GitHub Repository**: Your code must be in a GitHub repository
3. **doctl CLI** (optional but recommended): Install from [digitalocean.com/docs/apis-clis/doctl](https://docs.digitalocean.com/reference/doctl/)

## Deployment Options

### Option 1: Deploy via App Platform UI (Easiest)

#### Step 1: Push Code to GitHub

```bash
# Initialize git if not already done
cd "/Users/ggg/Development/untitled folder 2"
git init
git add .
git commit -m "Initial commit"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

#### Step 2: Create App on Digital Ocean

1. Go to [cloud.digitalocean.com/apps](https://cloud.digitalocean.com/apps)
2. Click **"Create App"**
3. Connect your **GitHub repository**
4. Select your repository and branch (main)

#### Step 3: Configure Database

1. In the App Platform setup, click **"Add Resource"**
2. Select **"Database"**
3. Choose **PostgreSQL 15**
4. Name it: `finance-db`
5. Select plan: **Basic ($15/month)** or **Dev Database ($7/month for testing)**

#### Step 4: Configure Backend API

1. Digital Ocean will auto-detect the backend
2. If not, click **"Add Resource" → "Service"**
3. Configure:
   - **Name**: `api`
   - **Source Directory**: `backend`
   - **Dockerfile Path**: `backend/Dockerfile`
   - **HTTP Port**: `8000`
   - **Build Command**: (leave default)
   - **Run Command**: 
     ```bash
     alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000
     ```

4. Add Environment Variables:
   ```
   DATABASE_URL=${finance-db.DATABASE_URL}
   SECRET_KEY=YOUR_SUPER_SECRET_KEY_HERE_GENERATE_WITH_openssl_rand_hex_32
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   DEBUG=False
   CORS_ORIGINS=https://YOUR-FRONTEND-APP.ondigitalocean.app
   ```

5. Configure Health Check:
   - **Path**: `/api/v1/health`
   - **Initial Delay**: 20 seconds
   - **Period**: 10 seconds

#### Step 5: Configure Frontend

1. Click **"Add Resource" → "Static Site"**
2. Configure:
   - **Name**: `frontend`
   - **Source Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Output Directory**: `dist`

3. Add Environment Variables:
   ```
   VITE_API_BASE_URL=https://api-YOUR-APP-NAME.ondigitalocean.app
   ```

4. Configure Routes:
   - **Catchall Document**: `index.html` (for React Router)

#### Step 6: Review and Deploy

1. Review all settings
2. Click **"Create Resources"**
3. Wait for deployment (5-10 minutes)
4. Digital Ocean will provide URLs for your app

---

### Option 2: Deploy via doctl CLI

#### Step 1: Install doctl

```bash
# macOS
brew install doctl

# Authenticate
doctl auth init
```

#### Step 2: Generate Secret Key

```bash
# Generate a secure secret key
openssl rand -hex 32
```

Copy the output and save it for the next step.

#### Step 3: Update Configuration

Edit `.do/app.yaml` and replace:
- `YOUR_GITHUB_USERNAME/YOUR_REPO_NAME` with your GitHub repo
- `YOUR_FRONTEND_URL` with your frontend URL (you'll get this after first deploy)
- `SECRET_KEY` value with the generated key from Step 2

#### Step 4: Create the App

```bash
cd "/Users/ggg/Development/untitled folder 2"

# Create the app
doctl apps create --spec .do/app.yaml

# Get the app ID
doctl apps list
```

#### Step 5: Update Frontend URL

After the first deployment:

1. Get your API URL:
   ```bash
   doctl apps list
   ```

2. Update `.do/app.yaml` with the actual URLs

3. Redeploy:
   ```bash
   doctl apps update YOUR_APP_ID --spec .do/app.yaml
   ```

---

## Post-Deployment Configuration

### 1. Update CORS Origins

After getting your frontend URL, update the backend environment variable:

```bash
CORS_ORIGINS=https://your-actual-frontend-url.ondigitalocean.app,https://your-custom-domain.com
```

### 2. Set Up Custom Domain (Optional)

1. Go to your App in Digital Ocean
2. Click **Settings → Domains**
3. Add your custom domain
4. Update DNS records as instructed

### 3. Enable Automatic Deployments

In App Platform:
- Go to **Settings**
- Enable **"Autodeploy"** on push to main branch

---

## Environment Variables Reference

### Backend (Required)

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection | `${finance-db.DATABASE_URL}` (auto) |
| `SECRET_KEY` | JWT signing key | Generate with `openssl rand -hex 32` |
| `ALGORITHM` | JWT algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiry | `30` |
| `CORS_ORIGINS` | Allowed origins | Your frontend URL |
| `DEBUG` | Debug mode | `False` |

### Frontend (Required)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API URL | `https://api-yourapp.ondigitalocean.app` |

---

## Health Check Endpoint

Create a health check endpoint for Digital Ocean monitoring:

The backend already should have this at `/api/v1/health` or add it:

```python
# backend/app/api/v1/endpoints/health.py
from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
async def health_check():
    return {"status": "healthy"}
```

---

## Monitoring and Logs

### View Logs

```bash
# Get app info
doctl apps list

# View logs
doctl apps logs YOUR_APP_ID --type run

# Follow logs in real-time
doctl apps logs YOUR_APP_ID --type run --follow
```

### Via UI

1. Go to your App in Digital Ocean
2. Click on the component (api/frontend)
3. View **Runtime Logs**

---

## Troubleshooting

### Database Connection Issues

1. Check `DATABASE_URL` is set correctly
2. Verify database is running: `doctl databases list`
3. Check app logs for connection errors

### CORS Errors

1. Ensure `CORS_ORIGINS` includes your frontend URL
2. Format: `https://your-frontend.ondigitalocean.app` (no trailing slash)
3. Multiple origins: comma-separated

### Build Failures

**Backend:**
- Check `requirements.txt` is complete
- Verify Dockerfile syntax
- Check Python version compatibility

**Frontend:**
- Ensure `package.json` has all dependencies
- Verify build command: `npm run build`
- Check environment variables are set

### Migration Issues

If migrations fail:

```bash
# SSH into the backend container (via Digital Ocean console)
# Then run:
alembic upgrade head
```

---

## Scaling

### Vertical Scaling (More Power)

1. Go to App Settings
2. Select component (api/frontend)
3. Choose larger instance size

### Horizontal Scaling (More Instances)

1. Go to App Settings
2. Increase **Instance Count**
3. Note: Requires session management for backend

---

## Cost Estimation

**Basic Setup (~$22/month):**
- Database (Dev): $7/month
- Backend API (Basic): $5/month
- Frontend (Static): $0 (free tier) or $3/month
- Bandwidth: $5-10/month

**Production Setup (~$40/month):**
- Database (Basic): $15/month
- Backend API (Professional): $12/month
- Frontend (Static): $3/month
- Bandwidth: $10-15/month

---

## Backup and Recovery

### Database Backups

Digital Ocean automatically backs up managed databases:
- Daily backups retained for 7 days (Dev plan)
- Daily backups retained for 30 days (Basic+ plans)

### Manual Backup

```bash
# List databases
doctl databases list

# Create backup
doctl databases backups list YOUR_DB_ID
```

---

## Security Best Practices

1. **Always use HTTPS** (enabled by default on App Platform)
2. **Rotate SECRET_KEY** regularly
3. **Use environment variables** for all secrets
4. **Enable 2FA** on Digital Ocean account
5. **Restrict database access** to app only
6. **Monitor access logs** regularly

---

## Next Steps

After deployment:

1. ✅ Test all API endpoints
2. ✅ Verify database connectivity
3. ✅ Test user registration/login
4. ✅ Check CORS is working
5. ✅ Monitor logs for errors
6. ✅ Set up custom domain
7. ✅ Configure monitoring alerts
8. ✅ Set up backup strategy

---

## Support Resources

- [Digital Ocean App Platform Docs](https://docs.digitalocean.com/products/app-platform/)
- [doctl Reference](https://docs.digitalocean.com/reference/doctl/)
- [Community Forums](https://www.digitalocean.com/community/)

---

## Quick Deploy Checklist

- [ ] Code pushed to GitHub
- [ ] `.env` files created with secure keys
- [ ] Database created on Digital Ocean
- [ ] Backend service configured
- [ ] Frontend static site configured
- [ ] Environment variables set
- [ ] CORS origins updated
- [ ] Health check endpoint working
- [ ] First deployment successful
- [ ] API URL updated in frontend env
- [ ] Frontend redeployed with correct API URL
- [ ] Test complete user flow
- [ ] Monitoring enabled
