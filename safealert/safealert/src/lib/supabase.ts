import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// We deliberately don't throw at import time so the app can still render a
// helpful "not configured" screen instead of a blank white page.
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Fall back to harmless placeholder values so createClient never throws;
// isSupabaseConfigured gates all real usage.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);
