import { createClient } from '@supabase/supabase-js';

// Files under api/_lib/ are not treated as routes by Vercel — safe place
// for the service-role client shared between the admin endpoints.
const ADMIN_EMAIL = 'punchpowermotivation@gmail.com';

export const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
);

// Verifies the caller's Supabase session token and checks it belongs to
// the single admin account. Returns the user on success, null otherwise —
// callers respond 401 on null rather than leaking why.
export async function requireAdmin(req) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  if (!token) return null;

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) return null;
  if (data.user.email?.toLowerCase() !== ADMIN_EMAIL) return null;

  return data.user;
}
