# 🚀 Backend Deployment Guide - Laravel ke aaPanel Ubuntu

Panduan lengkap untuk deploy backend Laravel ke server aaPanel Ubuntu dengan konfigurasi yang tepat.

## 📋 Server Information
- **Server IP**: 202.152.157.53
- **SSH Port**: 2227
- **Control Panel**: aaPanel
- **OS**: Ubuntu
- **Domain**: backpinjam.unugha.ac.id
- **Web Server**: Nginx (recommended) / Apache
- **PHP Version**: 8.1+ (recommended)
- **SSL**: Required (Let's Encrypt)

## 🔐 SSH Configuration

File `ssh_config` sudah dikonfigurasi untuk server aaPanel:

```bash
# Koneksi sebagai root (untuk setup awal)
ssh -F ssh_config backend-server

# Koneksi sebagai user ssdi
ssh -F ssh_config backend-aapanel

# Alias cepat
ssh -F ssh_config backend
```

### Contoh Penggunaan SSH:
```bash
# Test koneksi
ssh -F ssh_config backend-server "whoami && pwd"

# Upload file
scp -F ssh_config file.txt backend-server:/www/wwwroot/backpinjam.unugha.ac.id/
scp -F ssh_config file.txt backend-server:/www/wwwroot/backpinjam.unugha.ac.id/
# Sync folder
rsync -avz -e "ssh -F ssh_config" ./backend/ backend-server:/www/wwwroot/backpinjam.unugha.ac.id/
```

## 📁 Directory Structure aaPanel

aaPanel menggunakan struktur direktori standar:
```
/www/wwwroot/backpinjam.unugha.ac.id/     # Document root
├── public/                               # Laravel public folder
├── app/
├── config/
├── database/
├── resources/
├── routes/
├── storage/
├── vendor/
├── .env
├── composer.json
└── artisan
```

## 🚀 Deployment Methods

### Method 1: Automated Script (Recommended)

#### PowerShell (Windows):
```powershell
# Upload dan setup otomatis
.\deploy_backend.ps1

# Hanya upload (manual setup)
.\deploy_backend.ps1 -UploadOnly
```

#### Bash (Linux/WSL):
```bash
# Upload dan setup otomatis
./deploy_backend.sh

# Hanya upload (manual setup)
./deploy_backend.sh --upload-only
```

### Method 2: Manual Deployment

#### Step 1: Prepare Laravel Files
```bash
cd backend

# Remove development files
rm -rf node_modules storage/logs/* bootstrap/cache/*
rm -f .env

# Create production .env (see configuration below)
```

#### Step 2: Upload Files
```bash
# Create archive
tar -czf backend-deploy.tar.gz -C backend .

# Upload to server
scp -F ssh_config backend-deploy.tar.gz backend-server:/www/wwwroot/backpinjam.unugha.ac.id/
```

#### Step 3: Server Setup
```bash
# SSH to server
ssh -F ssh_config backend-server

# Navigate to web directory
cd /www/wwwroot/backpinjam.unugha.ac.id

# Extract files
tar -xzf backend-deploy.tar.gz
rm backend-deploy.tar.gz

# Set permissions
chmod -R 755 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache

# Install dependencies
composer install --no-dev --optimize-autoloader

# Generate app key
php artisan key:generate --force

# Run migrations
php artisan migrate --force

# Optimize application
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## ⚙️ Environment Configuration

Create `.env` file dengan konfigurasi production:

```env
APP_NAME="Sistem Peminjaman UNUGHA"
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=https://backpinjam.unugha.ac.id

LOG_CHANNEL=stack
LOG_LEVEL=error

# Database Configuration (sesuaikan dengan aaPanel)
DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=your_database_name
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password

# Session & Cache
SESSION_DRIVER=file
SESSION_LIFETIME=120
CACHE_DRIVER=file

# Sanctum Configuration
SANCTUM_STATEFUL_DOMAINS=sipinjamku.unugha.ac.id
SESSION_DOMAIN=.unugha.ac.id

# CORS Configuration
CORS_ALLOWED_ORIGINS=https://sipinjamku.unugha.ac.id
CORS_ALLOWED_METHODS=GET,POST,PUT,DELETE,OPTIONS
CORS_ALLOWED_HEADERS=Content-Type,Authorization,X-Requested-With,X-XSRF-TOKEN
CORS_SUPPORTS_CREDENTIALS=true
```

## 🌐 aaPanel Web Server Configuration

### Nginx Configuration (Recommended)

1. Login ke aaPanel
2. Go to **Website** > **Domain Management**
3. Click **Settings** untuk domain backpinjam.unugha.ac.id
4. Pilih **Config** > **Nginx**
5. Replace dengan konfigurasi dari file `nginx.conf`

### Apache Configuration (Alternative)

Jika menggunakan Apache, file `.htaccess` sudah disediakan dan akan otomatis bekerja.

## 🗄️ Database Setup di aaPanel

### Create Database:
1. Login ke aaPanel
2. Go to **Database** > **MySQL**
3. Click **Add Database**
4. Database Name: `backpinjam_db`
5. Username: `backpinjam_user`
6. Set strong password
7. Grant all privileges

### Import Database (if needed):
```bash
# Via SSH
mysql -u backpinjam_user -p backpinjam_db < database_backup.sql

# Via aaPanel phpMyAdmin
# Go to Database > phpMyAdmin > Import
```

## 🔒 SSL Configuration

### Let's Encrypt (Free):
1. Login ke aaPanel
2. Go to **Website** > **Domain Management**
3. Click **SSL** untuk domain
4. Select **Let's Encrypt**
5. Click **Apply**
6. Enable **Force HTTPS**

## 🧪 Backend Testing

### API Endpoints Test:
```bash
# Test CSRF cookie
curl -X GET https://backpinjam.unugha.ac.id/sanctum/csrf-cookie -v

# Test API health
curl -X GET https://backpinjam.unugha.ac.id/api/health -H "Accept: application/json"

# Test CORS
curl -X OPTIONS https://backpinjam.unugha.ac.id/api/auth/login \
  -H "Origin: https://sipinjamku.unugha.ac.id" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization" -v
```

### Laravel Logs:
```bash
# Check application logs
tail -f /www/wwwroot/backpinjam.unugha.ac.id/storage/logs/laravel.log

# Check web server logs
tail -f /www/wwwlogs/backpinjam.unugha.ac.id.log
tail -f /www/wwwlogs/backpinjam.unugha.ac.id.error.log
```

## 🔧 aaPanel Specific Configurations

### PHP Settings:
1. Go to **Software Store** > **PHP 8.1** > **Settings**
2. **Performance Tuning**:
   - `memory_limit = 256M`
   - `upload_max_filesize = 64M`
   - `post_max_size = 64M`
   - `max_execution_time = 300`
   - `max_input_vars = 3000`

### Required PHP Extensions:
- OpenSSL
- PDO
- Mbstring
- Tokenizer
- XML
- Ctype
- JSON
- BCMath
- Fileinfo
- GD

### Firewall Settings:
1. Go to **Security** > **Firewall**
2. Ensure ports 80, 443 are open
3. Consider restricting SSH port 2227 to specific IPs

## 🚨 Troubleshooting

### Common Issues:

#### 1. Permission Errors:
```bash
# Fix storage permissions
sudo chown -R www-data:www-data /www/wwwroot/backpinjam.unugha.ac.id/storage
sudo chmod -R 775 /www/wwwroot/backpinjam.unugha.ac.id/storage
```

#### 2. Composer Issues:
```bash
# Update composer
composer self-update

# Clear composer cache
composer clear-cache

# Install with memory limit
php -d memory_limit=512M /usr/local/bin/composer install --no-dev
```

#### 3. Database Connection:
```bash
# Test database connection
php artisan tinker
>>> DB::connection()->getPdo();
```

#### 4. CORS Issues:
- Check Nginx/Apache configuration
- Verify frontend domain in CORS settings
- Test with browser developer tools

### Log Locations:
- **Laravel**: `/www/wwwroot/backpinjam.unugha.ac.id/storage/logs/`
- **Nginx**: `/www/wwwlogs/`
- **PHP**: `/www/server/php/81/var/log/`
- **aaPanel**: `/www/server/panel/logs/`

## ✅ Post-Deployment Checklist

- [ ] SSL certificate installed and working
- [ ] Database connection successful
- [ ] API endpoints responding
- [ ] CORS headers configured correctly
- [ ] File permissions set properly
- [ ] Laravel optimizations applied
- [ ] Logs are being written
- [ ] Frontend can connect to backend
- [ ] Authentication flow working

## 🔄 Next Steps

1. **Domain Configuration**: Setup DNS untuk backpinjam.unugha.ac.id
2. **Frontend Connection**: Update frontend API base URL
3. **Testing**: Comprehensive API testing
4. **Monitoring**: Setup log monitoring dan alerts
5. **Backup**: Configure automated database backups

## 📞 Support

Jika mengalami masalah:
1. Check Laravel logs: `storage/logs/laravel.log`
2. Check web server logs di aaPanel
3. Verify aaPanel configuration
4. Test API endpoints manually
5. Check database connectivity

---

**Status**: ✅ Ready for deployment to aaPanel Ubuntu server
**Last Updated**: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")