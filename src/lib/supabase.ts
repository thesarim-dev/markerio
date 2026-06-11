import { createClient } from '@supabase/supabase-js';

function readEnv(name: 'VITE_SUPABASE_URL' | 'VITE_SUPABASE_ANON_KEY'): string {
  const raw = import.meta.env[name];
  const value = typeof raw === 'string' ? raw.trim() : '';
  if (!value || value.includes('your-project') || value.includes('your-publishable')) {
    throw new Error(
      `Missing or placeholder ${name}. Set it in .env.local (dev) or Vercel env vars (prod), then rebuild.`
    );
  }
  return value;
}

export const supabaseUrl = readEnv('VITE_SUPABASE_URL');
export const supabaseAnonKey = readEnv('VITE_SUPABASE_ANON_KEY');

try {
  const parsed = new URL(supabaseUrl);
  if (!parsed.protocol.startsWith('http')) {
    throw new Error('URL must start with https://');
  }
} catch {
  throw new Error(
    `Invalid VITE_SUPABASE_URL "${supabaseUrl}". Use https://your-project-ref.supabase.co`
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});
