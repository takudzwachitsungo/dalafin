# 🚀 Quick Deploy to Digital Ocean

## Option 1: One-Click Deploy (Easiest)

### Step 1: Prepare Your App

```bash
./prepare-deploy.sh
```

This will:
- Check all prerequisites
- Test builds
- Generate a secure SECRET_KEY
- Verify configuration

### Step 2: Push to GitHub

```bash
git add .
git commit -m "Initial deployment"
git remote add origin https://github.com/YOUR_USERNAME/finance-tracker.git
git push -u origin main
```

### Step 3: Deploy on Digital Ocean

1. Go to: https://cloud.digitalocean.com/apps/new
2. Connect your GitHub repo
3. Follow the configuration in `DO_DEPLOYMENT.md`

**Estimated time:** 15 minutes  
**Cost:** ~$22/month (dev) or ~$40/month (production)

---

## Option 2: Deploy via CLI

```bash
# Install doctl
brew install doctl

# Authenticate
doctl auth init

# Update .do/app.yaml with your GitHub repo
# Then deploy:
doctl apps create --spec .do/app.yaml
```

---

## What You Get

- ✅ **Backend API**: FastAPI with PostgreSQL
- ✅ **Frontend**: React/Vite static site  
- ✅ **Database**: Managed PostgreSQL
- ✅ **HTTPS**: Automatic SSL certificates
- ✅ **Auto-deploy**: Push to deploy
- ✅ **Monitoring**: Built-in health checks
- ✅ **Backups**: Automatic database backups

---

## Need Help?

Read the full guide: `DO_DEPLOYMENT.md`

---

## Post-Deployment

After deployment, update these:

1. **CORS_ORIGINS** in backend env vars with your frontend URL
2. **VITE_API_BASE_URL** in frontend env vars with your backend URL
3. Redeploy to apply changes

Test your deployment at your assigned URLs!
