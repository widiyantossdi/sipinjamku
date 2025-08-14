# SiPinjamku - Sistem Peminjaman UNUGHA

🏢 **Sistem Peminjaman Ruangan dan Kendaraan Universitas Nahdlatul Ulama Gorontalo**

Sistem web modern untuk mengelola peminjaman ruangan dan kendaraan dengan kontrol akses berbasis peran (Role-Based Access Control).

## 🚀 Fitur Utama

### 👥 Role-Based Access Control
- **Admin**: Kelola semua aset (ruangan & kendaraan), user, dan laporan
- **Staff/Petugas**: Kelola booking, scan QR code, verifikasi peminjaman
- **Mahasiswa/Dosen**: Lihat dan buat booking sendiri

### 🏢 Manajemen Ruangan
- CRUD ruangan dengan detail lengkap
- Status ketersediaan real-time
- Filter berdasarkan kapasitas dan fasilitas
- Upload gambar ruangan

### 🚗 Manajemen Kendaraan
- CRUD kendaraan dengan spesifikasi
- Tracking status dan kondisi
- Manajemen dokumen kendaraan
- Riwayat penggunaan

### 📅 Sistem Booking
- Booking ruangan dan kendaraan
- Validasi konflik jadwal
- Approval workflow
- Notifikasi real-time

### 📱 QR Code Scanner
- Scan QR untuk verifikasi booking
- Check-in/check-out otomatis
- Tracking penggunaan real-time

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Lucide Icons
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Authentication**: Supabase Auth dengan RLS
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 18+ dan npm
- Akun Supabase
- Git

## ⚡ Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/YOUR_USERNAME/sipinjamku.git
cd sipinjamku
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Buat file `.env` dari template:
```bash
cp .env.example .env
```

Isi variabel environment:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Setup Database

#### A. Buat Project Supabase
1. Buka [Supabase Dashboard](https://supabase.com/dashboard)
2. Klik "New Project"
3. Isi nama project dan password database
4. Tunggu hingga project selesai dibuat

#### B. Jalankan SQL Scripts
Di Supabase SQL Editor, jalankan script berikut secara berurutan:

1. **Setup Tables & RLS**:
   ```sql
   -- Copy dan paste isi dari rls_policies_fixed.sql
   ```

2. **Sample Data** (opsional):
   ```sql
   -- Copy dan paste isi dari sample_data.sql
   ```

3. **Sample Users** (opsional):
   ```sql
   -- Copy dan paste isi dari sample_users.sql
   ```

#### C. Setup Storage
```sql
-- Copy dan paste isi dari storage_setup.sql
```

### 5. Jalankan Development Server
```bash
npm run dev
```

Buka [http://localhost:5173](http://localhost:5173) di browser.

## 🔧 Konfigurasi Database

### Struktur Tabel Utama

- `users` - Data pengguna dengan role
- `ruangan` - Data ruangan dan fasilitas
- `kendaraan` - Data kendaraan dan spesifikasi
- `peminjaman` - Data booking dan status
- `log_penggunaan` - Log aktivitas dan tracking

### Row Level Security (RLS)

Semua tabel menggunakan RLS dengan policy:
- Admin: Full access ke semua data
- Staff: Read/write booking, read-only aset
- User: Read public data, manage booking sendiri

## 👤 User Management

### Membuat User Admin Pertama

1. Register melalui aplikasi
2. Di Supabase Auth, edit user metadata:
   ```json
   {
     "role": "admin"
   }
   ```
3. Update tabel `users` dengan role admin

### Role Types
- `admin` - Administrator sistem
- `petugas` - Staff/petugas
- `mahasiswa` - Mahasiswa
- `dosen` - Dosen

## 🚀 Deployment

### Deploy ke Vercel

1. **Push ke GitHub**:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy di Vercel**:
   - Buka [Vercel Dashboard](https://vercel.com)
   - Import repository GitHub
   - Set environment variables
   - Deploy

3. **Environment Variables di Vercel**:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### Production Checklist

- [ ] Environment variables configured
- [ ] Database RLS policies active
- [ ] Sample data removed (jika tidak diperlukan)
- [ ] Admin user created
- [ ] Storage buckets configured
- [ ] Domain configured (opsional)

## 📱 Penggunaan

### Untuk Admin
1. Login dengan akun admin
2. Akses dashboard admin
3. Kelola ruangan di menu "Ruangan"
4. Kelola kendaraan di menu "Kendaraan"
5. Monitor booking di menu "Booking"
6. Lihat laporan di menu "Laporan"

### Untuk Staff
1. Login dengan akun staff
2. Akses dashboard staff
3. Kelola booking yang masuk
4. Gunakan QR Scanner untuk verifikasi
5. Update status peminjaman

### Untuk User (Mahasiswa/Dosen)
1. Buka halaman publik (tanpa login)
2. Lihat ruangan dan kendaraan tersedia
3. Register/login untuk booking
4. Buat booking baru
5. Monitor status booking di dashboard

## 🔍 Testing

### Run Tests
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# RBAC testing
node test_rbac.js
```

### Manual Testing
1. Test login dengan berbagai role
2. Test CRUD operations
3. Test booking workflow
4. Test QR scanner functionality
5. Test responsive design

## 📚 Dokumentasi Tambahan

- [Deployment Guide](DEPLOYMENT.md)
- [RBAC Testing Guide](RBAC_Testing_Guide.md)
- [Fix Infinite Recursion](FIX_INFINITE_RECURSION.md)
- [Production Testing](PRODUCTION_TESTING.md)

## 🐛 Troubleshooting

### Common Issues

**1. Infinite Recursion Error**
- Pastikan menggunakan `rls_policies_fixed.sql`
- Check user metadata di Supabase Auth

**2. Authentication Issues**
- Verify environment variables
- Check Supabase project settings
- Ensure RLS policies are active

**3. Permission Denied**
- Check user role di database
- Verify RLS policies
- Check Supabase Auth user metadata

**4. Build Errors**
- Clear node_modules: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npm run type-check`

## 🤝 Contributing

1. Fork repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

MIT License - lihat file [LICENSE](LICENSE) untuk detail.

## 👨‍💻 Developer

Dikembangkan untuk Universitas Nahdlatul Ulama Gorontalo

---

**🎯 Happy Coding! Semoga sistem ini bermanfaat untuk UNUGHA! 🚀**