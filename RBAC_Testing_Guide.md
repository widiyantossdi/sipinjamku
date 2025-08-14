# Role-Based Access Control (RBAC) Testing Guide

## Overview
Sistem ini mengimplementasikan 4 level user dengan akses yang berbeda:

## User Roles & Access Levels

### 1. MAHASISWA
**Email Test:** `ahmad.rizki@student.unugha.ac.id`
**Password:** (sesuai yang didaftarkan)

**Akses yang Diizinkan:**
- ✅ Dashboard umum
- ✅ Halaman peminjaman (booking)
- ✅ Riwayat peminjaman sendiri
- ✅ Profil user
- ✅ Halaman publik (rooms, vehicles, calendar, guide)

**Akses yang Dibatasi:**
- ❌ Admin Panel (/admin/*)
- ❌ Staff Panel (/staff/*)
- ❌ QR Scanner
- ❌ Kelola data master

### 2. DOSEN
**Email Test:** `budi.santoso@unugha.ac.id`
**Password:** (sesuai yang didaftarkan)

**Akses yang Diizinkan:**
- ✅ Dashboard umum
- ✅ Halaman peminjaman (booking)
- ✅ Riwayat peminjaman sendiri
- ✅ Profil user
- ✅ Halaman publik (rooms, vehicles, calendar, guide)
- ✅ Prioritas approval lebih tinggi

**Akses yang Dibatasi:**
- ❌ Admin Panel (/admin/*)
- ❌ Staff Panel (/staff/*)
- ❌ QR Scanner
- ❌ Kelola data master

### 3. PETUGAS
**Email Test:** `petugas@unugha.ac.id`
**Password:** (sesuai yang didaftarkan)

**Akses yang Diizinkan:**
- ✅ Dashboard umum
- ✅ Halaman peminjaman (booking)
- ✅ Riwayat peminjaman sendiri
- ✅ Profil user
- ✅ Halaman publik
- ✅ **Staff Panel** (/staff)
- ✅ **QR Scanner** (/staff/scanner)
- ✅ Kelola log penggunaan
- ✅ Approve/reject peminjaman

**Akses yang Dibatasi:**
- ❌ Admin Panel (/admin/*)
- ❌ Kelola data master (users, rooms, vehicles)

### 4. ADMIN
**Email Test:** `admin@unugha.ac.id`
**Password:** (sesuai yang didaftarkan)

**Akses yang Diizinkan:**
- ✅ **SEMUA FITUR**
- ✅ Dashboard umum
- ✅ Halaman peminjaman
- ✅ **Admin Panel** (/admin)
- ✅ **Staff Panel** (/staff)
- ✅ **QR Scanner** (/staff/scanner)
- ✅ Kelola Users (/admin/users)
- ✅ Kelola Ruangan (/admin/rooms)
- ✅ Kelola Kendaraan (/admin/vehicles)
- ✅ Kelola Peminjaman (/admin/bookings)
- ✅ Reports (/admin/reports)

## Navigation Menu Berdasarkan Role

### Menu untuk Semua User (Authenticated)
- Beranda, Ruangan, Kendaraan, Kalender, Panduan
- Dashboard, Peminjaman, Riwayat

### Menu Tambahan untuk PETUGAS
- Staff Panel
- QR Scanner

### Menu Tambahan untuk ADMIN
- Admin Panel
- Kelola Peminjaman
- Kelola Ruangan
- Kelola Kendaraan
- Kelola User
- Staff Panel
- QR Scanner

## Testing Scenarios

### 1. Authentication Testing
```
1. Login dengan setiap role
2. Verifikasi redirect ke dashboard setelah login
3. Verifikasi user profile ditampilkan dengan benar
4. Test logout functionality
```

### 2. Navigation Testing
```
1. Login sebagai MAHASISWA
   - Verifikasi hanya menu dasar yang tampil
   - Tidak ada menu Admin/Staff

2. Login sebagai DOSEN
   - Verifikasi menu sama dengan mahasiswa
   - Tidak ada menu Admin/Staff

3. Login sebagai PETUGAS
   - Verifikasi menu Staff Panel dan QR Scanner tampil
   - Tidak ada menu Admin Panel

4. Login sebagai ADMIN
   - Verifikasi semua menu tampil
   - Admin Panel dan Staff Panel tersedia
```

### 3. Route Protection Testing
```
1. Akses langsung URL admin tanpa login
   - Harus redirect ke /login

2. Login sebagai MAHASISWA, akses /admin
   - Harus redirect ke /dashboard

3. Login sebagai PETUGAS, akses /admin/users
   - Harus redirect ke /dashboard

4. Login sebagai ADMIN, akses /admin/users
   - Harus berhasil akses

5. Login sebagai MAHASISWA, akses /staff/scanner
   - Harus redirect ke /dashboard

6. Login sebagai PETUGAS, akses /staff/scanner
   - Harus berhasil akses
```

### 4. Functionality Testing
```
1. MAHASISWA/DOSEN:
   - Buat peminjaman ruangan
   - Buat peminjaman kendaraan
   - Lihat riwayat peminjaman sendiri
   - Edit profil

2. PETUGAS:
   - Semua fungsi mahasiswa/dosen
   - Akses staff dashboard
   - Scan QR code (jika ada)
   - Approve/reject peminjaman

3. ADMIN:
   - Semua fungsi petugas
   - Kelola data users
   - Kelola data ruangan
   - Kelola data kendaraan
   - Lihat reports
   - Kelola semua peminjaman
```

## Setup Testing Data

1. **Jalankan SQL Script:**
   ```sql
   -- Jalankan file sample_users.sql di database
   -- Script ini akan membuat 4 user dengan role berbeda
   ```

2. **Register Users Manual:**
   - Buka /register
   - Daftarkan user dengan email sesuai role
   - Update role di database jika perlu

3. **Verifikasi Data:**
   ```sql
   SELECT nama, email, role FROM users;
   ```

## Expected Behavior

### ✅ Positive Test Cases
- User dapat akses fitur sesuai role
- Navigation menu tampil sesuai permission
- Redirect ke dashboard setelah login berhasil
- Logout berfungsi dengan benar

### ❌ Negative Test Cases
- User tidak dapat akses URL di luar permission
- Redirect ke dashboard jika akses unauthorized
- Error handling untuk invalid credentials
- Session management yang aman

## Security Considerations

1. **Route Protection:** Semua route admin/staff dilindungi ProtectedRoute
2. **Menu Visibility:** Menu hanya tampil sesuai role
3. **API Security:** Backend harus validasi role untuk setiap request
4. **Session Management:** Proper logout dan session cleanup

## Troubleshooting

### Jika Menu Tidak Tampil Sesuai Role:
1. Check userProfile di AuthContext
2. Verifikasi role di database
3. Check getNavItems() function di Header.tsx

### Jika Route Protection Tidak Bekerja:
1. Check ProtectedRoute component
2. Verifikasi requiredRole parameter
3. Check user authentication status

### Jika Database Error:
1. Pastikan table users ada
2. Check foreign key constraints
3. Verifikasi data types sesuai schema

---

**Note:** Pastikan untuk test semua scenario di atas untuk memastikan RBAC berfungsi dengan benar dan aman.