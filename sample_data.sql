-- Sample data untuk tabel ruangan
INSERT INTO ruangan (nama_ruangan, lokasi, kapasitas, fasilitas, status) VALUES
('Aula Utama', 'Gedung A Lantai 1', 200, 'Proyektor, Sound System, AC, Panggung', 'tersedia'),
('Ruang Kuliah A101', 'Gedung A Lantai 1', 50, 'Proyektor, AC, Whiteboard', 'tersedia'),
('Ruang Kuliah A201', 'Gedung A Lantai 2', 40, 'Proyektor, AC, Whiteboard', 'tersedia'),
('Ruang Kuliah B101', 'Gedung B Lantai 1', 45, 'Proyektor, AC, Whiteboard', 'tersedia'),
('Ruang Kuliah B201', 'Gedung B Lantai 2', 35, 'Proyektor, AC, Whiteboard', 'maintenance'),
('Lab Komputer 1', 'Gedung C Lantai 1', 30, 'Komputer 30 unit, Proyektor, AC', 'tersedia'),
('Lab Komputer 2', 'Gedung C Lantai 2', 25, 'Komputer 25 unit, Proyektor, AC', 'tersedia'),
('Ruang Seminar', 'Gedung D Lantai 1', 80, 'Proyektor, Sound System, AC, Meja Bundar', 'tersedia'),
('Ruang Rapat Dosen', 'Gedung A Lantai 3', 20, 'Proyektor, AC, Meja Rapat', 'tersedia'),
('Perpustakaan Ruang Diskusi', 'Gedung E Lantai 2', 15, 'Whiteboard, AC, Meja Diskusi', 'tersedia');

-- Sample data untuk tabel kendaraan
INSERT INTO kendaraan (jenis, merk, plat_nomor, kapasitas_penumpang, status) VALUES
('Bus', 'Isuzu Elf', 'D 1234 AB', 16, 'tersedia'),
('Bus', 'Mitsubishi Colt Diesel', 'D 5678 CD', 20, 'tersedia'),
('Mobil', 'Toyota Avanza', 'D 9012 EF', 7, 'tersedia'),
('Mobil', 'Daihatsu Xenia', 'D 3456 GH', 7, 'tersedia'),
('Mobil', 'Toyota Innova', 'D 7890 IJ', 8, 'maintenance'),
('Pickup', 'Mitsubishi L300', 'D 2468 KL', 3, 'tersedia'),
('Mobil', 'Honda Mobilio', 'D 1357 MN', 7, 'tersedia'),
('Bus', 'Hino Dutro', 'D 9753 OP', 25, 'tersedia'),
('Mobil', 'Suzuki Ertiga', 'D 8642 QR', 7, 'tidak_tersedia'),
('Pickup', 'Daihatsu Gran Max', 'D 1928 ST', 3, 'tersedia');

-- Sample data untuk tabel users (admin dan staff)
INSERT INTO users (nama, email, role, no_hp) VALUES
('Admin Sistem', 'admin@unugha.ac.id', 'admin', '081234567890'),
('Petugas Fasilitas', 'petugas@unugha.ac.id', 'petugas', '081234567891'),
('Dr. Ahmad Fauzi', 'ahmad.fauzi@unugha.ac.id', 'dosen', '081234567892'),
('Siti Nurhaliza', 'siti.nurhaliza@unugha.ac.id', 'mahasiswa', '081234567893'),
('Muhammad Rizki', 'muhammad.rizki@unugha.ac.id', 'mahasiswa', '081234567894'),
('Prof. Dr. Budi Santoso', 'budi.santoso@unugha.ac.id', 'dosen', '081234567895'),
('Andi Pratama', 'andi.pratama@unugha.ac.id', 'mahasiswa', '081234567896'),
('Staff TU', 'staff.tu@unugha.ac.id', 'petugas', '081234567897');

-- Sample data untuk tabel peminjaman
INSERT INTO peminjaman (id_user, jenis_peminjaman, id_ruangan, id_kendaraan, tanggal_mulai, jam_mulai, tanggal_selesai, jam_selesai, keperluan, status, qr_code) VALUES
-- Peminjaman ruangan (menggunakan id_user dari users yang sudah diinsert)
((SELECT id_user FROM users WHERE email = 'ahmad.fauzi@unugha.ac.id'), 'ruangan', (SELECT id_ruangan FROM ruangan WHERE nama_ruangan = 'Aula Utama'), NULL, '2024-01-15', '08:00', '2024-01-15', '12:00', 'Seminar Nasional Pendidikan', 'disetujui', 'QR001'),
((SELECT id_user FROM users WHERE email = 'siti.nurhaliza@unugha.ac.id'), 'ruangan', (SELECT id_ruangan FROM ruangan WHERE nama_ruangan = 'Ruang Kuliah A101'), NULL, '2024-01-16', '13:00', '2024-01-16', '15:00', 'Presentasi Tugas Akhir', 'diajukan', 'QR002'),
((SELECT id_user FROM users WHERE email = 'budi.santoso@unugha.ac.id'), 'ruangan', (SELECT id_ruangan FROM ruangan WHERE nama_ruangan = 'Lab Komputer 1'), NULL, '2024-01-17', '09:00', '2024-01-17', '11:00', 'Praktikum Pemrograman', 'disetujui', 'QR003'),
-- Peminjaman kendaraan
((SELECT id_user FROM users WHERE email = 'ahmad.fauzi@unugha.ac.id'), 'kendaraan', NULL, (SELECT id_kendaraan FROM kendaraan WHERE plat_nomor = 'D 1234 AB'), '2024-01-18', '07:00', '2024-01-18', '17:00', 'Kunjungan Industri Mahasiswa', 'disetujui', 'QR004'),
((SELECT id_user FROM users WHERE email = 'muhammad.rizki@unugha.ac.id'), 'kendaraan', NULL, (SELECT id_kendaraan FROM kendaraan WHERE plat_nomor = 'D 9012 EF'), '2024-01-19', '08:00', '2024-01-19', '16:00', 'Penelitian Lapangan', 'diajukan', 'QR005');

-- Sample data untuk tabel log_penggunaan
INSERT INTO log_penggunaan (id_peminjaman, waktu_scan_mulai, petugas) VALUES
((SELECT id_peminjaman FROM peminjaman WHERE qr_code = 'QR001'), '2024-01-15 08:00:00', 'Petugas Fasilitas'),
((SELECT id_peminjaman FROM peminjaman WHERE qr_code = 'QR003'), '2024-01-17 09:00:00', 'Petugas Fasilitas'),
((SELECT id_peminjaman FROM peminjaman WHERE qr_code = 'QR004'), '2024-01-18 07:00:00', 'Staff TU');