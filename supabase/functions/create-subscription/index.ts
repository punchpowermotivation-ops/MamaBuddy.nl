import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MOLLIE_API_KEY = Deno.env.get('MOLLIE_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const APP_URL = Deno.env.get('APP_URL')!;

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
      .select('naam, email, mollie_customer_id')
      .eq('id', user.id)
      .single();
    if (profileError) throw profileError;

    // Hergebruik de Mollie customer als deze al bestaat (bv. bij een
    // heractivatie of een nieuwe eerste-betaling na een mislukte betaling).
    let customerId = profile.mollie_customer_id as string | null;
    if (!customerId) {
      const customer = await mollieFetch('/customers', {
        method: 'POST',
        body: JSON.stringify({ name: profile.naam || undefined, email: profile.email || undefined }),
      });
      customerId = customer.id;
      await supabase.from('profiles').update({ mollie_customer_id: customerId }).eq('id', user.id);
    }

    const payment = await mollieFetch('/payments', {
      method: 'POST',
      body: JSON.stringify({
        amount: { currency: 'EUR', value: '7.99' },
        description: 'MamaBuddy Premium - eerste betaling',
        redirectUrl: `${APP_URL}/betaling-gelukt`,
        webhookUrl: `${SUPABASE_URL}/functions/v1/mollie-webhook`,
        sequenceType: 'first',
        customerId,
      }),
    });

    return new Response(JSON.stringify({ checkoutUrl: payment._links.checkout.href }), {
      status: 200,
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    });
  } catch (err) {
    console.error('create-subscription error:', err);
    return new Response(
      JSON.stringify({ error: 'Kon het abonnement niet starten. Probeer het opnieuw.' }),
      { status: 500, headers: { ...corsHeaders, 'content-type': 'application/json' } },
    );
  }
});
