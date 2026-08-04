import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

const CHECKIN_MODEL = 'claude-sonnet-4-5';
const VALID_MOODS = ['uitgeput', 'overprikkeld', 'oké', 'goed'];
const HEAVY_MOODS = ['uitgeput', 'overprikkeld'];

// Only shown if the Anthropic call fails for any reason — the check-in flow
// should never show a broken or empty state.
const FALLBACK_RESPONSES: Record<string, string> = {
  uitgeput:
    'Uitgeput zijn is geen zwakte. Het is je lichaam dat om rust vraagt. Je doet ontzettend veel — vergeet jezelf niet.',
  overprikkeld:
    'Alle prikkels van een dag met kinderen zijn echt veel. Gun jezelf straks 10 minuten stilte, alleen voor jou.',
  oké: 'Fijn dat het wel oké gaat. Onthoud dit gevoel — ook de rustige dagen tellen.',
  goed: 'Wat heerlijk om te horen! 💛 Geniet ervan, je verdient deze goede momenten.',
};

function ageFromBirthdate(geboortedatum: string | null): number | null {
  if (!geboortedatum) return null;
  const birth = new Date(geboortedatum);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

async function callAnthropic(system: string, message: string, maxTokens: number) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: CHECKIN_MODEL,
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: message }],
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${text}`);
  }
  const json = await res.json();
  return json.content?.[0]?.text?.trim() ?? '';
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

    const { mood, note } = await req.json();
    if (!mood || !VALID_MOODS.includes(mood)) {
      return new Response(JSON.stringify({ error: 'Ongeldige stemming.' }), {
        status: 400,
        headers: { ...corsHeaders, 'content-type': 'application/json' },
      });
    }
    const cleanNote = typeof note === 'string' && note.trim() ? note.trim().slice(0, 500) : null;

    const { data: checkinRow, error: insertError } = await supabase
      .from('checkins')
      .insert({ user_id: user.id, mood, note: cleanNote })
      .select('id')
      .single();
    if (insertError) throw insertError;

    // Zwaardere stemmingen worden een blijvend feit, zodat een patroon van
    // meerdere zware dagen zichtbaar wordt in Buddy's geheugen op de lange
    // termijn — niet alleen in het moment. 'oké'/'goed' vullen het geheugen
    // onnodig, dus die slaan we niet op.
    if (HEAVY_MOODS.includes(mood)) {
      const dateLabel = new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'long' });
      await supabase.from('buddy_memory').insert({
        user_id: user.id,
        type: 'fact',
        content: `Gaf op ${dateLabel} aan zich ${mood} te voelen bij de dagelijkse check-in.`,
      });
    }

    const [{ data: profile }, { data: children }, { data: memory }] = await Promise.all([
      supabase.from('profiles').select('naam').eq('id', user.id).single(),
      supabase.from('children').select('naam, geboortedatum').eq('user_id', user.id),
      supabase.from('buddy_memory').select('type, content').eq('user_id', user.id),
    ]);

    const facts = (memory ?? []).filter((m) => m.type === 'fact').map((m) => m.content);
    const insights = (memory ?? []).filter((m) => m.type === 'insight').map((m) => m.content);
    const kidsText = (children ?? [])
      .map((c) => {
        const age = ageFromBirthdate(c.geboortedatum);
        return age !== null ? `${c.naam} (${age})` : c.naam;
      })
      .join(', ');

    const systemPrompt = `Je bent Buddy, een warme, empathische persoonlijke coach voor moeders in Nederland en België. Je reageert in het Nederlands op de dagelijkse check-in van een moeder — kort en persoonlijk, zoals een begripvolle vriendin, nooit als een chatbot of therapeut.

Over deze moeder (gebruik dit natuurlijk, som het niet op):
- Naam: ${profile?.naam || 'onbekend'}
- Kinderen: ${kidsText || 'onbekend'}
- Wat er speelt: ${facts.join('; ') || 'nog niets bekend'}
- Wat je eerder opmerkte: ${insights.join('; ') || 'nog niets bekend'}

Richtlijnen:
- Reageer in 2-3 korte zinnen. Dit is geen gesprek, het is één warme reactie.
- Valideer haar gevoel eerst — geen advies opdringen.
- Als ze een toelichting gaf, ga daar specifiek op in — niet op de mood-naam alleen.
- Gebruik nooit het woord "AI" — jij bent gewoon Buddy.
- Bij zorgen over veiligheid, ernstige depressie of zelfbeschadiging: wees warm maar verwijs naar professionele hulp (huisarts, 113). Je bent geen arts.`;

    const userMessage = cleanNote
      ? `Ik voel me vandaag "${mood}". Ik wilde er nog bij zeggen: ${cleanNote}`
      : `Ik voel me vandaag "${mood}".`;

    let reply: string;
    try {
      reply = await callAnthropic(systemPrompt, userMessage, 200);
      if (!reply) throw new Error('Empty reply');
    } catch (err) {
      console.error('checkin-respond Anthropic call failed, using fallback:', err);
      reply = FALLBACK_RESPONSES[mood];
    }

    return new Response(JSON.stringify({ reply, checkinId: checkinRow.id }), {
      status: 200,
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    });
  } catch (err) {
    console.error('checkin-respond error:', err);
    return new Response(
      JSON.stringify({ error: 'Er ging iets mis. Probeer het over een moment opnieuw.' }),
      { status: 500, headers: { ...corsHeaders, 'content-type': 'application/json' } },
    );
  }
});
