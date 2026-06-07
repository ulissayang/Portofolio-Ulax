-- ============================================================
-- Portfolio Ulis Leuwol - Supabase Schema
-- Jalankan di Supabase SQL Editor
-- ============================================================

-- 1. Hero / Beranda
CREATE TABLE IF NOT EXISTS portfolio_hero (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name text,
  tagline text,
  bio text,
  email text,
  phone text,
  location text,
  degree text,
  gpa text,
  avatar_initials text DEFAULT 'UL',
  brand_name text DEFAULT 'ULIS.',
  brand_suffix text DEFAULT 'PORTFOLIO',
  created_at timestamptz DEFAULT now()
);

-- 2. About / Tentang
CREATE TABLE IF NOT EXISTS portfolio_about (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  description text,
  motto text,
  motto_detail text,
  cta_title text,
  cta_description text,
  created_at timestamptz DEFAULT now()
);

-- 3. Experiences / Pengalaman Kerja
CREATE TABLE IF NOT EXISTS portfolio_experiences (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  company text,
  period text,
  description text,
  tasks text[] DEFAULT '{}',
  color text DEFAULT '#3b82f6',
  sort_order integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- 4. Achievements / Pencapaian
CREATE TABLE IF NOT EXISTS portfolio_achievements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  year text,
  title text NOT NULL,
  description text,
  project_title text,
  project_description text,
  tags text[] DEFAULT '{}',
  sort_order integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- 5. Educations / Pendidikan
CREATE TABLE IF NOT EXISTS portfolio_educations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  degree text NOT NULL,
  institution text,
  period text,
  gpa text,
  grade text,
  color text DEFAULT '#2563eb',
  sort_order integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- 6. Certifications / Sertifikasi & Pelatihan
CREATE TABLE IF NOT EXISTS portfolio_certifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  group_name text,
  type text DEFAULT 'certification', -- 'certification' | 'training'
  institution text,
  date_label text,
  sort_order integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- 7. Skills / Keterampilan
CREATE TABLE IF NOT EXISTS portfolio_skills (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  sort_order integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================
ALTER TABLE portfolio_hero ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_about ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_educations ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_skills ENABLE ROW LEVEL SECURITY;

-- Public: bisa baca semua (untuk halaman portfolio)
CREATE POLICY "Public read hero" ON portfolio_hero FOR SELECT USING (true);
CREATE POLICY "Public read about" ON portfolio_about FOR SELECT USING (true);
CREATE POLICY "Public read experiences" ON portfolio_experiences FOR SELECT USING (true);
CREATE POLICY "Public read achievements" ON portfolio_achievements FOR SELECT USING (true);
CREATE POLICY "Public read educations" ON portfolio_educations FOR SELECT USING (true);
CREATE POLICY "Public read certifications" ON portfolio_certifications FOR SELECT USING (true);
CREATE POLICY "Public read skills" ON portfolio_skills FOR SELECT USING (true);

-- Authenticated: bisa insert/update/delete (untuk admin)
CREATE POLICY "Auth write hero" ON portfolio_hero FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth write about" ON portfolio_about FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth write experiences" ON portfolio_experiences FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth write achievements" ON portfolio_achievements FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth write educations" ON portfolio_educations FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth write certifications" ON portfolio_certifications FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth write skills" ON portfolio_skills FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- Seed Data (Data Awal dari CV Ulis Leuwol)
-- ============================================================

-- Hero
INSERT INTO portfolio_hero (full_name, tagline, bio, email, phone, location, degree, gpa, avatar_initials, brand_name, brand_suffix)
VALUES (
  'Ulis Leuwol',
  'IT Professional & Data Administrator',
  'Mencari solusi yang efisien, praktis, dan bermanfaat melalui teknologi dan pengelolaan data yang baik.',
  'ulissleksmart@gmail.com',
  '0852 8035 7433',
  'Haria, Saparua',
  'S1 Teknik Informatika',
  '3.99',
  'UL',
  'ULIS.',
  'PORTFOLIO'
);

-- About
INSERT INTO portfolio_about (description, motto, motto_detail, cta_title, cta_description)
VALUES (
  'Saya adalah pribadi yang memiliki semangat belajar tinggi, terbuka terhadap hal baru, dan selalu berusaha memberikan hasil terbaik dalam setiap pekerjaan. Saya menyukai tantangan yang dapat mengembangkan kemampuan diri serta memiliki komitmen kuat terhadap tanggung jawab dan profesionalitas.',
  'Kalau bisa dipermudah, kenapa harus dipersulit?',
  'Prinsip saya dalam bekerja adalah mencari solusi yang efisien, praktis, dan bermanfaat.',
  'Tertarik untuk bekerja sama?',
  'Saya selalu terbuka untuk mendiskusikan peluang baru, proyek, atau kolaborasi yang dapat memberikan dampak positif.'
);

-- Experiences
INSERT INTO portfolio_experiences (title, company, period, description, tasks, color, sort_order) VALUES
('Pengelola Fasilitas Umum', 'MagangHub Kemnaker - Lapas Kelas III Saparua', '24 Nov 2025 - 24 Mei 2026', NULL,
 ARRAY['Menyiapkan sarana pendukung kegiatan umum seperti ruang rapat, kendaraan, dan logistik.','Memantau penggunaan fasilitas agar efisien.','Mengatur perawatan rutin fasilitas umum.','Membantu kebutuhan operasional kantor.'],
 '#6366f1', 1),
('Admin Sektor - MSIPT & Website Gereja', 'Gereja Protestan Maluku - Halong Anugerah', 'Januari 2025 - Sekarang',
 'Bertanggung jawab dalam pengelolaan data jemaat melalui sistem informasi pelayanan terpadu berbasis web.',
 ARRAY['Pembaruan data jemaat yang telah ada serta penambahan data baru secara berkala.','Memastikan akurasi, kelengkapan, dan keterkinian informasi.','Melaksanakan validasi data dan koordinasi lintas sektor.'],
 '#3b82f6', 2),
('Freelance Admin Data Processor', 'KSOP Kelas I Ambon (Remote)', 'Oktober 2021 - Sekarang',
 'Dipercaya secara pribadi untuk melanjutkan tugas pengolahan data dan penyusunan laporan bulanan secara remote berdasarkan kinerja saat KKP.',
 ARRAY['Mengunduh data dari website SPS Inapornet Kemenhub.','Mengolah data aktivitas bongkar muat barang berbahaya & pengisian bahan bakar kapal.','Menginput data ke MS Excel dan menyusun laporan bulanan.'],
 '#14b8a6', 3),
('Administrasi - KKP', 'KSOP Kelas I Ambon', 'Juli 2021 - September 2021',
 'Kuliah Kerja Praktek (KKP). Bertugas mengambil data dari website SPS Inapornet milik Kementerian Perhubungan, mencetak, serta menginput data ke dalam Excel untuk disusun menjadi laporan bulanan.',
 ARRAY[]::text[], '#94a3b8', 4);

-- Achievements
INSERT INTO portfolio_achievements (year, title, description, project_title, project_description, tags, sort_order) VALUES
('Tahun 2025', 'Lulus BEKUP Create: Upskilling Bootcamp 2025',
 'Menyelesaikan Upskilling Bootcamp BEKUP Create 2025 yang diinisiasi oleh <strong>Badan Ekonomi Kreatif (BEKRAF)</strong> dan <strong>Dicoding Indonesia</strong>. Mempelajari pengembangan aplikasi menggunakan Flutter serta mengasah soft skill penting seperti personal productivity, critical thinking, dan effective communication.',
 'Proyek Akhir: "Jejak Cerita Rakyat"',
 'Aplikasi edukatif berbasis Flutter yang bertujuan mengenalkan kembali cerita rakyat Indonesia kepada anak-anak. Dilengkapi dengan <strong>fitur text-to-speech yang ramah disabilitas</strong>.',
 ARRAY['Flutter','Mobile Development','Text-to-Speech API','Team Collaboration'], 1);

-- Educations
INSERT INTO portfolio_educations (degree, institution, period, gpa, grade, color, sort_order) VALUES
('S1 Teknik Informatika', 'Institut Teknologi dan Bisnis STIKOM Ambon', '2020 - 2025', '3.99', NULL, '#2563eb', 1),
('SMA Nambuasa Tulehu', 'Jurusan Ilmu Pengetahuan Alam (IPA)', '2016 - 2018', NULL, '90', '#94a3b8', 2);

-- Certifications
INSERT INTO portfolio_certifications (title, group_name, type, institution, date_label, sort_order) VALUES
('Belajar Penggunaan Generative AI', 'Sertifikasi Dicoding', 'certification', NULL, 'Sep 2025', 1),
('Belajar Dasar AI', 'Sertifikasi Dicoding', 'certification', NULL, 'Sep 2025 - Sep 2028', 2),
('AI Praktis untuk Produktivitas', 'Sertifikasi Dicoding', 'certification', NULL, 'Mei 2025 - Mei 2028', 3),
('Advance Microsoft Excel', 'Pelatihan Kampus', 'training', 'ITB STIKOM Ambon', 'Juni 2022', 4),
('Merakit Dan Instalasi PC', 'Pelatihan Kampus', 'training', 'ITB STIKOM Ambon', 'Desember 2021', 5);

-- Skills
INSERT INTO portfolio_skills (name, sort_order) VALUES
('Problem Solving', 1), ('Microsoft Excel', 2), ('Microsoft Word', 3),
('Microsoft PowerPoint', 4), ('Microsoft Office', 5), ('Data Entry', 6),
('Menggunakan Komputer', 7), ('Installation System Operasi Windows', 8),
('Installation Software', 9), ('Menunjukkan komitmen', 10);
