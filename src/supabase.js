/* EA PLAN — Supabase bootstrap.
 * Credentials are provided at runtime by /api/config on Vercel.
 * For local/static testing you may set window.EA_SUPABASE_URL and window.EA_SUPABASE_ANON_KEY.
 */
window.EA_SUPABASE_READY = (async () => {
  let cfg = {};
  try {
    const r = await fetch('/api/config', { cache: 'no-store' });
    if (r.ok) cfg = await r.json();
  } catch (_) {}
  const url = cfg.url || window.EA_SUPABASE_URL;
  const key = cfg.anonKey || window.EA_SUPABASE_ANON_KEY;
  if (!url || !key || !window.supabase) return null;
  window.EA_SUPABASE = window.supabase.createClient(url, key, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });
  return window.EA_SUPABASE;
})();
