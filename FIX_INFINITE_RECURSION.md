# Fix untuk Error: Infinite Recursion Detected in Policy for Relation "users"

## Masalah
Error `infinite recursion detected in policy for relation "users"` terjadi karena RLS policies yang mengecek role admin menggunakan query ke tabel `users` itu sendiri, menyebabkan loop tak terbatas.

## Penyebab
Di file `rls_policies.sql`, semua policy menggunakan pattern:
```sql
EXISTS (SELECT 1 FROM users u WHERE u.id_user = auth.uid() AND u.role = 'admin')
```

Ketika policy ini dijalankan pada tabel `users`, PostgreSQL mencoba mengecek permission untuk mengakses tabel `users`, yang memicu policy yang sama, dan seterusnya.

## Solusi

### 1. Jalankan Script Fix
Jalankan file `rls_policies_fixed.sql` di Supabase SQL Editor untuk mengganti policies yang bermasalah.

### 2. Pendekatan yang Digunakan
- **Menggunakan `auth.users.raw_user_meta_data`**: Mengambil role dari metadata user Supabase Auth, bukan dari tabel `users` custom
- **Function Helper**: Membuat function `auth.user_role()`, `auth.is_admin()`, dan `auth.is_staff()` untuk menghindari recursion
- **Security Definer**: Function dibuat dengan `SECURITY DEFINER` agar dapat mengakses `auth.users`

### 3. Struktur Fix

#### Function Helper:
```sql
CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(
    (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()),
    'mahasiswa'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### Policy Baru:
```sql
CREATE POLICY "Admin can view all users" ON users
  FOR SELECT USING (auth.is_admin());
```

### 4. Langkah Implementasi

1. **Backup Database** (opsional tapi disarankan)
2. **Jalankan `rls_policies_fixed.sql`** di Supabase SQL Editor
3. **Update User Metadata** untuk memastikan setiap user memiliki role di `raw_user_meta_data`
4. **Test Aplikasi** untuk memastikan semua functionality bekerja

### 5. Verifikasi Role di Supabase Auth

Pastikan setiap user di Supabase Auth memiliki metadata role:
```json
{
  "role": "admin"
}
```

Atau:
```json
{
  "role": "petugas"
}
```

Atau:
```json
{
  "role": "mahasiswa"
}
```

### 6. Alternative: Menggunakan Custom Claims

Jika Anda ingin menggunakan custom claims JWT, bisa menggunakan:
```sql
CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(
    auth.jwt() ->> 'role',
    'mahasiswa'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 7. Testing

Setelah menjalankan fix:
1. Login sebagai admin - harus bisa mengakses semua fitur
2. Login sebagai petugas - harus bisa mengakses booking dan logs
3. Login sebagai mahasiswa - harus bisa melihat dan membuat booking sendiri
4. Tidak boleh ada error "infinite recursion"

### 8. Rollback (jika diperlukan)

Jika ada masalah, Anda bisa rollback dengan:
```sql
-- Drop semua policies
DROP POLICY IF EXISTS "Admin can view all users" ON users;
-- ... dst

-- Drop functions
DROP FUNCTION IF EXISTS auth.user_role();
DROP FUNCTION IF EXISTS auth.is_admin();
DROP FUNCTION IF EXISTS auth.is_staff();

-- Kemudian jalankan ulang rls_policies.sql yang asli
```

## Catatan Penting

- **Backup**: Selalu backup database sebelum menjalankan perubahan besar
- **Testing**: Test semua role dan functionality setelah implementasi
- **Monitoring**: Monitor logs untuk memastikan tidak ada error baru
- **Documentation**: Update dokumentasi API jika ada perubahan behavior

## Kontak

Jika ada masalah dengan implementasi fix ini, silakan hubungi tim development.