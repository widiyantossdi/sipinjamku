# 🚀 Deployment Guide - UNUGHA Sistem Peminjaman

## Deploy ke Vercel

### 1. Persiapan Project

✅ Project sudah siap deploy dengan:
- Build berhasil tanpa error
- TypeScript errors sudah diperbaiki
- Production build di folder `dist/`
- Konfigurasi Vercel (`vercel.json`) sudah dibuat

### 2. Setup Vercel Account

1. **Buat akun Vercel**: https://vercel.com
2. **Connect dengan GitHub**: Link akun GitHub Anda
3. **Install Vercel CLI** (opsional):
   ```bash
   npm i -g vercel
   ```

### 3. Deploy via Vercel Dashboard

#### Option A: Import dari GitHub
1. Push project ke GitHub repository
2. Buka https://vercel.com/dashboard
3. Klik "New Project"
4. Import repository GitHub Anda
5. Configure project settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

#### Option B: Deploy via CLI
```bash
# Login ke Vercel
vercel login

# Deploy project
vercel

# Follow prompts:
# - Set up and deploy? Y
# - Which scope? (pilih account Anda)
# - Link to existing project? N
# - Project name: unugha-sistem-peminjaman
# - Directory: ./
# - Override settings? N
```

### 4. Environment Variables Setup

Di Vercel Dashboard > Project Settings > Environment Variables, tambahkan:

```env
# Supabase Configuration (REQUIRED)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# App Configuration
VITE_APP_NAME=UNUGHA Sistem Peminjaman
VITE_APP_URL=https://your-vercel-domain.vercel.app

# Optional: WhatsApp Integration
VITE_WHATSAPP_API_URL=https://api.whatsapp.com
VITE_WHATSAPP_API_KEY=your_whatsapp_api_key
VITE_WHATSAPP_PHONE_NUMBER=your_whatsapp_number

# Optional: SMTP Configuration
VITE_SMTP_HOST=smtp.gmail.com
VITE_SMTP_PORT=587
VITE_SMTP_USER=your_email@gmail.com
VITE_SMTP_PASS=your_app_password
```

### 5. Supabase Configuration

#### Update Supabase Settings:
1. **Authentication > URL Configuration**:
   - Site URL: `https://your-vercel-domain.vercel.app`
   - Redirect URLs: `https://your-vercel-domain.vercel.app/**`

2. **API Settings**:
   - Pastikan CORS sudah dikonfigurasi untuk domain Vercel

#### Database Setup:
```sql
-- Jalankan di Supabase SQL Editor
-- 1. Setup tables (jika belum ada)
\i setup_test_data.sql

-- 2. Setup RLS policies (jika diperlukan)
\i rls_policies.sql
```

### 6. Custom Domain (Opsional)

1. **Beli domain** atau gunakan subdomain existing
2. **Di Vercel Dashboard**:
   - Project Settings > Domains
   - Add domain Anda
   - Configure DNS records sesuai instruksi

### 7. Verifikasi Deployment

#### Checklist Post-Deployment:
- [ ] Website dapat diakses di URL Vercel
- [ ] Login/Register berfungsi
- [ ] Database connection berhasil
- [ ] Semua fitur RBAC berfungsi:
  - [ ] Mahasiswa: Dashboard, Booking, Profile
  - [ ] Dosen: Dashboard, Booking, Profile
  - [ ] Petugas: Dashboard, Booking, Staff Panel, QR Scanner
  - [ ] Admin: Full access ke semua fitur
- [ ] Responsive design di mobile
- [ ] Performance score bagus (Lighthouse)

### 8. Monitoring & Analytics

#### Vercel Analytics:
```bash
# Install Vercel Analytics
npm install @vercel/analytics
```

#### Update main.tsx:
```typescript
import { Analytics } from '@vercel/analytics/react'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <App />
        <Analytics />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
```

### 9. Troubleshooting

#### Build Errors:
```bash
# Test build locally
npm run build
npm run preview
```

#### Environment Variables:
- Pastikan semua VITE_ prefix ada
- Check di Vercel Dashboard > Functions > Logs

#### Database Connection:
- Verify Supabase URL dan keys
- Check network policies di Supabase

#### CORS Issues:
```sql
-- Update Supabase CORS jika diperlukan
ALTER SYSTEM SET cors.allowed_origins = 'https://your-domain.vercel.app';
```

### 10. Continuous Deployment

✅ **Auto-deploy sudah aktif**:
- Setiap push ke main branch = auto deploy
- Preview deployments untuk PR
- Rollback mudah via dashboard

### 11. Performance Optimization

#### Vercel Edge Functions (Advanced):
```javascript
// api/auth.js - Edge function untuk auth
export default function handler(req, res) {
  // Handle auth logic
}
```

#### CDN & Caching:
- Static assets auto-cached
- API responses dapat di-cache
- Image optimization otomatis

---

## 🎯 Quick Deploy Commands

```bash
# 1. Build project
npm run build

# 2. Test production build
npm run preview

# 3. Deploy to Vercel
vercel --prod

# 4. Check deployment
vercel ls
```

## 📞 Support

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Project Issues**: Check GitHub Issues

---

**🚀 Ready to deploy!** Project sudah dikonfigurasi dengan optimal untuk production deployment di Vercel.