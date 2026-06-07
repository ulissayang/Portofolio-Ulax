-- ============================================================
-- Update Schema v3
-- 1. Tabel portfolio_projects (baru)
-- 2. Kolom category di portfolio_skills
-- 3. Kolom github_url, linkedin_url, cv_url di portfolio_hero
-- ============================================================

-- Tambah kolom sosial & CV di hero
ALTER TABLE portfolio_hero
  ADD COLUMN IF NOT EXISTS github_url text,
  ADD COLUMN IF NOT EXISTS linkedin_url text,
  ADD COLUMN IF NOT EXISTS cv_url text;

-- Tambah kolom category di skills
ALTER TABLE portfolio_skills
  ADD COLUMN IF NOT EXISTS category text DEFAULT 'Lainnya';

-- Update kategori skills yang sudah ada (sesuaikan nama jika berbeda)
UPDATE portfolio_skills SET category = 'Office' WHERE name IN ('Microsoft Excel','Microsoft Word','Microsoft PowerPoint','Microsoft Office');
UPDATE portfolio_skills SET category = 'Soft Skill' WHERE name IN ('Problem Solving','Menunjukkan komitmen');
UPDATE portfolio_skills SET category = 'Tools' WHERE name IN ('Menggunakan Komputer','Installation System Operasi Windows','Installation Software','Data Entry');

-- Tambah skills teknis baru (hapus dulu jika sudah ada)
INSERT INTO portfolio_skills (name, category, sort_order) VALUES
('React / Vite', 'Frontend', 11),
('Tailwind CSS', 'Frontend', 12),
('HTML / CSS / JavaScript', 'Frontend', 13),
('Supabase', 'Backend', 14),
('Google Apps Script', 'Backend', 15),
('PostgreSQL', 'Database', 16),
('Cloudflare Pages', 'Tools', 17),
('Cloudflare R2', 'Tools', 18),
('Git', 'Tools', 19),
('REST API', 'Backend', 20)
ON CONFLICT DO NOTHING;

-- Tabel proyek baru
CREATE TABLE IF NOT EXISTS portfolio_projects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  category text,
  description text,
  tech_stack text[] DEFAULT '{}',
  demo_url text,
  github_url text,
  image_url text,
  status text DEFAULT 'Selesai', -- 'Aktif' | 'Selesai' | 'Arsip'
  sort_order integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- RLS untuk tabel baru
ALTER TABLE portfolio_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read projects" ON portfolio_projects FOR SELECT USING (true);
CREATE POLICY "Auth write projects" ON portfolio_projects FOR ALL USING (auth.role() = 'authenticated');

-- Seed: contoh proyek dari pengalaman Ulis
INSERT INTO portfolio_projects (title, category, description, tech_stack, demo_url, status, sort_order) VALUES
(
  'SiPegawai - Sistem Informasi Pegawai',
  'Web App',
  'Sistem informasi manajemen data pegawai Lapas Kelas III Saparua. Fitur: login NIP, upload dokumen ke R2, ZIP backup, admin dashboard.',
  ARRAY['HTML','CSS','JavaScript','Supabase','Cloudflare R2','Cloudflare Pages'],
  NULL, 'Aktif', 1
),
(
  'SiKunjung - Sistem Informasi Kunjungan',
  'Web App',
  'Sistem manajemen kunjungan dan titipan barang. Fitur: lookup NIK, auto queue, QR code, KTP OCR, admin scan.',
  ARRAY['HTML','CSS','JavaScript','Supabase','Tesseract.js'],
  NULL, 'Aktif', 2
),
(
  'Sistem Penomoran Surat',
  'Web App',
  'Aplikasi penomoran surat otomatis berbasis Google Apps Script dengan 83 klasifikasi sesuai regulasi Kemenkumham.',
  ARRAY['Google Apps Script','Google Sheets'],
  NULL, 'Aktif', 3
),
(
  'LIB-LAPAS - Perpustakaan Digital',
  'Web App',
  'Sistem perpustakaan digital dengan katalog buku publik, manajemen peminjaman, stok otomatis, dan integrasi foto Cloudinary.',
  ARRAY['HTML','Tailwind CSS','JavaScript','Supabase','Cloudinary'],
  NULL, 'Selesai', 4
);
