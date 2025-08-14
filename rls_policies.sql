-- RLS Policies untuk Sistem Peminjaman UNUGHA
-- Jalankan script ini di Supabase SQL Editor

-- 1. Enable RLS pada semua tabel
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ruangan ENABLE ROW LEVEL SECURITY;
ALTER TABLE kendaraan ENABLE ROW LEVEL SECURITY;
ALTER TABLE peminjaman ENABLE ROW LEVEL SECURITY;
ALTER TABLE log_penggunaan ENABLE ROW LEVEL SECURITY;

-- 2. Policies untuk tabel USERS
-- Admin dapat melihat dan mengelola semua user
CREATE POLICY "Admin can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id_user = auth.uid() 
      AND u.role = 'admin'
    )
  );

CREATE POLICY "Admin can insert users" ON users
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id_user = auth.uid() 
      AND u.role = 'admin'
    )
  );

CREATE POLICY "Admin can update users" ON users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id_user = auth.uid() 
      AND u.role = 'admin'
    )
  );

CREATE POLICY "Admin can delete users" ON users
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id_user = auth.uid() 
      AND u.role = 'admin'
    )
  );

-- User dapat melihat dan update profil sendiri
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (id_user = auth.uid());

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (id_user = auth.uid());

-- 3. Policies untuk tabel RUANGAN
-- Semua user dapat melihat ruangan (untuk booking)
CREATE POLICY "Everyone can view rooms" ON ruangan
  FOR SELECT USING (true);

-- Admin dapat mengelola ruangan
CREATE POLICY "Admin can manage rooms" ON ruangan
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id_user = auth.uid() 
      AND u.role = 'admin'
    )
  );

-- 4. Policies untuk tabel KENDARAAN
-- Semua user dapat melihat kendaraan (untuk booking)
CREATE POLICY "Everyone can view vehicles" ON kendaraan
  FOR SELECT USING (true);

-- Admin dapat mengelola kendaraan
CREATE POLICY "Admin can manage vehicles" ON kendaraan
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id_user = auth.uid() 
      AND u.role = 'admin'
    )
  );

-- 5. Policies untuk tabel PEMINJAMAN
-- Semua user dapat melihat peminjaman (untuk kalender publik)
CREATE POLICY "Everyone can view bookings" ON peminjaman
  FOR SELECT USING (true);

-- User dapat membuat peminjaman sendiri
CREATE POLICY "Users can create own bookings" ON peminjaman
  FOR INSERT WITH CHECK (id_user = auth.uid());

-- User dapat melihat dan update peminjaman sendiri
CREATE POLICY "Users can update own bookings" ON peminjaman
  FOR UPDATE USING (id_user = auth.uid());

-- Admin dan petugas dapat mengelola semua peminjaman
CREATE POLICY "Admin and staff can manage all bookings" ON peminjaman
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id_user = auth.uid() 
      AND u.role IN ('admin', 'petugas')
    )
  );

-- 6. Policies untuk tabel LOG_PENGGUNAAN
-- Admin dan petugas dapat melihat semua log
CREATE POLICY "Admin and staff can view all logs" ON log_penggunaan
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id_user = auth.uid() 
      AND u.role IN ('admin', 'petugas')
    )
  );

-- Petugas dapat membuat log penggunaan
CREATE POLICY "Staff can create logs" ON log_penggunaan
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id_user = auth.uid() 
      AND u.role = 'petugas'
    )
  );

-- Admin dan petugas dapat update log
CREATE POLICY "Admin and staff can update logs" ON log_penggunaan
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id_user = auth.uid() 
      AND u.role IN ('admin', 'petugas')
    )
  );

-- 7. Policy untuk akses anonim (public access)
-- Untuk kalender publik, buat policy khusus yang memungkinkan akses tanpa auth
CREATE POLICY "Public can view bookings for calendar" ON peminjaman
  FOR SELECT USING (true);

CREATE POLICY "Public can view rooms for calendar" ON ruangan
  FOR SELECT USING (true);

CREATE POLICY "Public can view vehicles for calendar" ON kendaraan
  FOR SELECT USING (true);

-- 8. Function untuk mendapatkan user role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role FROM users 
    WHERE id_user = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Function untuk check admin access
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role = 'admin' FROM users 
    WHERE id_user = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Function untuk check staff access
CREATE OR REPLACE FUNCTION is_staff()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role IN ('admin', 'petugas') FROM users 
    WHERE id_user = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Trigger untuk update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger ke semua tabel
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ruangan_updated_at BEFORE UPDATE ON ruangan
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kendaraan_updated_at BEFORE UPDATE ON kendaraan
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_peminjaman_updated_at BEFORE UPDATE ON peminjaman
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_log_penggunaan_updated_at BEFORE UPDATE ON log_penggunaan
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 12. Grant permissions untuk anonymous access (untuk kalender publik)
-- Ini memungkinkan akses tanpa login untuk melihat data
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON peminjaman TO anon;
GRANT SELECT ON ruangan TO anon;
GRANT SELECT ON kendaraan TO anon;
GRANT SELECT ON users TO anon;

-- 13. Grant permissions untuk authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Selesai! RLS policies telah dikonfigurasi dengan benar.
-- Struktur keamanan:
-- - Public: Dapat melihat kalender dan data dasar
-- - Mahasiswa/Dosen: Dapat membuat dan mengelola booking sendiri
-- - Petugas: Dapat mengelola semua booking dan membuat log
-- - Admin: Akses penuh ke semua data dan fungsi