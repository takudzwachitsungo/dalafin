#!/bin/bash

# Pre-Deployment Verification Script
# Run this before deploying to production

echo "🔍 Running Pre-Deployment Checks..."
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Check 1: Environment files
echo "📋 Checking environment files..."
if [ ! -f "backend/.env" ]; then
    echo -e "${RED}❌ backend/.env not found${NC}"
    echo "   Run: cp backend/.env.example backend/.env"
    ERRORS=$((ERRORS+1))
else
    echo -e "${GREEN}✓${NC} backend/.env exists"
    
    # Check for default values
    if grep -q "your-secret-key-change-in-production" backend/.env; then
        echo -e "${YELLOW}⚠️  WARNING: Using default SECRET_KEY${NC}"
        WARNINGS=$((WARNINGS+1))
    fi
fi

if [ ! -f "frontend/.env" ]; then
    echo -e "${YELLOW}⚠️  frontend/.env not found (optional for development)${NC}"
    WARNINGS=$((WARNINGS+1))
else
    echo -e "${GREEN}✓${NC} frontend/.env exists"
fi

if [ ! -f "frontend/.env.production" ]; then
    echo -e "${RED}❌ frontend/.env.production not found${NC}"
    echo "   Run: cp frontend/.env.example frontend/.env.production"
    ERRORS=$((ERRORS+1))
else
    echo -e "${GREEN}✓${NC} frontend/.env.production exists"
    
    if grep -q "localhost" frontend/.env.production; then
        echo -e "${YELLOW}⚠️  WARNING: .env.production still points to localhost${NC}"
        WARNINGS=$((WARNINGS+1))
    fi
fi

echo ""

# Check 2: Backend health
echo "🏥 Checking backend health..."
cd backend

if docker-compose ps | grep -q "Up"; then
    echo -e "${GREEN}✓${NC} Docker containers running"
    
    # Check API health
    HEALTH=$(curl -s http://localhost:8000/health 2>/dev/null || echo "failed")
    if [[ $HEALTH == *"healthy"* ]]; then
        echo -e "${GREEN}✓${NC} API health check passed"
    else
        echo -e "${RED}❌ API health check failed${NC}"
        ERRORS=$((ERRORS+1))
    fi
else
    echo -e "${RED}❌ Docker containers not running${NC}"
    echo "   Run: docker-compose up -d"
    ERRORS=$((ERRORS+1))
fi

# Check migrations
echo ""
echo "🗄️  Checking database migrations..."
MIGRATION_CHECK=$(docker-compose exec -T api alembic current 2>/dev/null | grep -c "(head)" || echo "0")
if [ "$MIGRATION_CHECK" -gt "0" ]; then
    echo -e "${GREEN}✓${NC} All migrations applied"
else
    echo -e "${RED}❌ Migrations not up to date${NC}"
    echo "   Run: docker-compose exec api alembic upgrade head"
    ERRORS=$((ERRORS+1))
fi

cd ..

echo ""

# Check 3: Frontend build
echo "🎨 Checking frontend build..."
cd frontend

if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} node_modules exists"
else
    echo -e "${RED}❌ node_modules not found${NC}"
    echo "   Run: npm install"
    ERRORS=$((ERRORS+1))
fi

# Try to build
echo "   Building frontend..."
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Frontend builds successfully"
    if [ -d "dist" ]; then
        echo -e "${GREEN}✓${NC} dist folder created"
    fi
else
    echo -e "${RED}❌ Frontend build failed${NC}"
    echo "   Run: npm run build (and check errors)"
    ERRORS=$((ERRORS+1))
fi

cd ..

echo ""

# Check 4: Git status
echo "📦 Checking git status..."
if git rev-parse --git-dir > /dev/null 2>&1; then
    if git diff-index --quiet HEAD -- 2>/dev/null; then
        echo -e "${GREEN}✓${NC} No uncommitted changes"
    else
        echo -e "${YELLOW}⚠️  WARNING: You have uncommitted changes${NC}"
        WARNINGS=$((WARNINGS+1))
    fi
    
    # Check if .env files are tracked
    if git ls-files | grep -q "\.env$"; then
        echo -e "${RED}❌ .env file is tracked in git!${NC}"
        echo "   Run: git rm --cached backend/.env frontend/.env"
        ERRORS=$((ERRORS+1))
    else
        echo -e "${GREEN}✓${NC} .env files not tracked in git"
    fi
else
    echo -e "${YELLOW}⚠️  Not a git repository${NC}"
    WARNINGS=$((WARNINGS+1))
fi

echo ""

# Check 5: Dependencies
echo "📚 Checking for security vulnerabilities..."
cd frontend
NPM_AUDIT=$(npm audit --production 2>/dev/null | grep -c "found 0 vulnerabilities" || echo "0")
if [ "$NPM_AUDIT" -gt "0" ]; then
    echo -e "${GREEN}✓${NC} No npm vulnerabilities found"
else
    echo -e "${YELLOW}⚠️  WARNING: npm vulnerabilities detected${NC}"
    echo "   Run: npm audit fix"
    WARNINGS=$((WARNINGS+1))
fi
cd ..

echo ""
echo "═══════════════════════════════════════════════════"
echo ""

# Summary
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed! Ready for deployment.${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  $WARNINGS warning(s) found. Review before deploying.${NC}"
    exit 0
else
    echo -e "${RED}❌ $ERRORS error(s) and $WARNINGS warning(s) found.${NC}"
    echo -e "${RED}Fix errors before deploying!${NC}"
    exit 1
fi
