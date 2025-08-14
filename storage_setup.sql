-- Storage Setup untuk Sistem Peminjaman UNUGHA
-- Jalankan script ini di Supabase SQL Editor

-- 1. Buat bucket untuk dokumen pendukung
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false);

-- 2. Policy untuk bucket documents
-- Authenticated users dapat upload file
CREATE POLICY "Authenticated users can upload documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documents' AND
    auth.role() = 'authenticated'
  );

-- Users dapat melihat file mereka sendiri
CREATE POLICY "Users can view own documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Admin dan petugas dapat melihat semua dokumen
CREATE POLICY "Admin and staff can view all documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents' AND
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id_user = auth.uid() 
      AND u.role IN ('admin', 'petugas')
    )
  );

-- Users dapat update file mereka sendiri
CREATE POLICY "Users can update own documents" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users dapat delete file mereka sendiri
CREATE POLICY "Users can delete own documents" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Admin dapat delete semua dokumen
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

-- 5. Catatan: RLS untuk storage sudah diaktifkan secara default di Supabase
-- Tidak perlu menjalankan ALTER TABLE untuk storage.objects dan storage.buckets
-- karena memerlukan superuser privileges

-- Policy untuk bucket access (opsional, biasanya sudah ada default policy)
-- CREATE POLICY "Public bucket access" ON storage.buckets
--   FOR SELECT USING (true);

-- CREATE POLICY "Authenticated users can access documents bucket" ON storage.buckets
--   FOR SELECT USING (
--     id = 'documents' AND
--     auth.role() = 'authenticated'
--   );

-- Catatan:
-- 1. Bucket 'documents' dibuat dengan public = false untuk keamanan
-- 2. Hanya authenticated users yang dapat upload
-- 3. Users hanya dapat melihat file mereka sendiri
-- 4. Admin dan petugas dapat melihat semua dokumen
-- 5. File disimpan dengan format: {user_id}_{timestamp}.{extension}
-- 6. Maksimal ukuran file: 10MB (dikontrol di frontend)
-- 7. Format file yang diizinkan: PDF, DOC, DOCX, JPG, PNG (dikontrol di frontend)