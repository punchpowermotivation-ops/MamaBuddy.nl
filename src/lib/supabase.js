import { createClient } from '@supabase/supabase-js';

// persistSession + autoRefreshToken zorgen dat een geïnstalleerde PWA nooit
// opnieuw hoeft in te loggen: de sessie leeft in localStorage, dat gedeeld
// wordt tussen de browsertab en de "Zet op beginscherm"-app op hetzelfde toestel.
// Let op: gebruik hier NOOIT een custom storageKey — dat wijzigt de
// localStorage-sleutel en logt alle bestaande sessies (incl. jezelf) uit.
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);
