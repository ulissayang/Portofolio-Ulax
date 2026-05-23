import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Fail fast dengan pesan jelas jika env vars tidak ada
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '[Supabase] VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY wajib diisi di file .env\n' +
    'Salin .env.example ke .env lalu isi nilainya.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Simpan sesi di localStorage agar tidak logout saat refresh
    persistSession: true,
    // Auto refresh token sebelum expired
    autoRefreshToken: true,
    // Deteksi URL callback untuk reset password via email
    detectSessionInUrl: true,
  },
});
