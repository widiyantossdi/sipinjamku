# 🚀 Deployment Guide - Sistem Peminjaman UNUGHA

## 📋 Overview
- **Frontend**: Vercel (https://sipinjamku.unugha.ac.id)
- **Backend**: cPanel (https://backpinjam.unugha.ac.id)
- **Status**: Frontend ready for deployment ✅

## 🎯 Frontend Deployment (Vercel)

### ✅ Completed Preparations
1. **Build Configuration**
   - Production build tested and working
   - Bundle size: ~1MB (optimization recommended)
   - TypeScript compilation: No errors

2. **Environment Setup**
   - `.env.production` configured
   - `vercel.json` with proper settings
   - CORS headers configured

3. **Scripts Added**
   ```bash
   npm run type-check    # TypeScript validation
   npm run deploy        # Deploy to preview
   npm run deploy:prod   # Deploy to production
   ```

### 🚀 Deployment Steps

#### Option 1: Vercel CLI (Recommended)
```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
npm run deploy:prod
```

#### Option 2: GitHub Integration
1. Push code to GitHub repository
2. Connect repository in Vercel dashboard
3. Configure custom domain: `sipinjamku.unugha.ac.id`
4. Set environment variables in Vercel dashboard
5. Deploy automatically

### 🔧 Environment Variables (Vercel Dashboard)
```
VITE_API_BASE_URL=https://backpinjam.unugha.ac.id/api
VITE_APP_NAME=Sistem Peminjaman Ruangan & Kendaraan
VITE_APP_ENV=production
```

### 🌐 Domain Configuration
**DNS Settings** (at domain provider):
```
Type: CNAME
Name: sipinjamku
Value: cname.vercel-dns.com
TTL: 3600
```

## 🔄 Next Steps

### 1. Backend Deployment (Pending)
- Upload Laravel files to cPanel
- Configure database connection
- Set up SSL certificate
- Configure CORS for frontend domain

### 2. Domain & SSL Setup
- Configure DNS records
- Verify SSL certificates
- Test cross-domain communication

### 3. Post-Deployment Testing
- Login/Register functionality
- API connectivity
- File upload features
- QR code generation

## 📊 Build Analysis

**Current Bundle Size**: 1,016.13 kB (gzipped: 284.25 kB)

**Optimization Recommendations**:
1. Implement code splitting with dynamic imports
2. Lazy load admin components
3. Optimize third-party dependencies
4. Use manual chunks for better caching

```javascript
// Example optimization
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const UserDashboard = lazy(() => import('./pages/user/UserDashboard'));
```

## 🐛 Troubleshooting

### Build Issues
- Run `npm run type-check` for TypeScript errors
- Check `npm run lint` for code quality issues
- Verify all environment variables are set

### Deployment Issues
- Ensure Vercel CLI is authenticated
- Check build logs in Vercel dashboard
- Verify domain DNS propagation (24-48 hours)

### API Connection Issues
- Confirm backend is deployed and accessible
- Check CORS configuration on backend
- Verify SSL certificates on both domains

## 📞 Support
For deployment issues, check:
1. Vercel dashboard logs
2. Browser developer console
3. Network tab for API calls
4. Backend server logs

---
**Status**: Frontend deployment ready ✅  
**Next**: Backend deployment to cPanel 🔄