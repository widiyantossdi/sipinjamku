# 🚀 Backend Deployment Guide - Laravel ke aaPanel Ubuntu

## 📋 Server Information
- **IP Address**: 202.152.157.53
- **SSH Port**: 2227
- **Target Domain**: backpinjam.unugha.ac.id
- **Platform**: aaPanel/Ubuntu Server

## 🔐 SSH Configuration

### 1. SSH Config File
File konfigurasi SSH telah dibuat: `ssh_config`

**Cara menggunakan:**
```bash
# Connect menggunakan config file
ssh -F ssh_config backend-server

# Atau copy ke ~/.ssh/config untuk global access
cp ssh_config ~/.ssh/config
ssh backend-server
```

### 2. Generate SSH Key (jika belum ada)
```bash
# Generate new SSH key
ssh-keygen -t ed25519 -C "your-email@example.com"

# Copy public key to server
ssh-copy-id -i ~/.ssh/id_ed25519.pub -p 2227 root@202.152.157.53
```

## 📦 Backend Deployment Steps

### 1. Persiapan File Laravel
```bash
# Compress backend folder
tar -czf backend.tar.gz -C backend .

# Upload ke server
scp -P 2227 backend.tar.gz ssdi@202.152.157.53/www/wwwroot/backpinjam.unugha.ac.id/
```

### 2. Server Setup
```bash
# Connect to server
ssh -F ssh_config backend-server

# Extract files
cd /path/to/backpinjam.unugha.ac.id
tar -xzf backend.tar.gz

# Set permissions
chmod -R 755 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

### 3. Environment Configuration
```bash
# Copy environment file
cp .env.example .env

# Edit .env file
nano .env
```

**Required .env settings:**
```env
APP_NAME="Sistem Peminjaman UNUGHA"
APP_ENV=production
APP_KEY=base64:your-app-key-here
APP_DEBUG=false
APP_URL=https://backpinjam.unugha.ac.id

# Database (sesuaikan dengan cPanel)
DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=your_database_name
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password

# CORS untuk frontend
SANCTUM_STATEFUL_DOMAINS=sipinjamku.unugha.ac.id
SESSION_DOMAIN=.unugha.ac.id

# Session & Cache
SESSION_DRIVER=file
CACHE_DRIVER=file
QUEUE_CONNECTION=sync
```

### 4. Laravel Setup
```bash
# Install dependencies
composer install --optimize-autoloader --no-dev

# Generate application key
php artisan key:generate

# Run migrations
php artisan migrate --force

# Seed database (optional)
php artisan db:seed --force

# Clear and cache config
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### 5. Web Server Configuration

**Apache .htaccess** (di public folder):
```apache
<IfModule mod_rewrite.c>
    <IfModule mod_negotiation.c>
        Options -MultiViews -Indexes
    </IfModule>

    RewriteEngine On

    # Handle Authorization Header
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

    # Redirect Trailing Slashes If Not A Folder...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_URI} (.+)/$
    RewriteRule ^ %1 [L,R=301]

    # Send Requests To Front Controller...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>
```

## 🔧 cPanel Configuration

### 1. Domain Setup
- Point domain `backpinjam.unugha.ac.id` ke folder Laravel
- Set document root ke `/public` folder

### 2. PHP Configuration
- PHP Version: 8.1 atau 8.2
- Enable extensions: mbstring, openssl, pdo, tokenizer, xml, ctype, json

### 3. Database Setup
- Create MySQL database via cPanel
- Create database user dengan privileges
- Update .env dengan credentials

### 4. SSL Certificate
- Enable SSL via cPanel
- Force HTTPS redirect

## 🧪 Testing Backend

### 1. API Endpoints Test
```bash
# Test CSRF endpoint
curl https://backpinjam.unugha.ac.id/sanctum/csrf-cookie

# Test login endpoint
curl -X POST https://backpinjam.unugha.ac.id/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password"}'
```

### 2. CORS Verification
```bash
# Test CORS headers
curl -H "Origin: https://sipinjamku.unugha.ac.id" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: X-Requested-With" \
  -X OPTIONS \
  https://backpinjam.unugha.ac.id/api/login
```

## 🐛 Troubleshooting

### Common Issues
1. **Permission Errors**: `chmod -R 755 storage bootstrap/cache`
2. **Database Connection**: Check .env credentials
3. **CORS Issues**: Verify SANCTUM_STATEFUL_DOMAINS
4. **SSL Problems**: Ensure certificate is active

### Log Files
```bash
# Laravel logs
tail -f storage/logs/laravel.log

# Apache/Nginx logs
tail -f /var/log/apache2/error.log
```

## 📞 Next Steps

1. ✅ SSH Config created
2. 🔄 Upload Laravel files
3. 🔄 Configure environment
4. 🔄 Setup database
5. 🔄 Test API endpoints
6. 🔄 Configure CORS
7. 🔄 SSL setup

---
**Ready for Deployment**: Backend configuration prepared ✅  
**SSH**: `ssh -F ssh_config backend-server`  
**Target**: https://backpinjam.unugha.ac.id