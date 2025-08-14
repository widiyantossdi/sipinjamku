-- Storage Setup Sederhana untuk Sistem Peminjaman UNUGHA
-- Jalankan script ini di Supabase SQL Editor
-- Versi yang menghindari error permission

-- 1. Buat bucket untuk dokumen pendukung
-- Jalankan di Supabase Dashboard > Storage > Create Bucket
-- Nama bucket: documents
-- Public: false (unchecked)
-- File size limit: 10MB
-- Allowed MIME types: application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, image/jpeg, image/png

-- ATAU gunakan SQL berikut (jika memiliki permission):
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES (
--   'documents', 
--   'documents', 
--   false, 
--   10485760, -- 10MB
--   ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png']
-- );

-- 2. Policy untuk bucket documents (jalankan satu per satu)
-- Hapus policy yang sudah ada terlebih dahulu jika perlu

-- Hapus policy lama jika ada
DROP POLICY IF EXISTS "Authenticated users can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own documents" ON storage.objects;
DROP POLICY IF EXISTS "Admin and staff can view all documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own documents" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete all documents" ON storage.objects;

-- Policy 1: Authenticated users dapat upload file
CREATE POLICY "Authenticated users can upload documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documents' AND
    auth.role() = 'authenticated'
  );

-- Policy 2: Users dapat melihat file mereka sendiri
CREATE POLICY "Users can view own documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy 3: Admin dan petugas dapat melihat semua dokumen
CREATE POLICY "Admin and staff can view all documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents' AND
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id_user = auth.uid() 
      AND u.role IN ('admin', 'petugas')
    )
  );

-- Policy 4: Users dapat update file mereka sendiri
CREATE POLICY "Users can update own documents" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy 5: Users dapat delete file mereka sendiri
CREATE POLICY "Users can delete own documents" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy 6: Admin dapat delete semua dokumen
CREATE POLICY "Admin can delete all documents" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'documents' AND
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id_user = auth.uid() 
      AND u.role = 'admin'
    )
  );

-- 3. Fungsi helper untuk mendapatkan URL file
CREATE OR REPLACE FUNCTION get_document_url(file_path text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (SELECT storage.url('documents', file_path));
END;
$$;

-- 4. Grant permissions
GRANT EXECUTE ON FUNCTION get_document_url(text) TO authenticated;

-- LANGKAH MANUAL DI SUPABASE DASHBOARD:
-- 1. Buka Supabase Dashboard
-- 2. Pergi ke Storage
-- 3. Klik "Create Bucket"
-- 4. Nama: documents
-- 5. Public: false (jangan dicentang)
-- 6. File size limit: 10485760 (10MB)
-- 7. Allowed MIME types: 
--    - application/pdf
--    - application/msword
--    - application/vnd.openxmlformats-officedocument.wordprocessingml.document
--    - image/jpeg
--    - image/png
-- 8. Klik Create

-- Setelah bucket dibuat, jalankan policy SQL di atas satu per satu

-- CATATAN PENTING:
-- - Jika masih ada error permission, buat bucket secara manual di Dashboard
-- - Policy akan otomatis diterapkan setelah bucket dibuat
-- - File akan disimpan dengan format: {user_id}_{timestamp}.{extension}
-- - Maksimal ukuran file: 10MB
-- - Format yang diizinkan: PDF, DOC, DOCX, JPG, PNG

-- TROUBLESHOOTING:
-- Jika muncul error "policy already exists", jalankan DROP POLICY terlebih dahulu
-- Jika muncul error "must be owner", buat bucket manual di Dashboard
-- Jika upload gagal, pastikan bucket sudah dibuat dan policy sudah aktif