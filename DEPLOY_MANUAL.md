# 🚀 Manual Deployment Guide - Frontend ke Vercel

## Status Persiapan ✅
- Build production: **READY** (dist/ folder tersedia)
- Environment variables: **CONFIGURED**
- Vercel CLI: **INSTALLED** (v45.0.9)
- Domain target: `sipinjamku.unugha.ac.id`

## 🎯 Langkah Deployment Manual

### Option 1: Vercel CLI (Recommended)
```bash
# 1. Login ke Vercel (jika belum)
vercel login

# 2. Deploy ke production
vercel --prod

# 3. Set custom domain di Vercel dashboard
# Domain: sipinjamku.unugha.ac.id
```

### Option 2: Vercel Dashboard
1. **Upload Project**
   - Zip folder `F:\LatihanNew\webssdi`
   - Upload ke Vercel dashboard
   - Atau connect via GitHub

2. **Configure Build Settings**
   ```
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

3. **Environment Variables**
   ```
   VITE_API_BASE_URL=https://backpinjam.unugha.ac.id/api
   VITE_APP_NAME=Sistem Peminjaman Ruangan & Kendaraan
   VITE_APP_ENV=production
   ```

4. **Custom Domain**
   - Add domain: `sipinjamku.unugha.ac.id`
   - Configure DNS: CNAME → `cname.vercel-dns.com`

## 🔧 DNS Configuration

**Di Domain Provider (unugha.ac.id)**:
```
Type: CNAME
Name: sipinjamku
Value: cname.vercel-dns.com
TTL: 3600
```

## 📋 Post-Deployment Checklist

### 1. Verify Deployment
- [ ] Site accessible via Vercel URL
- [ ] Custom domain working: https://sipinjamku.unugha.ac.id
- [ ] SSL certificate active

### 2. Test Functionality
- [ ] Login page loads
- [ ] Registration form works
- [ ] API connection to backend
- [ ] CSRF token handling

### 3. Performance Check
- [ ] Page load speed
- [ ] Mobile responsiveness
- [ ] Console errors (none)

## 🐛 Troubleshooting

### Build Issues
```bash
# Manual build jika diperlukan
npm install
npm run build
```

### Domain Issues
- DNS propagation: 24-48 jam
- Check DNS: `nslookup sipinjamku.unugha.ac.id`
- Verify CNAME record

### API Connection
- Backend harus sudah deployed di `backpinjam.unugha.ac.id`
- Check CORS settings
- Verify SSL certificates

## 📞 Next Steps

1. **Deploy Backend** ke cPanel
2. **Configure CORS** untuk domain frontend
3. **Test Integration** antara frontend-backend
4. **Setup SSL** untuk kedua domain

---
**Ready to Deploy**: Frontend siap 100% ✅  
**Command**: `vercel --prod` atau via dashboard  
**Target**: https://sipinjamku.unugha.ac.id