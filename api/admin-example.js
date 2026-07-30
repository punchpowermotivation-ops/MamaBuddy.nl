import { createClient } from '@supabase/supabase-js';

// Server-side only: this file runs as a Vercel serverless function and never
// ships to the browser bundle, so it's safe to read the service role key here.
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
);

export default async function handler(req, res) {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.status(200).json({ userCount: data.users.length });
}
