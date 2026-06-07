-- ============================================================
-- Update Schema v4
-- Tambah kolom visible (toggle tampil/sembunyi) di semua tabel
-- ============================================================

-- Tambah kolom visible ke semua tabel konten
ALTER TABLE portfolio_experiences    ADD COLUMN IF NOT EXISTS visible boolean DEFAULT true;
ALTER TABLE portfolio_achievements   ADD COLUMN IF NOT EXISTS visible boolean DEFAULT true;
ALTER TABLE portfolio_projects       ADD COLUMN IF NOT EXISTS visible boolean DEFAULT true;
ALTER TABLE portfolio_educations     ADD COLUMN IF NOT EXISTS visible boolean DEFAULT true;
ALTER TABLE portfolio_certifications ADD COLUMN IF NOT EXISTS visible boolean DEFAULT true;
ALTER TABLE portfolio_skills         ADD COLUMN IF NOT EXISTS visible boolean DEFAULT true;

-- Tambah tabel pengaturan tampilan section di halaman publik
CREATE TABLE IF NOT EXISTS portfolio_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL DEFAULT 'true',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE portfolio_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read settings" ON portfolio_settings FOR SELECT USING (true);
CREATE POLICY "Auth write settings" ON portfolio_settings FOR ALL USING (auth.role() = 'authenticated');

-- Seed default settings (section visibility)
INSERT INTO portfolio_settings (key, value) VALUES
  ('show_about',          'true'),
  ('show_experience',     'true'),
  ('show_projects',       'true'),
  ('show_achievements',   'true'),
  ('show_education',      'true'),
  ('show_certifications', 'true'),
  ('show_skills',         'true')
ON CONFLICT (key) DO NOTHING;
