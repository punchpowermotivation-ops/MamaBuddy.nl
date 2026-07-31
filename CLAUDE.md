# MamaBuddy MVP — Complete Bouwprompt voor Claude Code

Dit document bevat alles om de MamaBuddy MVP-app te bouwen als werkende
React-app met echte functionaliteit.

## VISUELE REFERENTIES — voeg deze 2 bestanden toe aan Claude Code

Sleep beide HTML-bestanden in Claude Code (of gebruik @bestandsnaam) VOORDAT
je de prompts uitvoert. Bouw de schermen exact na zoals deze eruitzien:

1. `mamabuddy-welkom-flow.html` → de VOORDEUR van de app:
   welkomstscherm, inloggen met e-mail (magic link), "check je inbox",
   en de onboarding (naam + kinderen).

2. `mamabuddy-app-demo.html` → de APP zelf:
   Home, Buddy-chat, Mijn hoofd (mental load), Check-in flow, Profiel,
   en de paywall.

## DESIGN SYSTEEM (exact aanhouden — dit is het merk)

Fonts (via Google Fonts):
- Fraunces (serif) → alle koppen en Buddy-quotes
- DM Sans → alle body-tekst, knoppen, labels

Kleuren (CSS variabelen):
```
--rose:#F2567A        (hoofdkleur, knoppen, accenten)
--rose-light:#FDE8EE  (zachte roze vlakken)
--rose-dark:#B83055   (hover/active states)
--rose-soft:#FBEEF1   (memory chips, subtiele vlakken)
--cream:#FDF8F3       (app achtergrond)
--dark:#1E1A18        (tekst)
--navy:#1E2640        (donkere kaarten, check-in, logo-tekst)
--mid:#5C4F47         (subtekst)
--muted:#9B8F88       (placeholders, labels)
--sand:#F5EDE4        (input velden, dots)
--green:#2D8C6A       (succes, afgerond)
--green-light:#E2F4EC
--line:#EFE7DD        (randen)
```

Stijl-kenmerken (voor het "€300K premium" gevoel):
- Afgeronde hoeken: 14-16px op knoppen/inputs, 20-26px op kaarten, 100px op pills
- Zachte schaduwen, geen harde randen
- Donkere navy-gradient kaarten met een subtiele roze glow voor hero-elementen
- Ruime witruimte, nooit druk
- Bottom tab-bar met 4 tabs: Home · Buddy · Mijn hoofd · Profiel

## LOGO (gebruik exact dit — het is het merk)

Het MamaBuddy-logo is een roze hart in een roze cirkel-outline, naast de
tekst "MamaBuddy" in Fraunces serif. De SVG:

```html
<svg viewBox="0 0 240 52" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="26" cy="26" r="22" stroke="#F2567A" stroke-width="2.8"/>
  <path d="M26 38C26 38 15 30.5 15 21.5C15 17.9 17.9 15 21.5 15C23.4 15 25.1 15.8 26 17.1C26.9 15.8 28.6 15 30.5 15C34.1 15 37 17.9 37 21.5C37 30.5 26 38 26 38Z" fill="#F2567A"/>
  <text x="60" y="34" font-family="Fraunces,serif" font-size="26" font-weight="600" fill="#1E2640">MamaBuddy</text>
</svg>
```

Let op: de viewBox is 240 breed zodat "MamaBuddy" volledig past — niet
afsnijden. Geef het logo in de app een breedte van ~210px.

