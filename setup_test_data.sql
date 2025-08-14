-- Setup Test Data untuk RBAC Testing
-- Jalankan script ini di Supabase SQL Editor atau database client

-- 1. Pastikan table users ada dengan struktur yang benar
CREATE TABLE IF NOT EXISTS users (
    id_user UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('mahasiswa', 'dosen', 'admin', 'petugas')),
    no_hp VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Pastikan table ruangan ada
CREATE TABLE IF NOT EXISTS ruangan (
    id_ruangan UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama_ruangan VARCHAR(255) NOT NULL,
    lokasi VARCHAR(255) NOT NULL,
    kapasitas INTEGER NOT NULL,
    fasilitas TEXT,
    status VARCHAR(50) DEFAULT 'tersedia' CHECK (status IN ('tersedia', 'tidak_tersedia', 'maintenance')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Pastikan table kendaraan ada
CREATE TABLE IF NOT EXISTS kendaraan (
    id_kendaraan UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jenis VARCHAR(100) NOT NULL,
    merk VARCHAR(100) NOT NULL,
    plat_nomor VARCHAR(20) UNIQUE NOT NULL,
    kapasitas_penumpang INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'tersedia' CHECK (status IN ('tersedia', 'tidak_tersedia', 'maintenance')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Pastikan table peminjaman ada
CREATE TABLE IF NOT EXISTS peminjaman (
    id_peminjaman UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_user UUID NOT NULL REFERENCES users(id_user) ON DELETE CASCADE,
    jenis_peminjaman VARCHAR(20) NOT NULL CHECK (jenis_peminjaman IN ('ruangan', 'kendaraan')),
    id_ruangan UUID REFERENCES ruangan(id_ruangan) ON DELETE SET NULL,
    id_kendaraan UUID REFERENCES kendaraan(id_kendaraan) ON DELETE SET NULL,
    tanggal_mulai DATE NOT NULL,
    jam_mulai TIME NOT NULL,
    tanggal_selesai DATE NOT NULL,
    jam_selesai TIME NOT NULL,
    keperluan TEXT NOT NULL,
    file_surat TEXT,
    status VARCHAR(20) DEFAULT 'diajukan' CHECK (status IN ('diajukan', 'disetujui', 'ditolak', 'selesai')),
    qr_code VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Pastikan table log_penggunaan ada
CREATE TABLE IF NOT EXISTS log_penggunaan (
    id_log UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_peminjaman UUID NOT NULL REFERENCES peminjaman(id_peminjaman) ON DELETE CASCADE,
    waktu_scan_mulai TIMESTAMP WITH TIME ZONE,
    waktu_scan_selesai TIMESTAMP WITH TIME ZONE,
    petugas VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Hapus data test lama jika ada
DELETE FROM log_penggunaan WHERE petugas LIKE '%Test%' OR petugas LIKE '%test%';
DELETE FROM peminjaman WHERE keperluan LIKE '%Test%' OR keperluan LIKE '%test%';
DELETE FROM users WHERE email LIKE '%test%' OR email LIKE '%@unugha.ac.id';
DELETE FROM ruangan WHERE nama_ruangan LIKE '%Test%';
DELETE FROM kendaraan WHERE plat_nomor LIKE 'TEST%';

-- 7. Insert test users untuk setiap role
INSERT INTO users (nama, email, role, no_hp) VALUES
('Admin System', 'admin@unugha.ac.id', 'admin', '081234567890'),
('Petugas Fasilitas', 'petugas@unugha.ac.id', 'petugas', '081234567891'),
('Dr. Budi Santoso', 'budi.santoso@unugha.ac.id', 'dosen', '081234567892'),
('Ahmad Rizki', 'ahmad.rizki@student.unugha.ac.id', 'mahasiswa', '081234567893');

-- 8. Insert test ruangan
INSERT INTO ruangan (nama_ruangan, lokasi, kapasitas, fasilitas, status) VALUES
('Ruang Kuliah A101', 'Gedung A Lantai 1', 40, 'Proyektor, AC, Whiteboard', 'tersedia'),
('Ruang Seminar B201', 'Gedung B Lantai 2', 100, 'Proyektor, Sound System, AC', 'tersedia'),
('Lab Komputer C301', 'Gedung C Lantai 3', 30, 'Komputer, Proyektor, AC', 'tersedia'),
('Aula Utama', 'Gedung Utama', 500, 'Sound System, Proyektor, AC, Panggung', 'tersedia'),
('Ruang Meeting D101', 'Gedung D Lantai 1', 20, 'Proyektor, AC, Meja Meeting', 'tersedia');

-- 9. Insert test kendaraan
INSERT INTO kendaraan (jenis, merk, plat_nomor, kapasitas_penumpang, status) VALUES
('Bus', 'Isuzu Elf', 'K 1234 AB', 15, 'tersedia'),
('Mobil', 'Toyota Avanza', 'K 5678 CD', 7, 'tersedia'),
('Mobil', 'Honda Brio', 'K 9012 EF', 5, 'tersedia'),
('Bus', 'Mitsubishi Colt', 'K 3456 GH', 12, 'tersedia'),
('Mobil', 'Daihatsu Xenia', 'K 7890 IJ', 7, 'tersedia');

-- 10. Insert test peminjaman
-- Peminjaman oleh mahasiswa (ruangan)
INSERT INTO peminjaman (id_user, jenis_peminjaman, id_ruangan, tanggal_mulai, jam_mulai, tanggal_selesai, jam_selesai, keperluan, status, qr_code)
SELECT 
    u.id_user,
    'ruangan',
    r.id_ruangan,
    CURRENT_DATE + INTERVAL '1 day',
    '08:00',
    CURRENT_DATE + INTERVAL '1 day',
    '10:00',
    'Presentasi Tugas Akhir - Test Data',
    'disetujui',
    'QR_' || SUBSTRING(MD5(RANDOM()::TEXT), 1, 8)
FROM users u, ruangan r 
WHERE u.email = 'ahmad.rizki@student.unugha.ac.id' 
AND r.nama_ruangan = 'Ruang Kuliah A101'
LIMIT 1;

-- Peminjaman oleh dosen (kendaraan)
INSERT INTO peminjaman (id_user, jenis_peminjaman, id_kendaraan, tanggal_mulai, jam_mulai, tanggal_selesai, jam_selesai, keperluan, status, qr_code)
SELECT 
    u.id_user,
    'kendaraan',
    k.id_kendaraan,
    CURRENT_DATE + INTERVAL '2 days',
    '09:00',
    CURRENT_DATE + INTERVAL '2 days',
    '17:00',
    'Kunjungan Akademik ke Universitas Partner - Test Data',
    'disetujui',
    'QR_' || SUBSTRING(MD5(RANDOM()::TEXT), 1, 8)
FROM users u, kendaraan k 
WHERE u.email = 'budi.santoso@unugha.ac.id' 
AND k.plat_nomor = 'K 1234 AB'
LIMIT 1;

-- Peminjaman pending oleh admin (ruangan)
INSERT INTO peminjaman (id_user, jenis_peminjaman, id_ruangan, tanggal_mulai, jam_mulai, tanggal_selesai, jam_selesai, keperluan, status, qr_code)
SELECT 
    u.id_user,
    'ruangan',
    r.id_ruangan,
    CURRENT_DATE + INTERVAL '3 days',
    '13:00',
    CURRENT_DATE + INTERVAL '3 days',
    '15:00',
    'Rapat Koordinasi Admin - Test Data',
    'diajukan',
    'QR_' || SUBSTRING(MD5(RANDOM()::TEXT), 1, 8)
FROM users u, ruangan r 
WHERE u.email = 'admin@unugha.ac.id' 
AND r.nama_ruangan = 'Ruang Meeting D101'
LIMIT 1;

-- 11. Insert test log penggunaan
INSERT INTO log_penggunaan (id_peminjaman, waktu_scan_mulai, petugas)
SELECT 
    p.id_peminjaman,
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    'Petugas Test'
FROM peminjaman p
JOIN users u ON p.id_user = u.id_user
WHERE u.email = 'ahmad.rizki@student.unugha.ac.id'
AND p.status = 'disetujui'
LIMIT 1;

-- 12. Verifikasi data yang telah diinsert
SELECT 'USERS' as table_name, COUNT(*) as count FROM users WHERE email LIKE '%@unugha.ac.id'
UNION ALL
SELECT 'RUANGAN' as table_name, COUNT(*) as count FROM ruangan
UNION ALL
SELECT 'KENDARAAN' as table_name, COUNT(*) as count FROM kendaraan
UNION ALL
SELECT 'PEMINJAMAN' as table_name, COUNT(*) as count FROM peminjaman WHERE keperluan LIKE '%Test Data%'
UNION ALL
SELECT 'LOG_PENGGUNAAN' as table_name, COUNT(*) as count FROM log_penggunaan WHERE petugas LIKE '%Test%';

-- 13. Tampilkan informasi test users
SELECT 
    nama,
    email,
    role,
    no_hp,
    'Password: (sesuai yang didaftarkan)' as password_note
FROM users 
WHERE email LIKE '%@unugha.ac.id'
ORDER BY 
    CASE role 
        WHEN 'admin' THEN 1
        WHEN 'petugas' THEN 2
        WHEN 'dosen' THEN 3
        WHEN 'mahasiswa' THEN 4
    END;

-- 14. Tampilkan ringkasan peminjaman test
SELECT 
    u.nama as user_name,
    u.role,
    p.jenis_peminjaman,
    COALESCE(r.nama_ruangan, k.plat_nomor) as resource,
    p.tanggal_mulai,
    p.status,
    p.keperluan
FROM peminjaman p
JOIN users u ON p.id_user = u.id_user
LEFT JOIN ruangan r ON p.id_ruangan = r.id_ruangan
LEFT JOIN kendaraan k ON p.id_kendaraan = k.id_kendaraan
WHERE p.keperluan LIKE '%Test Data%'
ORDER BY p.created_at;

-- 15. Setup RLS (Row Level Security) jika diperlukan
-- Uncomment jika menggunakan Supabase dengan RLS
/*
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ruangan ENABLE ROW LEVEL SECURITY;
ALTER TABLE kendaraan ENABLE ROW LEVEL SECURITY;
ALTER TABLE peminjaman ENABLE ROW LEVEL SECURITY;
ALTER TABLE log_penggunaan ENABLE ROW LEVEL SECURITY;

-- Policy untuk users: user hanya bisa lihat/edit data sendiri, admin bisa semua
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid() = id_user OR 
                     (SELECT role FROM users WHERE id_user = auth.uid()) = 'admin');

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid() = id_user OR 
                     (SELECT role FROM users WHERE id_user = auth.uid()) = 'admin');

-- Policy untuk peminjaman: user bisa lihat/edit peminjaman sendiri, admin/petugas bisa semua
CREATE POLICY "Users can view own bookings" ON peminjaman
    FOR SELECT USING (auth.uid() = id_user OR 
                     (SELECT role FROM users WHERE id_user = auth.uid()) IN ('admin', 'petugas'));

CREATE POLICY "Users can create bookings" ON peminjaman
    FOR INSERT WITH CHECK (auth.uid() = id_user);

CREATE POLICY "Admin/Petugas can update bookings" ON peminjaman
    FOR UPDATE USING ((SELECT role FROM users WHERE id_user = auth.uid()) IN ('admin', 'petugas'));
*/

-- 16. Pesan sukses
SELECT 'Test data setup completed successfully!' as message,
       'Ready for RBAC testing' as status,
       NOW() as timestamp;

-- INSTRUKSI PENGGUNAAN:
-- 1. Jalankan script ini di Supabase SQL Editor
-- 2. Daftarkan user test melalui aplikasi dengan email yang sesuai
-- 3. Update role user di database jika perlu
-- 4. Gunakan test_rbac.js untuk testing otomatis
-- 5. Ikuti RBAC_Testing_Guide.md untuk testing manual