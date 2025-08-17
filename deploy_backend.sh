#!/bin/bash

# Backend Deployment Script for aaPanel Ubuntu
# Usage: ./deploy_backend.sh [--upload-only]

set -e

# Configuration
SERVER_IP="202.152.157.53"
SSH_PORT="2227"
SSH_USER="ssdi"
REMOTE_PATH="/www/wwwroot/backpinjam.unugha.ac.id"
LOCAL_BACKEND="./backend"
SSH_CONFIG="./ssh_config"

echo "🚀 Starting Backend Deployment..."

# Check if backend directory exists
if [ ! -d "$LOCAL_BACKEND" ]; then
    echo "❌ Backend directory not found: $LOCAL_BACKEND"
    exit 1
fi

# Check if SSH config exists
if [ ! -f "$SSH_CONFIG" ]; then
    echo "❌ SSH config not found: $SSH_CONFIG"
    exit 1
fi

echo "📦 Preparing backend files..."

# Create deployment package
cd backend

# Remove development files
echo "🧹 Cleaning development files..."
rm -rf node_modules
rm -rf storage/logs/*
rm -rf bootstrap/cache/*
rm -f .env

# Create production .env
echo "⚙️  Creating production environment..."
cat > .env << EOF
APP_NAME="Sistem Peminjaman UNUGHA"
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=https://backpinjam.unugha.ac.id

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=error

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=your_database_name
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password

BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120

MEMCACHED_HOST=127.0.0.1

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=smtp
MAIL_HOST=mailpit
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME="\${APP_NAME}"

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=
AWS_USE_PATH_STYLE_ENDPOINT=false

PUSHER_APP_ID=
PUSHER_APP_KEY=
PUSHER_APP_SECRET=
PUSHER_HOST=
PUSHER_PORT=443
PUSHER_SCHEME=https
PUSHER_APP_CLUSTER=mt1

VITE_APP_NAME="\${APP_NAME}"
VITE_PUSHER_APP_KEY="\${PUSHER_APP_KEY}"
VITE_PUSHER_HOST="\${PUSHER_HOST}"
VITE_PUSHER_PORT="\${PUSHER_PORT}"
VITE_PUSHER_SCHEME="\${PUSHER_SCHEME}"
VITE_PUSHER_APP_CLUSTER="\${PUSHER_APP_CLUSTER}"

# Sanctum Configuration
SANCTUM_STATEFUL_DOMAINS=sipinjamku.unugha.ac.id
SESSION_DOMAIN=.unugha.ac.id

# CORS Configuration
CORS_ALLOWED_ORIGINS=https://sipinjamku.unugha.ac.id
CORS_ALLOWED_METHODS=GET,POST,PUT,DELETE,OPTIONS
CORS_ALLOWED_HEADERS=Content-Type,Authorization,X-Requested-With,X-XSRF-TOKEN
CORS_SUPPORTS_CREDENTIALS=true
EOF

cd ..

# Create archive
echo "📦 Creating deployment archive..."
tar -czf backend-deploy.tar.gz -C backend .

echo "📤 Uploading to server..."

# Upload files
scp -F "$SSH_CONFIG" backend-deploy.tar.gz backend-server:"$REMOTE_PATH/"

if [ "$1" = "--upload-only" ]; then
    echo "✅ Upload completed. Manual setup required on server."
    echo "📋 Next steps:"
    echo "   1. SSH to server: ssh -F ssh_config backend-server"
    echo "   2. Extract: tar -xzf backend-deploy.tar.gz"
    echo "   3. Run: composer install --no-dev --optimize-autoloader"
    echo "   4. Run: php artisan key:generate"
    echo "   5. Run: php artisan migrate --force"
    exit 0
fi

echo "🔧 Setting up on server..."

# Execute setup commands on server
ssh -F "$SSH_CONFIG" backend-server << 'ENDSSH'
set -e

echo "📁 Extracting files..."
cd /home/username/public_html/backpinjam
tar -xzf backend-deploy.tar.gz
rm backend-deploy.tar.gz

echo "🔐 Setting permissions..."
chmod -R 755 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache

echo "📦 Installing dependencies..."
composer install --no-dev --optimize-autoloader

echo "🔑 Generating application key..."
php artisan key:generate --force

echo "🗄️  Running migrations..."
php artisan migrate --force

echo "⚡ Optimizing application..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "✅ Backend deployment completed!"
ENDSSH

echo "🎉 Deployment successful!"
echo "🌐 Backend URL: https://backpinjam.unugha.ac.id"
echo "🧪 Test API: curl https://backpinjam.unugha.ac.id/sanctum/csrf-cookie"

# Cleanup
rm -f backend-deploy.tar.gz

echo "✨ Deployment completed successfully!"