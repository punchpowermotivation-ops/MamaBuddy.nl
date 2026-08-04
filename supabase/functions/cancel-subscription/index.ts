import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MOLLIE_API_KEY = Deno.env.get('MOLLIE_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

const MOLLIE_API = 'https://api.mollie.com/v2';

async function mollieFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${MOLLIE_API}${path}`, {
    ...options,
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${MOLLIE_API_KEY}`,
      ...(options.headers ?? {}),
    },
  });
  if (res.status === 204) return null;
  const json = await res.json();
  if (!res.ok) throw new Error(`Mollie API error ${res.status}: ${JSON.stringify(json)}`);
  return json;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: 'Niet ingelogd.' }), {
        status: 401,
        headers: { ...corsHeaders, 'content-type': 'application/json' },
      });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('mollie_customer_id, mollie_subscription_id, subscription_until')
      .eq('id', user.id)
      .single();
    if (profileError) throw profileError;

    if (!profile.mollie_subscription_id) {
      return new Response(JSON.stringify({ error: 'Geen actief abonnement gevonden.' }), {
        status: 400,
        headers: { ...corsHeaders, 'content-type': 'application/json' },
      });
    }

    if (profile.mollie_customer_id) {
      try {
        await mollieFetch(
          `/customers/${profile.mollie_customer_id}/subscriptions/${profile.mollie_subscription_id}`,
          { method: 'DELETE' },
        );
      } catch (err) {
        // If it's already gone/invalid on Mollie's side, don't block the
        // local state update on that — the user's intent still applies.
        console.error('cancel-subscription: Mollie delete failed', err);
      }
    }

    // Stays 'premium' until subscription_until passes — the daily expiry
    // job (pg_cron) flips it to 'free' then. No new charges will happen
    // since the Mollie subscription is gone.
    await supabase
      .from('profiles')
      .update({ subscription_cancels_at: profile.subscription_until })
      .eq('id', user.id);

    return new Response(JSON.stringify({ success: true, cancelsAt: profile.subscription_until }), {
      status: 200,
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    });
  } catch (err) {
    console.error('cancel-subscription error:', err);
    return new Response(
      JSON.stringify({ error: 'Kon het abonnement niet opzeggen. Probeer het opnieuw.' }),
      { status: 500, headers: { ...corsHeaders, 'content-type': 'application/json' } },
    );
  }
});
