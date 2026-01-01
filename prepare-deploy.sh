#!/bin/bash

# Digital Ocean Deployment Preparation Script
# This script helps prepare your app for Digital Ocean deployment

set -e

echo "🚀 Digital Ocean Deployment Preparation"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[⚠]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Check prerequisites
echo "📋 Checking Prerequisites..."
echo ""

if command_exists git; then
    print_success "Git is installed"
else
    print_error "Git is not installed. Please install git first."
    exit 1
fi

if command_exists docker; then
    print_success "Docker is installed"
else
    print_warning "Docker is not installed (optional for local testing)"
fi

if command_exists doctl; then
    print_success "doctl CLI is installed"
else
    print_warning "doctl CLI is not installed (optional, but recommended)"
    echo "          Install with: brew install doctl"
fi

echo ""

# Check if git repo is initialized
if [ -d .git ]; then
    print_success "Git repository initialized"
else
    print_warning "Git repository not initialized"
    read -p "Initialize git repository? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git init
        print_success "Git repository initialized"
    fi
fi

echo ""

# Generate secure secret key
echo "🔐 Generating Secure Secret Key..."
SECRET_KEY=$(openssl rand -hex 32)
print_success "Generated secure secret key: $SECRET_KEY"
echo ""
print_warning "Save this key securely! You'll need it for Digital Ocean environment variables."
echo ""

# Check backend files
echo "🔍 Checking Backend Configuration..."

if [ -f "backend/requirements.txt" ]; then
    print_success "backend/requirements.txt exists"
else
    print_error "backend/requirements.txt not found"
fi

if [ -f "backend/Dockerfile" ]; then
    print_success "backend/Dockerfile exists"
else
    print_error "backend/Dockerfile not found"
fi

if [ -f "backend/alembic.ini" ]; then
    print_success "backend/alembic.ini exists"
else
    print_warning "backend/alembic.ini not found"
fi

echo ""

# Check frontend files
echo "🎨 Checking Frontend Configuration..."

if [ -f "frontend/package.json" ]; then
    print_success "frontend/package.json exists"
else
    print_error "frontend/package.json not found"
fi

if [ -f "frontend/vite.config.ts" ]; then
    print_success "frontend/vite.config.ts exists"
else
    print_error "frontend/vite.config.ts not found"
fi

echo ""

# Test backend build
echo "🏗️  Testing Backend Docker Build..."
cd backend
if docker build -t finance-tracker-backend-test . > /dev/null 2>&1; then
    print_success "Backend Docker build successful"
    docker rmi finance-tracker-backend-test > /dev/null 2>&1
else
    print_error "Backend Docker build failed"
    print_warning "Fix backend build issues before deploying"
fi
cd ..

echo ""

# Test frontend build
echo "🏗️  Testing Frontend Build..."
cd frontend
if [ ! -d "node_modules" ]; then
    print_status "Installing frontend dependencies..."
    npm install > /dev/null 2>&1
fi

if npm run build > /dev/null 2>&1; then
    print_success "Frontend build successful"
    rm -rf dist
else
    print_error "Frontend build failed"
    print_warning "Fix frontend build issues before deploying"
fi
cd ..

echo ""

# Create .gitignore if it doesn't exist
if [ ! -f .gitignore ]; then
    print_status "Creating .gitignore..."
    cat > .gitignore << 'EOF'
# Environment files
.env
.env.local
.env.production
.env.*.local

# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
venv/
env/
ENV/

# Node
node_modules/
dist/
build/
.cache/

# IDEs
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Database
*.db
*.sqlite
*.sqlite3

# Logs
*.log
logs/

# Docker
docker-compose.override.yml
EOF
    print_success ".gitignore created"
fi

echo ""
echo "✅ Pre-deployment checks complete!"
echo ""
echo "📝 Next Steps:"
echo ""
echo "1. Push your code to GitHub:"
echo "   ${BLUE}git add .${NC}"
echo "   ${BLUE}git commit -m \"Prepare for Digital Ocean deployment\"${NC}"
echo "   ${BLUE}git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git${NC}"
echo "   ${BLUE}git push -u origin main${NC}"
echo ""
echo "2. Save your secret key:"
echo "   ${YELLOW}SECRET_KEY=${SECRET_KEY}${NC}"
echo ""
echo "3. Deploy to Digital Ocean:"
echo "   - Via UI: https://cloud.digitalocean.com/apps/new"
echo "   - Via CLI: ${BLUE}doctl apps create --spec .do/app.yaml${NC}"
echo ""
echo "4. Read the full deployment guide:"
echo "   ${BLUE}cat DO_DEPLOYMENT.md${NC}"
echo ""
echo "🎉 Good luck with your deployment!"
