# Panduan Deployment Frontend ke Vercel

## Persiapan Deployment

### 1. Environment Variables
File `.env.production` telah dibuat dengan konfigurasi:
```
VITE_API_BASE_URL=https://backpinjam.unugha.ac.id/api
VITE_APP_NAME="Sistem Peminjaman Ruangan & Kendaraan"
VITE_APP_ENV=production
```

### 2. Vercel Configuration
File `vercel.json` telah dikonfigurasi dengan:
- Build command: `npm run build`
- Output directory: `dist`
- Environment variables untuk production
- CORS headers untuk API integration

## Langkah Deployment

### 1. Via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login ke Vercel
vercel login

# Deploy
vercel --prod
```

### 2. Via GitHub Integration
1. Push code ke GitHub repository
2. Connect repository di Vercel dashboard
3. Set custom domain: `sipinjamku.unugha.ac.id`
4. Deploy otomatis akan berjalan

### 3. Konfigurasi Domain
1. Di Vercel dashboard, tambahkan custom domain
2. Set DNS record di domain provider:
   ```
   Type: CNAME
   Name: sipinjamku
   Value: cname.vercel-dns.com
   ```

### 4. Environment Variables di Vercel
Tambahkan di Vercel dashboard > Settings > Environment Variables:
- `VITE_API_BASE_URL`: `https://backpinjam.unugha.ac.id/api`
- `VITE_APP_NAME`: `Sistem Peminjaman Ruangan & Kendaraan`
- `VITE_APP_ENV`: `production`

## Post-Deployment Check

1. Verifikasi domain: https://sipinjamku.unugha.ac.id
2. Test login/register functionality
3. Check API connectivity dengan backend
4. Verify SSL certificate

## Troubleshooting

### Build Errors
- Pastikan semua dependencies terinstall
- Check TypeScript errors: `npm run type-check`
- Verify environment variables

### API Connection Issues
- Pastikan backend sudah deployed di `backpinjam.unugha.ac.id`
- Check CORS configuration
- Verify SSL certificates

### Domain Issues
- Tunggu propagasi DNS (24-48 jam)
- Verify CNAME record
- Check Vercel domain settings

## Build Optimization

Untuk mengurangi bundle size (saat ini 1MB+):
1. Implement code splitting
2. Lazy load components
3. Optimize dependencies

```javascript
// Example: Lazy loading
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
```