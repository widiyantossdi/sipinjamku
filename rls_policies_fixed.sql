-- RLS Policies untuk Sistem Peminjaman UNUGHA (FIXED VERSION)
-- Jalankan script ini di Supabase SQL Editor untuk mengganti policies yang bermasalah

-- 1. Drop existing policies yang bermasalah
DROP POLICY IF EXISTS "Admin can view all users" ON users;
DROP POLICY IF EXISTS "Admin can insert users" ON users;
DROP POLICY IF EXISTS "Admin can update users" ON users;
DROP POLICY IF EXISTS "Admin can delete users" ON users;
DROP POLICY IF EXISTS "Admin can manage rooms" ON ruangan;
DROP POLICY IF EXISTS "Admin can manage vehicles" ON kendaraan;
DROP POLICY IF EXISTS "Admin and staff can manage all bookings" ON peminjaman;
DROP POLICY IF EXISTS "Admin and staff can view all logs" ON log_penggunaan;
DROP POLICY IF EXISTS "Staff can create logs" ON log_penggunaan;
DROP POLICY IF EXISTS "Admin and staff can update logs" ON log_penggunaan;

-- 2. Create functions untuk check role (tanpa recursion)
CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(
    (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()),
    'mahasiswa'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.user_role() = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auth.is_staff()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.user_role() IN ('admin', 'petugas');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Fixed Policies untuk tabel USERS
-- Admin dapat melihat dan mengelola semua user
CREATE POLICY "Admin can view all users" ON users
  FOR SELECT USING (auth.is_admin());

CREATE POLICY "Admin can insert users" ON users
  FOR INSERT WITH CHECK (auth.is_admin());

CREATE POLICY "Admin can update users" ON users
  FOR UPDATE USING (auth.is_admin());

CREATE POLICY "Admin can delete users" ON users
  FOR DELETE USING (auth.is_admin());

-- User dapat melihat dan update profil sendiri
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (id_user = auth.uid());

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (id_user = auth.uid());

-- 4. Fixed Policies untuk tabel RUANGAN
-- Semua user dapat melihat ruangan (untuk booking)
CREATE POLICY "Everyone can view rooms" ON ruangan
  FOR SELECT USING (true);

-- Admin dapat mengelola ruangan
CREATE POLICY "Admin can manage rooms" ON ruangan
  FOR ALL USING (auth.is_admin());

-- 5. Fixed Policies untuk tabel KENDARAAN
-- Semua user dapat melihat kendaraan (untuk booking)
CREATE POLICY "Everyone can view vehicles" ON kendaraan
  FOR SELECT USING (true);

-- Admin dapat mengelola kendaraan
CREATE POLICY "Admin can manage vehicles" ON kendaraan
  FOR ALL USING (auth.is_admin());

-- 6. Fixed Policies untuk tabel PEMINJAMAN
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
  FOR ALL USING (auth.is_staff());

-- 7. Fixed Policies untuk tabel LOG_PENGGUNAAN
-- Admin dan petugas dapat melihat semua log
CREATE POLICY "Admin and staff can view all logs" ON log_penggunaan
  FOR SELECT USING (auth.is_staff());

-- Petugas dapat membuat log penggunaan
CREATE POLICY "Staff can create logs" ON log_penggunaan
  FOR INSERT WITH CHECK (auth.is_staff());

-- Admin dan petugas dapat update log
CREATE POLICY "Admin and staff can update logs" ON log_penggunaan
  FOR UPDATE USING (auth.is_staff());

-- 8. Policy untuk akses anonim (public access)
-- Untuk kalender publik, buat policy khusus yang memungkinkan akses tanpa auth
CREATE POLICY "Public can view bookings for calendar" ON peminjaman
  FOR SELECT USING (true);

CREATE POLICY "Public can view rooms for calendar" ON ruangan
  FOR SELECT USING (true);

CREATE POLICY "Public can view vehicles for calendar" ON kendaraan
  FOR SELECT USING (true);

-- 9. Trigger untuk update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger ke semua tabel
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_ruangan_updated_at ON ruangan;
DROP TRIGGER IF EXISTS update_kendaraan_updated_at ON kendaraan;
DROP TRIGGER IF EXISTS update_peminjaman_updated_at ON peminjaman;
DROP TRIGGER IF EXISTS update_log_penggunaan_updated_at ON log_penggunaan;

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

-- 10. Grant permissions untuk anonymous access (untuk kalender publik)
-- Ini akan diatur di Supabase dashboard untuk anonymous users

-- CATATAN PENTING:
-- 1. Jalankan script ini di Supabase SQL Editor
-- 2. Pastikan user sudah memiliki field 'role' di auth.users.raw_user_meta_data
-- 3. Atau gunakan tabel users terpisah dengan foreign key ke auth.users
-- 4. Test semua functionality setelah menjalankan script ini