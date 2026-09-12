const SUPABASE_URL = 'https://tcmhqeuwiofzfmrikowh.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_Tp5NB8fPzFCzjfGCKoeScQ_nhMkcYFO';

if (!window.supabase) throw new Error('Supabase JS belum termuat.');

window.EA_SUPABASE = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);
