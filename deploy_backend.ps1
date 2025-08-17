# Backend Deployment Script for aaPanel Ubuntu (PowerShell)
# Usage: .\deploy_backend.ps1 [-UploadOnly]

param(
    [switch]$UploadOnly
)

# Configuration
$SERVER_IP = "202.152.157.53"
$SSH_PORT = "2227"
$SSH_USER = "ssdi"
$REMOTE_PATH = "/www/wwwroot/backpinjam.unugha.ac.id"
$LOCAL_BACKEND = ".\backend"
$SSH_CONFIG = ".\ssh_config"

Write-Host "🚀 Starting Backend Deployment..." -ForegroundColor Green

# Check if backend directory exists
if (-not (Test-Path $LOCAL_BACKEND)) {
    Write-Host "❌ Backend directory not found: $LOCAL_BACKEND" -ForegroundColor Red
    exit 1
}

# Check if SSH config exists
if (-not (Test-Path $SSH_CONFIG)) {
    Write-Host "❌ SSH config not found: $SSH_CONFIG" -ForegroundColor Red
    exit 1
}

Write-Host "📦 Preparing backend files..." -ForegroundColor Yellow

# Create deployment package
Set-Location backend

# Remove development files
Write-Host "🧹 Cleaning development files..." -ForegroundColor Yellow
if (Test-Path "node_modules") { Remove-Item -Recurse -Force "node_modules" }
if (Test-Path "storage\logs\*") { Remove-Item -Force "storage\logs\*" }
if (Test-Path "bootstrap\cache\*") { Remove-Item -Force "bootstrap\cache\*" }
if (Test-Path ".env") { Remove-Item -Force ".env" }

# Create production .env
Write-Host "⚙️  Creating production environment..." -ForegroundColor Yellow
$envContent = @"
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
MAIL_FROM_NAME="`${APP_NAME}"

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

VITE_APP_NAME="`${APP_NAME}"
VITE_PUSHER_APP_KEY="`${PUSHER_APP_KEY}"
VITE_PUSHER_HOST="`${PUSHER_HOST}"
VITE_PUSHER_PORT="`${PUSHER_PORT}"
VITE_PUSHER_SCHEME="`${PUSHER_SCHEME}"
VITE_PUSHER_APP_CLUSTER="`${PUSHER_APP_CLUSTER}"

# Sanctum Configuration
SANCTUM_STATEFUL_DOMAINS=sipinjamku.unugha.ac.id
SESSION_DOMAIN=.unugha.ac.id

# CORS Configuration
CORS_ALLOWED_ORIGINS=https://sipinjamku.unugha.ac.id
CORS_ALLOWED_METHODS=GET,POST,PUT,DELETE,OPTIONS
CORS_ALLOWED_HEADERS=Content-Type,Authorization,X-Requested-With,X-XSRF-TOKEN
CORS_SUPPORTS_CREDENTIALS=true
"@

$envContent | Out-File -FilePath ".env" -Encoding UTF8

Set-Location ..

# Create archive using 7-Zip or tar (if available)
Write-Host "📦 Creating deployment archive..." -ForegroundColor Yellow

try {
    # Try using tar (Windows 10+)
    tar -czf backend-deploy.tar.gz -C backend .
    Write-Host "✅ Archive created using tar" -ForegroundColor Green
} catch {
    try {
        # Try using 7-Zip
        & "C:\Program Files\7-Zip\7z.exe" a -ttar backend-deploy.tar backend\*
        & "C:\Program Files\7-Zip\7z.exe" a -tgzip backend-deploy.tar.gz backend-deploy.tar
        Remove-Item backend-deploy.tar
        Write-Host "✅ Archive created using 7-Zip" -ForegroundColor Green
    } catch {
        Write-Host "❌ Could not create archive. Please install tar or 7-Zip" -ForegroundColor Red
        exit 1
    }
}

Write-Host "📤 Uploading to server..." -ForegroundColor Yellow

# Upload files using SCP
try {
    & scp -F $SSH_CONFIG backend-deploy.tar.gz "backend-server:$REMOTE_PATH/"
    Write-Host "✅ Upload completed" -ForegroundColor Green
} catch {
    Write-Host "❌ Upload failed. Check SSH connection and credentials" -ForegroundColor Red
    exit 1
}

if ($UploadOnly) {
    Write-Host "✅ Upload completed. Manual setup required on server." -ForegroundColor Green
    Write-Host "📋 Next steps:" -ForegroundColor Cyan
    Write-Host "   1. SSH to server: ssh -F ssh_config backend-server" -ForegroundColor White
    Write-Host "   2. Extract: tar -xzf backend-deploy.tar.gz" -ForegroundColor White
    Write-Host "   3. Run: composer install --no-dev --optimize-autoloader" -ForegroundColor White
    Write-Host "   4. Run: php artisan key:generate" -ForegroundColor White
    Write-Host "   5. Run: php artisan migrate --force" -ForegroundColor White
    exit 0
}

Write-Host "🔧 Setting up on server..." -ForegroundColor Yellow

# Create setup script for server
$setupScript = @"
set -e

echo "📁 Extracting files..."
cd $REMOTE_PATH
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
"@

# Execute setup commands on server
try {
    $setupScript | & ssh -F $SSH_CONFIG backend-server
    Write-Host "✅ Server setup completed" -ForegroundColor Green
} catch {
    Write-Host "❌ Server setup failed. Please run manual setup" -ForegroundColor Red
    Write-Host "📋 Manual setup commands:" -ForegroundColor Cyan
    Write-Host $setupScript -ForegroundColor White
}

Write-Host "🎉 Deployment successful!" -ForegroundColor Green
Write-Host "🌐 Backend URL: https://backpinjam.unugha.ac.id" -ForegroundColor Cyan
Write-Host "🧪 Test API: curl https://backpinjam.unugha.ac.id/sanctum/csrf-cookie" -ForegroundColor Cyan

# Cleanup
if (Test-Path "backend-deploy.tar.gz") {
    Remove-Item "backend-deploy.tar.gz"
}

Write-Host "✨ Deployment completed successfully!" -ForegroundColor Green