Op donkere achtergrond: de "MamaBuddy" tekst wordt wit (#FFFFFF) i.p.v. navy.
Het losse hart-icoon (alleen de cirkel + hart, zonder tekst) wordt gebruikt
als app-icoon, favicon en PWA-icoon (zie PROMPT 5).

BELANGRIJK: gebruik NOOIT het woord "AI" in de interface — altijd "Buddy".

Voer de prompts hieronder in volgorde uit. Elke prompt is een compleet blok
dat je in Claude Code plakt. Bouw en test na élke prompt.

---

## VOORAF — Wat je nodig hebt

Accounts & keys (verzamel deze eerst):
- Supabase project (bestaat al — Mamabuddy_Pro in Frankfurt)
- **Mollie account** → https://mollie.com → API keys (test + live)
- **Anthropic API key** voor Buddy (de chat-AI)
- Vercel (bestaat al)

Zet later in `.env`:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_SUPABASE_SERVICE_KEY=...
MOLLIE_API_KEY=...            (server-side, GEEN VITE_ prefix)
ANTHROPIC_API_KEY=...         (server-side, GEEN VITE_ prefix)
VITE_APP_URL=https://mamabuddy.nl
```

---

## PROMPT 1 — Database, Auth & Voordeur

```
We bouwen de MamaBuddy MVP-app als aparte React-app in een nieuwe map
'mamabuddy-app'.

STIJL: gebruik exact het design systeem en logo uit de instructies
bovenaan dit document (Fraunces + DM Sans, rose #F2567A, cream #FDF8F3,
navy #1E2640, het hart-logo). Bouw de VOORDEUR-schermen exact na zoals
in mamabuddy-welkom-flow.html.

STAP 1 — Supabase database uitbreiden.
Genereer de SQL voor deze tabellen (ik draai ze zelf in de Supabase SQL editor):

-- Gebruikersprofiel (1 op 1 met auth.users)
profiles:
  id uuid PK references auth.users
  created_at timestamptz default now()
  naam text
  email text
  subscription_status text default 'free'  (free / premium / cancelled)
  subscription_until timestamptz
  mollie_customer_id text
  onboarding_done boolean default false

-- Kinderen van de moeder (voor Buddy's context)
children:
  id uuid PK default gen_random_uuid()
  user_id uuid references profiles
  naam text
  geboortedatum date
  created_at timestamptz default now()

-- Buddy's geheugen: harde profiel-feiten + zachte inzichten
buddy_memory:
  id uuid PK default gen_random_uuid()
  user_id uuid references profiles
  type text            (fact / insight)
  content text         (bv "voelt zich schuldig over werken")
  created_at timestamptz default now()
  updated_at timestamptz default now()

-- Chatgesprekken
messages:
  id uuid PK default gen_random_uuid()
  user_id uuid references profiles
  role text            (user / buddy)
  content text
  created_at timestamptz default now()

-- Dagelijkse check-ins
checkins:
  id uuid PK default gen_random_uuid()
  user_id uuid references profiles
  mood text            (uitgeput / overprikkeld / oké / goed)
  note text
  created_at timestamptz default now()

-- Mental load items
load_items:
  id uuid PK default gen_random_uuid()
  user_id uuid references profiles
  text text
  category text
  is_done boolean default false
  created_at timestamptz default now()

-- Dagelijkse chat-teller (voor freemium limiet)
usage_daily:
  id uuid PK default gen_random_uuid()
  user_id uuid references profiles
  date date default current_date
  message_count int default 0
  unique(user_id, date)

Zet RLS aan op ALLE tabellen. Policy: gebruikers zien/bewerken alleen
rijen waar user_id = auth.uid(). Genereer de complete RLS policies.

STAP 2 — Supabase Auth instellen (de VOORDEUR).
Bouw de welkom/login/onboarding-flow EXACT na zoals in
mamabuddy-welkom-flow.html. Gebruik Supabase Auth met email magic link
(wachtwoordloos, laagdrempelig voor moeders).

Schermen (exact volgens de HTML-referentie):
- Welkomstscherm (Welcome.jsx): donkere navy-gradient, logo, headline
  "Jouw persoonlijke Buddy als mama", chat-teaser, knop "Aan de slag",
  "Al een account? Log in", en het vertrouwenszegel "Privé & veilig".
- E-mail invoer: alleen e-mailveld, "Stuur mij een inloglink", privacy-tekst.
- "Check je inbox" bevestiging: met spam-hint en "link 15 min geldig".
- Onboarding (Onboarding.jsx): stap 1 naam, stap 2 kinderen toevoegen
  (naam + leeftijd), progress bar bovenaan, dan "Welkom [naam]" scherm
  dat de app in leidt.

Beveiliging (belangrijk — gevoelige data):
- Zet de magic link vervaltijd in Supabase op 15 minuten
  (Auth → Settings → Email OTP Expiration).
- Beperk aanvragen: gebruik Supabase's ingebouwde rate limiting.
- Beschermde routes: niet-ingelogd → altijd terug naar welkomstscherm.
- Na eerste login: sla naam + kinderen op, zet onboarding_done = true.

Bouw de mapstructuur:
src/
  lib/supabase.js
  contexts/AuthContext.jsx
  pages/Welcome.jsx        (welkom + e-mail + inbox schermen)
  pages/Onboarding.jsx     (naam + kinderen)
  pages/Home.jsx
  pages/Chat.jsx
  pages/MentalLoad.jsx
  pages/Profile.jsx
  pages/CheckIn.jsx
  components/TabBar.jsx
  components/Logo.jsx       (het hart-logo als herbruikbaar component)
  App.jsx (met routing + auth guard)
```

---

## PROMPT 2 — De schermen bouwen (UI)

```
Bouw alle app-schermen exact volgens mamabuddy-app-demo.html. Houd het
design systeem en logo uit de instructies bovenaan dit document aan.

Elk scherm 1-op-1 nabouwen in React:

1. HOME (pages/Home.jsx)
   - Persoonlijke begroeting met naam uit profiel
   - Grote donkere "Dagelijkse check-in" kaart (navy gradient) → opent check-in
   - Quick actions: "Praat met Buddy" + "Mijn hoofd"
   - Insight-kaart: toont Buddy's meest recente inzicht uit buddy_memory
   - Check-in streak (laatste 7 dagen uit checkins tabel)

2. CHAT (pages/Chat.jsx)
   - Chat header met Buddy avatar + "altijd beschikbaar"
   - Berichten uit messages tabel
   - Memory-chip bovenaan: "Buddy herinnert zich jullie vorige gesprek"
   - Suggestie-chips
   - Input + verzendknop
   - (AI-koppeling komt in prompt 3)

3. MENTAL LOAD (pages/MentalLoad.jsx)
   - "Mijn hoofd" — items uit load_items
   - Input om nieuw item toe te voegen
   - Tik om af te vinken (is_done toggle → Supabase update)
   - Groepen: "Deze week" (open) en "Afgerond"

4. CHECK-IN (pages/CheckIn.jsx) — volledig scherm overlay
   - Stap 1: mood kiezen (4 opties met emoji)
   - Stap 2: Buddy's warme, persoonlijke reactie op basis van mood
   - Opslaan in checkins tabel
   - Progress bar bovenaan

5. PROFILE (pages/Profile.jsx)
   - Avatar + naam
   - "Wat Buddy over jou weet" — toont buddy_memory (facts + insights)
     met bewerk/wis knoppen (echte Supabase updates)
   - Premium upsell kaart → opent paywall
   - Instellingen: Meldingen, Privacy & data, Hulp & contact

Gebruik dezelfde bottom TabBar op alle 4 hoofdschermen.
Alle animaties, kleuren, afgeronde hoeken exact als de demo.
Gebruik NOOIT het woord "AI" in de UI — altijd "Buddy".
```

---

## PROMPT 3 — Buddy AI + geheugen (het hart)

```
Bouw de Buddy-chat met echte AI en persoonlijk geheugen.

BELANGRIJK: de AI-key mag NOOIT in de browser. Bouw een Supabase Edge
Function 'buddy-chat' die server-side de AI aanroept.

EDGE FUNCTION: buddy-chat
Input: { user_id, message }
Stappen:
1. Haal het profiel + kinderen op uit Supabase
2. Haal buddy_memory op (alle facts + insights van deze user)
3. Haal de laatste 10 messages op voor gespreks-context
4. Bouw een system prompt (zie hieronder) met alle context
5. Roep de Anthropic API aan (model claude-sonnet, of via ANTHROPIC_API_KEY)
6. Sla het antwoord op in messages
7. Draai een tweede, korte AI-call die het gesprek analyseert en
   nieuwe inzichten destilleert → sla op in buddy_memory (type 'insight').
   Bijvoorbeeld: user zegt "ik werk fulltime en voel me schuldig" →
   insight "voelt zich schuldig over werken". Voeg alleen NIEUWE inzichten
   toe die er nog niet staan.
8. Return het antwoord

SYSTEM PROMPT voor Buddy:
"""
Je bent Buddy, een warme, empathische persoonlijke coach voor moeders in
Nederland en België. Je praat in het Nederlands, op een manier die voelt
als een begripvolle vriendin — nooit als een chatbot of therapeut.

Over deze moeder (gebruik dit natuurlijk, som het niet op):
- Naam: {naam}
- Kinderen: {kinderen met leeftijden}
- Wat er speelt: {facts uit geheugen}
- Wat je eerder opmerkte: {insights uit geheugen}

Richtlijnen:
- Wees empathisch en oordeelvrij. Valideer haar gevoelens eerst.
- Verwijs naar wat ze eerder vertelde — laat merken dat je het onthoudt.
- Geef praktische, haalbare suggesties, geen lange lappen tekst.
- Bij zorgen over veiligheid, ernstige depressie of zelfbeschadiging:
  wees warm maar verwijs naar professionele hulp (huisarts, 113).
- Je bent GEEN arts. Bij medische vragen verwijs je vriendelijk door.
- Houd antwoorden kort en menselijk: 2-4 zinnen meestal.
"""

FREEMIUM LIMIET:
- Gratis gebruikers: 3 berichten per dag (check usage_daily)
- Bij 4e bericht van gratis user: blokkeer en toon paywall
- Premium users (subscription_status = 'premium'): onbeperkt
- Verhoog message_count bij elk bericht

In de Chat.jsx: roep de edge function aan, toon typing indicator,
toon Buddy's antwoord. Bij limiet-bereikt: toon de upgrade-banner.
```

---

## PROMPT 4 — Mollie betalingen

```
Integreer Mollie voor het Premium abonnement (€7,99/maand).

BELANGRIJK: MOLLIE_API_KEY alleen server-side (Supabase Edge Functions).

Bouw drie Edge Functions:

1. create-subscription
   Input: { user_id }
   - Maak (of hergebruik) een Mollie customer voor deze user
   - Sla mollie_customer_id op in profiles
   - Maak een Mollie 'first payment' met sequenceType 'first' aan
     (verplicht om later recurring te kunnen doen)
   - Bedrag: €7,99
   - redirectUrl: {VITE_APP_URL}/betaling-gelukt
   - webhookUrl: de mollie-webhook function hieronder
   - Return de Mollie checkout URL

2. mollie-webhook
   - Ontvangt Mollie payment id
   - Haalt payment status op bij Mollie
   - Bij 'paid': zet subscription_status = 'premium' en
     subscription_until = nu + 1 maand. Maak daarna een Mollie
     subscription (recurring) aan voor maandelijkse verlenging.
   - Bij mislukt/geannuleerd: laat status op 'free'
   - Deze function is publiek (geen auth) maar valideert via Mollie API

3. cancel-subscription
   Input: { user_id }
   - Zeg de Mollie subscription op
   - Zet subscription_status = 'cancelled'
     (premium blijft actief tot subscription_until)

FRONTEND (paywall component):
- Bouw de paywall exact als in de demo (bottom sheet)
- Toon features en prijs (€7,99/maand)
- "Start met Mollie" knop → roept create-subscription aan →
  redirect naar Mollie checkout URL
- Pagina /betaling-gelukt: toon bevestiging, ververs profiel
- Gebruik Mollie's test API key tijdens ontwikkeling (test iDEAL)

Toon in Profile het abonnement-status en een "Opzeggen" knop voor
premium users.
```

---

## PROMPT 5 — PWA instellen

```
Maak MamaBuddy een volledige PWA zodat moeders het op hun homescreen
kunnen installeren en het als echte app voelt.

1. Maak public/manifest.json:
{
  "name": "MamaBuddy",
  "short_name": "MamaBuddy",
  "description": "Jouw persoonlijke Buddy als mama",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#FDF8F3",
  "theme_color": "#F2567A",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ]
}

2. LOGO/ICOON — gebruik EXACT het MamaBuddy hart-icoon.
   Dit is de losse hart-SVG (roze cirkel-outline + gevuld roze hart,
   zonder de tekst), op een cream achtergrond:

   <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
     <rect width="512" height="512" fill="#FDF8F3"/>
     <circle cx="256" cy="256" r="150" stroke="#F2567A" stroke-width="20"/>
     <path d="M256 340C256 340 180 288 180 226C180 200 201 179 227 179C240 179 252 185 256 194C260 185 272 179 285 179C311 179 332 200 332 226C332 288 256 340 256 340Z" fill="#F2567A"/>
   </svg>

   Converteer deze SVG naar:
   - public/icon-192.png (192x192)
   - public/icon-512.png (512x512)
   - public/favicon.ico (32x32, hart-icoon)
   - public/apple-touch-icon.png (180x180)
   Gebruik sharp of canvas in een klein build-script om de PNG's uit de
   SVG te genereren. Voor de maskable variant: houd het hart ruim binnen
   de veilige zone (ca. 80% van het vlak) zodat het niet wordt afgesneden
   op Android.

3. Service Worker (public/sw.js):
   - Cache de app-shell voor offline gebruik
   - Cache-first voor statische assets, network-first voor API calls
   - Registreer de SW in main.jsx

4. In index.html:
   <link rel="manifest" href="/manifest.json">
   <meta name="theme-color" content="#F2567A">
   <link rel="apple-touch-icon" href="/apple-touch-icon.png">
   <meta name="apple-mobile-web-app-capable" content="yes">
   <meta name="apple-mobile-web-app-status-bar-style" content="default">
   <meta name="apple-mobile-web-app-title" content="MamaBuddy">

5. Bouw een "Voeg toe aan beginscherm" hint-component die op mobiel
   verschijnt (beforeinstallprompt event op Android; instructie-tooltip
   op iOS Safari).

Test met Lighthouse dat de PWA-score groen is.
```

---

## PROMPT 6 — Afronden & deployen

```
Maak de app productie-klaar:

1. Foutafhandeling overal: vriendelijke Nederlandse foutmeldingen,
   geen technische errors naar de gebruiker.

2. Loading states: skeleton screens tijdens het laden van data.

3. Lege staten: als er nog geen berichten/check-ins/load-items zijn,
   toon warme uitnodigende lege staten.

4. vercel.json met rewrites (SPA routing) + security headers
   (zoals bij de landing page).

5. Alle environment variables documenteren die in Vercel moeten:
   VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, en server-side in
   Supabase Edge Functions: ANTHROPIC_API_KEY, MOLLIE_API_KEY,
   SUPABASE_SERVICE_ROLE_KEY.

6. Test de volledige flow:
   - Aanmelden met magic link → onboarding → home
   - Check-in doen → opgeslagen → streak update
   - Chatten met Buddy → AI antwoordt → geheugen bouwt op
   - 4e bericht → paywall → Mollie test-betaling → premium actief
   - Mental load toevoegen/afvinken
   - Profiel → geheugen bekijken/bewerken

7. Routing-structuur op mamabuddy.nl:
   De marketing-landingpagina (bestaat al) en de app draaien op hetzelfde
   domein. Regel het zo:
   - mamabuddy.nl (uitgelogd)  → marketing landingpagina (overtuigt, voor ads)
   - mamabuddy.nl/welkom       → welkomstscherm (aanmelden/inloggen)
   - mamabuddy.nl (ingelogd)   → direct de app (Home scherm)
   Een ingelogde moeder die naar mamabuddy.nl gaat, wordt herkend en
   direct naar haar Home-scherm gestuurd — ze ziet de marketingpagina niet.
   Alleen nieuwe/uitgelogde bezoekers zien de verkooppagina.

8. Bouw voor productie, deploy naar Vercel, koppel aan mamabuddy.nl.

Zet de code op GitHub in een nieuwe repo (of aparte branch).
```

---

## ARCHITECTUUR-OVERZICHT

```
┌─────────────────────────────────────────────┐
│  mamabuddy.nl  (React PWA op Vercel)     │
│  - Home / Chat / Mental Load / Profile        │
│  - Check-in flow                              │
│  - Paywall                                    │
└───────────────┬─────────────────────────────┘
                │
     ┌──────────┴──────────┐
     │                     │
┌────▼─────┐        ┌──────▼──────────────┐
│ Supabase │        │ Supabase Edge Funcs │
│ (Frankfurt)│      │ - buddy-chat (AI)   │
│ - Auth    │       │ - create-subscription│
│ - Database│       │ - mollie-webhook     │
│ - RLS     │       │ - cancel-subscription│
└──────────┘        └──────┬───────────────┘
                           │
              ┌────────────┼────────────┐
              │                         │
        ┌─────▼─────┐            ┌──────▼──────┐
        │ Anthropic │            │   Mollie    │
        │ (Buddy AI)│            │ (betalingen)│
        └───────────┘            └─────────────┘
```

---

## FREEMIUM-MODEL (samenvatting)

```
GRATIS (altijd):
  ✓ Dagelijkse check-in (onbeperkt)
  ✓ 3 chatberichten per dag met Buddy
  ✓ Mental load lijst
  ✓ Basis profiel

PREMIUM (€7,99/mnd):
  ✓ Onbeperkt chatten met Buddy
  ✓ Buddy's volledige geheugen & inzichten
  ✓ Wekelijks persoonlijk overzicht
  ✓ Toeslagen & regelingen checker
```

---

## VOLGORDE VAN BOUWEN

Voeg eerst beide HTML-referenties toe aan Claude Code
(mamabuddy-welkom-flow.html + mamabuddy-app-demo.html), dan:

1. Prompt 1 — Database, Auth & Voordeur (welkom/login/onboarding)
2. Prompt 2 — Alle app-schermen (UI zonder logica)
3. Prompt 3 — Buddy AI + geheugen (het hart)
4. Prompt 5 — PWA (zodat je op telefoon kunt testen)
5. Prompt 4 — Mollie (betalingen)
6. Prompt 6 — Afronden & deployen

Bouw en test na élke prompt voordat je verder gaat.
