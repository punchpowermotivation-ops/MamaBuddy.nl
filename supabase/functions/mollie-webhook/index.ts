import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MOLLIE_API_KEY = Deno.env.get('MOLLIE_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

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

function addMonths(date: Date, n: number) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d;
}

// Public webhook — no Supabase auth header from Mollie, so this uses the
// service-role key to write across users. Called on every payment status
// change, not just success, so this handles the full lifecycle in one place.
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Mollie webhooks are application/x-www-form-urlencoded with a single
    // "id" field — never JSON, and never any payment data itself.
    const bodyText = await req.text();
    const paymentId = new URLSearchParams(bodyText).get('id');
    if (!paymentId) {
      return new Response('OK', { status: 200, headers: corsHeaders });
    }

    // Always re-fetch fresh from Mollie — never trust anything from the
    // webhook request itself beyond the payment id.
    const payment = await mollieFetch(`/payments/${paymentId}`);

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, subscription_until')
      .eq('mollie_customer_id', payment.customerId)
      .maybeSingle();
    if (profileError) throw profileError;

    if (!profile) {
      console.error('mollie-webhook: no profile for Mollie customer', payment.customerId);
      return new Response('OK', { status: 200, headers: corsHeaders });
    }

    if (payment.status === 'paid') {
      if (payment.sequenceType === 'first') {
        const until = addMonths(new Date(), 1).toISOString();
        await supabase
          .from('profiles')
          .update({
            subscription_status: 'premium',
            subscription_until: until,
            // Clear any stale cancellation marker — relevant when this
            // "first payment" is actually a reactivation after a previous
            // cancellation or a payment-method update after a failure.
            subscription_cancels_at: null,
          })
          .eq('id', profile.id);

        // The manual first payment already covers period 1 — the
        // subscription's own recurring billing must start one period
        // later, or Mollie would charge again immediately.
        const startDate = addMonths(new Date(), 1).toISOString().slice(0, 10);
        const subscription = await mollieFetch(`/customers/${payment.customerId}/subscriptions`, {
          method: 'POST',
          body: JSON.stringify({
            amount: { currency: 'EUR', value: '7.99' },
            interval: '1 month',
            description: 'MamaBuddy Premium',
            webhookUrl: `${SUPABASE_URL}/functions/v1/mollie-webhook`,
            startDate,
          }),
        });

        await supabase
          .from('profiles')
          .update({ mollie_subscription_id: subscription.id })
          .eq('id', profile.id);
      } else {
        // Recurring renewal: extend from the existing subscription_until,
        // not from now — an early/late charge shouldn't shift the cycle.
        const base = profile.subscription_until ? new Date(profile.subscription_until) : new Date();
        const until = addMonths(base, 1).toISOString();
        await supabase
          .from('profiles')
          .update({ subscription_status: 'premium', subscription_until: until })
          .eq('id', profile.id);
      }
    } else if (['failed', 'expired', 'canceled'].includes(payment.status)) {
      // Only a failed *renewal* means an existing subscriber's payment
      // broke — a failed first payment just means someone abandoned
      // checkout before ever being Premium, which isn't a "payment
      // failed, fix your card" situation and shouldn't show that banner.
      if (payment.sequenceType === 'recurring') {
        await supabase.from('profiles').update({ subscription_status: 'payment_failed' }).eq('id', profile.id);
      }
    }

    return new Response('OK', { status: 200, headers: corsHeaders });
  } catch (err) {
    console.error('mollie-webhook error:', err);
    // 500 so Mollie retries on transient failures.
    return new Response('Error', { status: 500, headers: corsHeaders });
  }
});
