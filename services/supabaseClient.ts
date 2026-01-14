
import { createClient } from '@supabase/supabase-js';

// Configuration updated with user provided credentials and fallbacks
// Explicitly checking for undefined to avoid empty string initialization
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yfonvupbhrspivjvhewu.supabase.co'; 
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || 'sb_publishable_9_pG5vF8kVnIjW0LhRO2-Q_NfZMI9JF';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn("Supabase credentials missing. Database features will fail.");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
