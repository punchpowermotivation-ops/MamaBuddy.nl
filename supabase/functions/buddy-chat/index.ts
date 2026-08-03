import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

const FREE_DAILY_LIMIT = 3;
const CHAT_MODEL = 'claude-sonnet-4-5';
const INSIGHT_MODEL = 'claude-haiku-4-5';

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

function ageFromBirthdate(geboortedatum: string | null): number | null {
  if (!geboortedatum) return null;
  const birth = new Date(geboortedatum);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

async function callAnthropic(system: string, messages: { role: string; content: string }[], model: string, maxTokens: number) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({ model, max_tokens: maxTokens, system, messages }),
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

    const { message } = await req.json();
    if (!message || typeof message !== 'string' || !message.trim()) {
      return new Response(JSON.stringify({ error: 'Leeg bericht.' }), {
        status: 400,
        headers: { ...corsHeaders, 'content-type': 'application/json' },
      });
    }

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const [{ data: profile }, { data: children }, { data: memory }, { data: recent }, { data: usage }, { data: lastCheckin }] =
      await Promise.all([
        supabase.from('profiles').select('naam, subscription_status').eq('id', user.id).single(),
        supabase.from('children').select('naam, geboortedatum').eq('user_id', user.id),
        supabase.from('buddy_memory').select('id, type, content').eq('user_id', user.id),
        supabase
          .from('messages')
          .select('role, content')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('usage_daily')
          .select('id, message_count')
          .eq('user_id', user.id)
          .eq('date', todayDate())
          .maybeSingle(),
        supabase
          .from('checkins')
          .select('mood, note, created_at')
          .eq('user_id', user.id)
          .gte('created_at', oneDayAgo)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

    const isPremium = profile?.subscription_status === 'premium';
    const currentCount = usage?.message_count ?? 0;

    if (!isPremium && currentCount >= FREE_DAILY_LIMIT) {
      return new Response(JSON.stringify({ limitReached: true }), {
        status: 200,
        headers: { ...corsHeaders, 'content-type': 'application/json' },
      });
    }

    const { data: userMsgRow, error: insertUserError } = await supabase
      .from('messages')
      .insert({ user_id: user.id, role: 'user', content: message.trim() })
      .select()
      .single();

    if (insertUserError) throw insertUserError;

    const facts = (memory ?? []).filter((m) => m.type === 'fact').map((m) => m.content);
    const insights = (memory ?? []).filter((m) => m.type === 'insight').map((m) => m.content);
    const kidsText = (children ?? [])
      .map((c) => {
        const age = ageFromBirthdate(c.geboortedatum);
        return age !== null ? `${c.naam} (${age})` : c.naam;
      })
      .join(', ');

    const checkinText = lastCheckin
      ? `Vandaag gaf ${profile?.naam || 'ze'} bij de check-in aan zich ${lastCheckin.mood} te voelen.${
          lastCheckin.note ? ` Ze voegde daarbij toe: "${lastCheckin.note}"` : ''
        }`
      : null;

    const systemPrompt = `Je bent Buddy, een warme, empathische persoonlijke coach voor moeders in Nederland en België. Je praat in het Nederlands, op een manier die voelt als een begripvolle vriendin — nooit als een chatbot of therapeut.

Over deze moeder (gebruik dit natuurlijk, som het niet op):
- Naam: ${profile?.naam || 'onbekend'}
- Kinderen: ${kidsText || 'onbekend'}
- Wat er speelt: ${facts.join('; ') || 'nog niets bekend'}
- Wat je eerder opmerkte: ${insights.join('; ') || 'nog niets bekend'}
${checkinText ? `- Check-in van vandaag: ${checkinText}` : ''}

Richtlijnen:
- Wees empathisch en oordeelvrij. Valideer haar gevoelens eerst.
- Verwijs naar wat ze eerder vertelde — laat merken dat je het onthoudt.
- Als er een check-in van vandaag bekend is, hoeft ze dat niet opnieuw uit te leggen — je mag er organisch op terugkomen als het gesprek zich ervoor leent (bijvoorbeeld door te vragen hoe het nu gaat), maar forceer het niet als ze over iets anders begint.
- Geef praktische, haalbare suggesties, geen lange lappen tekst.
- Bij zorgen over veiligheid, ernstige depressie of zelfbeschadiging: wees warm maar verwijs naar professionele hulp (huisarts, 113).
- Je bent GEEN arts. Bij medische vragen verwijs je vriendelijk door.
- Houd antwoorden kort en menselijk: 2-4 zinnen meestal.
- Gebruik nooit het woord "AI" — jij bent gewoon Buddy.

BESPAAR-KENNIS (gebruik dit alleen als het gesprek er natuurlijk om
vraagt — nooit ongevraagd, nooit als reclame):

Als een moeder geld, kosten, dure aankopen, of financiële stress noemt
(bijvoorbeeld over kleding die haar kind ontgroeit, luiers, babyspullen,
een dure maand, of "ik moet weer iets kopen"), mag je natuurlijk en
warm een van deze gedachtes laten meewegen — als onderdeel van het
gesprek, niet als opsomming of verkooppraatje:

- Kinderkleding en babyspullen: tweedehands platforms zoals Vinted,
  Marktplaats, en lokale mama-ruilgroepen op Facebook zijn voor veel
  Nederlandse en Belgische moeders een waardevolle bron — kinderen
  groeien razendsnel uit kleding die vaak nauwelijks gedragen is.
- Luiers en verzorgingsproducten: drogisterijen en supermarkten hebben
  regelmatig stapelkortingen op luiers; sommige moeders wisselen ook
  tips uit in lokale ouder-groepen over wanneer welke winkel actie heeft.
- Kinderopvang en toeslagen: veel gezinnen ontvangen niet het volledige
  bedrag waar ze recht op hebben — een check bij de Belastingdienst
  (NL) of het Groeipakket (BE) kan de moeite waard zijn.
- Ruilen en delen: veel steden hebben speelgoed- en kinderkleding-
  ruilbeurzen; ook het delen van spullen binnen de eigen sociale kring
  wordt door moeders vaak onderschat als optie.

BELANGRIJKE GRENZEN:
- Noem dit ALLEEN als de moeder zelf een financieel of kostengerelateerd
  onderwerp aansnijdt. Begin er nooit ongevraagd over.
- Geef nooit merknamen, actuele prijzen, of specifieke winkelaanbiedingen
  — die verouderen en Buddy moet nooit onjuiste of verlopen informatie
  geven. Blijf op het niveau van "dit soort platforms/opties bestaan."
  Verwijs bij interesse door naar de toeslagen-checker in de app (indien
  al gebouwd) voor concrete, actuele bedragen.
- Eén korte, warme suggestie is genoeg — geen lijstje afvuren.
- VOLGORDE IS BELANGRIJK: vraag eerst expliciet door op het gevoel
  achter de zorg (is het stress, schaamte, vermoeidheid, iets anders?)
  — vóórdat je ook maar één praktische gedachte noemt. Als je twijfelt
  of het gevoel al voldoende besproken is, wacht dan gewoon een beurt:
  het is prima om de besparen-tip pas in een vólgend bericht te geven,
  ná haar antwoord over hoe ze zich voelt. Nooit tip en gevoelsvraag
  in dezelfde beurt door elkaar heen gooien — eerst voelen, dan pas
  (optioneel) de gedachte.
- Als een moeder duidelijk maakt dat geldzorgen zwaar op haar drukken
  (niet alleen "een dure maand" maar structurele stress), behandel dit
  met extra zachtheid — dit kan gevoelig liggen. Nooit luchtig doen
  over financiële stress.`;

    const history = (recent ?? [])
      .slice()
      .reverse()
      .map((m) => ({ role: m.role === 'buddy' ? 'assistant' : 'user', content: m.content }));
    history.push({ role: 'user', content: message.trim() });

    const reply = await callAnthropic(systemPrompt, history, CHAT_MODEL, 400);

    const { error: insertBuddyError } = await supabase
      .from('messages')
      .insert({ user_id: user.id, role: 'buddy', content: reply });

    if (insertBuddyError) throw insertBuddyError;

    if (usage) {
      await supabase
        .from('usage_daily')
        .update({ message_count: usage.message_count + 1 })
        .eq('id', usage.id);
    } else {
      await supabase
        .from('usage_daily')
        .insert({ user_id: user.id, date: todayDate(), message_count: 1 });
    }

    // Insight-extractie op de achtergrond, blokkeert het antwoord niet.
    const extractInsight = async () => {
      try {
        const insightPrompt = `Analyseer dit gesprekje tussen een moeder en Buddy. Bestaande inzichten over haar: ${
          insights.join('; ') || 'geen'
        }.

Gesprek:
Moeder: ${message.trim()}
Buddy: ${reply}

Is er een NIEUW inzicht over deze moeder te destilleren dat nog niet in de bestaande inzichten staat (bijv. "voelt zich schuldig over werken", "kind slaapt slecht")? Antwoord met precies één korte Nederlandse zin met het inzicht, of met alleen het woord GEEN als er niets nieuws is. Geen uitleg, geen aanhalingstekens.`;

        const result = await callAnthropic(
          'Je bent een analysetool die korte, feitelijke inzichten destilleert uit gesprekken. Antwoord kort en precies.',
          [{ role: 'user', content: insightPrompt }],
          INSIGHT_MODEL,
          80,
        );

        const cleaned = result.trim();
        if (cleaned && cleaned.toUpperCase() !== 'GEEN' && cleaned.length < 200) {
          await supabase
            .from('buddy_memory')
            .insert({ user_id: user.id, type: 'insight', content: cleaned });
        }
      } catch (err) {
        console.error('Insight extraction failed:', err);
      }
    };

    // @ts-ignore: EdgeRuntime is beschikbaar in de Supabase Deno-runtime
    if (typeof EdgeRuntime !== 'undefined') {
      // @ts-ignore
      EdgeRuntime.waitUntil(extractInsight());
    } else {
      extractInsight();
    }

    return new Response(
      JSON.stringify({ reply, userMessage: userMsgRow, limitReached: false }),
      { status: 200, headers: { ...corsHeaders, 'content-type': 'application/json' } },
    );
  } catch (err) {
    console.error('buddy-chat error:', err);
    return new Response(
      JSON.stringify({ error: 'Er ging iets mis. Probeer het over een moment opnieuw.' }),
      { status: 500, headers: { ...corsHeaders, 'content-type': 'application/json' } },
    );
  }
});
