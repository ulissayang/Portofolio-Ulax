-- ============================================================
-- Update Schema v2 - Jalankan di Supabase SQL Editor
-- Tambah kolom demo_url dan certificate_url
-- ============================================================

-- Tambah demo_url ke tabel achievements
ALTER TABLE portfolio_achievements
  ADD COLUMN IF NOT EXISTS demo_url text;

-- Tambah certificate_url ke tabel certifications
ALTER TABLE portfolio_certifications
  ADD COLUMN IF NOT EXISTS certificate_url text;
