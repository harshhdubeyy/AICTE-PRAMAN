import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Read configuration from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('your-project-id') &&
    !supabaseAnonKey.includes('your-anon-key')
  );
};

// Global fallback flag: if Supabase is not configured or network fails, gracefully use seed data
let _useSeedData: boolean = !isSupabaseConfigured();

export const getUseSeedData = (): boolean => _useSeedData;
export const setUseSeedData = (val: boolean) => {
  _useSeedData = val;
};

// Create client safely so app never crashes if env vars are unset
export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;
