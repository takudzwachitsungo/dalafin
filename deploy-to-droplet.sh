#!/bin/bash

# Deployment script for Digital Ocean Droplet
# Run this script to set up and deploy the finance tracker app

set -e

DROPLET_IP="167.99.195.220"
SSH_KEY="~/.ssh/dalafin_droplet"

echo "🚀 Deploying Finance Tracker to Digital Ocean Droplet"
echo "======================================================"
echo ""

# Update system and install dependencies
echo "📦 Installing system dependencies..."
ssh -i $SSH_KEY root@$DROPLET_IP << 'ENDSSH'
# Update system
apt-get update
apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
rm get-docker.sh

# Install Docker Compose
apt-get install -y docker-compose-plugin

# Install Git
apt-get install -y git

# Create app directory
mkdir -p /var/www/dalafin
ENDSSH

echo "✅ System dependencies installed"
echo ""

# Clone repository
echo "📥 Cloning repository..."
ssh -i $SSH_KEY root@$DROPLET_IP << 'ENDSSH'
cd /var/www/dalafin
if [ -d ".git" ]; then
    git pull origin main
else
    git clone https://github.com/takudzwachitsungo/dalafin.git .
fi
ENDSSH

echo "✅ Repository cloned"
echo ""

# Generate secure keys
echo "🔐 Generating secure keys..."
SECRET_KEY=$(openssl rand -hex 32)
POSTGRES_PASSWORD=$(openssl rand -hex 16)

# Create environment file
echo "📝 Creating environment files..."
ssh -i $SSH_KEY root@$DROPLET_IP << ENDSSH
cat > /var/www/dalafin/backend/.env << 'EOF'
# Database
POSTGRES_USER=finance_user
POSTGRES_PASSWORD=$POSTGRES_PASSWORD
POSTGRES_DB=finance_db

# API
SECRET_KEY=$SECRET_KEY
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=False
CORS_ORIGINS=http://167.99.195.220,https://167.99.195.220

# Database URL
DATABASE_URL=postgresql://finance_user:$POSTGRES_PASSWORD@db:5432/finance_db
EOF
ENDSSH

echo "✅ Environment configured"
echo ""

# Start the application
echo "🐳 Starting Docker containers..."
ssh -i $SSH_KEY root@$DROPLET_IP << 'ENDSSH'
cd /var/www/dalafin/backend
docker compose -f docker-compose.prod.yml up -d
ENDSSH

echo "✅ Backend started"
echo ""

# Wait for containers to be ready
echo "⏳ Waiting for services to start..."
sleep 15

# Check if containers are running
echo "🔍 Checking container status..."
ssh -i $SSH_KEY root@$DROPLET_IP << 'ENDSSH'
cd /var/www/dalafin/backend
docker compose -f docker-compose.prod.yml ps
ENDSSH

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Your application is now running at:"
echo "   Backend API: http://167.99.195.220:8000"
echo "   API Docs: http://167.99.195.220:8000/docs"
echo "   Health Check: http://167.99.195.220:8000/api/v1/health"
echo ""
echo "🔑 Credentials saved on droplet at:"
echo "   /var/www/dalafin/backend/.env"
echo ""
echo "📊 To view logs:"
echo "   ssh -i ~/.ssh/dalafin_droplet root@167.99.195.220"
echo "   cd /var/www/dalafin/backend"
echo "   docker compose -f docker-compose.prod.yml logs -f"
echo ""
echo "🎉 Next steps:"
echo "   1. Set up Nginx reverse proxy for HTTPS"
echo "   2. Configure domain name"
echo "   3. Deploy frontend"
echo ""
ENDSSH
