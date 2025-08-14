-- Sample Users Data untuk Testing Role-Based Access Control
-- Sistem memiliki 4 level user: mahasiswa, dosen, admin, petugas

-- Insert sample users untuk setiap role
INSERT INTO users (nama, email, role, no_hp) VALUES
-- Admin User
('Admin System', 'admin@unugha.ac.id', 'admin', '081234567890'),

-- Petugas User  
('Petugas Fasilitas', 'petugas@unugha.ac.id', 'petugas', '081234567891'),

-- Dosen User
('Dr. Budi Santoso', 'budi.santoso@unugha.ac.id', 'dosen', '081234567892'),

-- Mahasiswa User
('Ahmad Rizki', 'ahmad.rizki@student.unugha.ac.id', 'mahasiswa', '081234567893');

-- Insert sample ruangan
INSERT INTO ruangan (nama_ruangan, lokasi, kapasitas, fasilitas, status) VALUES
('Ruang Kuliah A101', 'Gedung A Lantai 1', 40, 'Proyektor, AC, Whiteboard', 'tersedia'),
('Ruang Seminar B201', 'Gedung B Lantai 2', 100, 'Proyektor, Sound System, AC', 'tersedia'),
('Lab Komputer C301', 'Gedung C Lantai 3', 30, 'Komputer, Proyektor, AC', 'tersedia'),
('Aula Utama', 'Gedung Utama', 500, 'Sound System, Proyektor, AC, Panggung', 'tersedia');

-- Insert sample kendaraan
INSERT INTO kendaraan (jenis, merk, plat_nomor, kapasitas_penumpang, status) VALUES
('Bus', 'Isuzu Elf', 'K 1234 AB', 15, 'tersedia'),
('Mobil', 'Toyota Avanza', 'K 5678 CD', 7, 'tersedia'),
('Mobil', 'Honda Brio', 'K 9012 EF', 5, 'tersedia'),
('Bus', 'Mitsubishi Colt', 'K 3456 GH', 12, 'tersedia');

-- Insert sample peminjaman untuk testing
-- Peminjaman oleh mahasiswa
INSERT INTO peminjaman (id_user, jenis_peminjaman, id_ruangan, tanggal_mulai, jam_mulai, tanggal_selesai, jam_selesai, keperluan, status, qr_code)
SELECT 
    u.id_user,
    'ruangan',
    r.id_ruangan,
    '2024-01-15',
    '08:00',
    '2024-01-15', 
    '10:00',
    'Presentasi Tugas Akhir',
    'disetujui',
    'QR_' || substr(md5(random()::text), 1, 8)
FROM users u, ruangan r 
WHERE u.email = 'ahmad.rizki@student.unugha.ac.id' 
AND r.nama_ruangan = 'Ruang Kuliah A101'
LIMIT 1;

-- Peminjaman oleh dosen
INSERT INTO peminjaman (id_user, jenis_peminjaman, id_kendaraan, tanggal_mulai, jam_mulai, tanggal_selesai, jam_selesai, keperluan, status, qr_code)
SELECT 
    u.id_user,
    'kendaraan',
    k.id_kendaraan,
    '2024-01-16',
    '09:00',
    '2024-01-16',
    '17:00',
    'Kunjungan Akademik ke Universitas Partner',
    'disetujui',
    'QR_' || substr(md5(random()::text), 1, 8)
FROM users u, kendaraan k 
WHERE u.email = 'budi.santoso@unugha.ac.id' 
AND k.plat_nomor = 'K 1234 AB'
LIMIT 1;

-- Log penggunaan sample
INSERT INTO log_penggunaan (id_peminjaman, waktu_scan_mulai, petugas)
SELECT 
    p.id_peminjaman,
    '2024-01-15 08:00:00',
    'Petugas Fasilitas'
FROM peminjaman p
JOIN users u ON p.id_user = u.id_user
WHERE u.email = 'ahmad.rizki@student.unugha.ac.id'
LIMIT 1;

-- Tampilkan informasi akses untuk setiap role
/*
ROLE-BASED ACCESS CONTROL SUMMARY:

1. MAHASISWA (ahmad.rizki@student.unugha.ac.id)
   - Akses: Dashboard, Peminjaman, Riwayat Peminjaman, Profil
   - Tidak dapat: Akses admin panel, staff panel, QR scanner
   - Dapat: Membuat peminjaman ruangan/kendaraan, melihat riwayat sendiri

2. DOSEN (budi.santoso@unugha.ac.id) 
   - Akses: Dashboard, Peminjaman, Riwayat Peminjaman, Profil
   - Tidak dapat: Akses admin panel, staff panel, QR scanner
   - Dapat: Membuat peminjaman ruangan/kendaraan, melihat riwayat sendiri
   - Prioritas: Lebih tinggi dari mahasiswa dalam approval

3. PETUGAS (petugas@unugha.ac.id)
   - Akses: Dashboard, Peminjaman, Riwayat, Profil, Staff Panel, QR Scanner
   - Tidak dapat: Akses admin panel (kelola data master)
   - Dapat: Scan QR code, kelola log penggunaan, approve/reject peminjaman

4. ADMIN (admin@unugha.ac.id)
   - Akses: Semua fitur (Dashboard, Peminjaman, Admin Panel, Staff Panel)
   - Dapat: Kelola users, ruangan, kendaraan, peminjaman, reports, QR scanner
   - Full access ke semua modul sistem

TEST SCENARIOS:
1. Login dengan setiap user dan verifikasi menu yang tampil
2. Coba akses URL admin dengan user non-admin (harus redirect)
3. Coba akses staff panel dengan mahasiswa/dosen (harus redirect)
4. Test pembuatan peminjaman untuk setiap role
5. Test QR scanner hanya untuk petugas/admin
*/