// Single source of truth for the FAQ content: rendered as visible copy on
// the landing page AND used to build the matching FAQPage JSON-LD, so the
// two can never drift out of sync. Plain data (no JSX) so this file can be
// imported directly by both Landing.jsx (via Vite) and scripts/prerender.mjs
// (via plain Node ESM).
export const FAQS = [
  {
    question: 'Wat is MamaBuddy?',
    shortAnswer:
      'MamaBuddy is een persoonlijke coach-app voor moeders in Nederland en België. Via een 24/7 beschikbare chat met Buddy krijg je emotionele steun, praktische hulp bij mental load, en een plek waar je zonder oordeel mag zeggen hoe het écht met je gaat.',
    detail: 'Geen wachtlijst, geen afspraak nodig — je begint direct een gesprek.',
  },
  {
    question: 'Is MamaBuddy gratis?',
    shortAnswer:
      'Ja, MamaBuddy heeft een gratis versie met dagelijkse check-ins en 3 chatberichten per dag. De Premium-versie (€7,99 per maand) geeft onbeperkt toegang tot Buddy en extra functies zoals het volledige geheugen en de toeslagen-checker.',
    detail: 'Je kunt maandelijks opzeggen, zonder verborgen kosten.',
  },
  {
    question: 'Wat is een mama coach en heb ik dat nodig?',
    shortAnswer:
      'Een mama coach is iemand (of, bij MamaBuddy, een Buddy) die moeders helpt met de mentale en emotionele last van het moederschap — schuldgevoelens, vermoeidheid, mental load. Onderzoek toont dat 9 op de 10 moeders dagelijks stress ervaart, dus voor veel moeders is laagdrempelige, altijd beschikbare steun waardevol.',
    detail: 'MamaBuddy vervangt geen professionele hulp, maar is er wél elke dag, op elk moment.',
  },
  {
    question: 'Wat is mama burn-out en wat kan ik eraan doen?',
    shortAnswer:
      'Mama burn-out is chronische uitputting door de combinatie van zorgtaken, mentale belasting en het gebrek aan herstel. Vroege signalen zijn prikkelbaarheid, schuldgevoel, en het gevoel altijd "aan" te staan. Dagelijkse check-ins, het delen van je gevoelens, en het verminderen van mental load (zoals met MamaBuddy\'s "Mijn Hoofd" functie) kunnen helpen.',
    detail: 'Bij ernstige klachten verwijst Buddy altijd door naar een huisarts.',
  },
  {
    question: 'Hoe werkt MamaBuddy precies?',
    shortAnswer:
      'Je maakt gratis een account met alleen je e-mailadres (geen wachtwoord nodig). Daarna praat je met Buddy via chat, doe je een dagelijkse check-in van 2 minuten, en kun je je mentale lijstjes kwijt in "Mijn Hoofd." Buddy onthoudt wat je vertelt zodat elk gesprek persoonlijker wordt.',
    detail: 'Alles werkt direct in de browser of als app op je telefoon — geen download nodig.',
  },
  {
    question: 'Is MamaBuddy veilig en wat gebeurt er met mijn gegevens?',
    shortAnswer:
      'Ja. Alle gesprekken worden versleuteld opgeslagen op servers binnen Europa. MamaBuddy deelt geen gegevens met derden, en je kunt op elk moment inzien en verwijderen wat Buddy over je heeft onthouden.',
    detail: 'Jij bepaalt zelf wat Buddy onthoudt — niets gebeurt zonder jouw controle.',
  },
  {
    question: 'Voor wie is MamaBuddy bedoeld?',
    shortAnswer:
      'MamaBuddy is gemaakt voor moeders in Nederland en België die behoefte hebben aan emotionele steun, hulp bij mental load, of gewoon iemand die 24/7 luistert zonder oordeel — of het nu gaat om een pasgeboren baby of oudere kinderen.',
    detail: 'Of je nu voor het eerst moeder bent of al meerdere kinderen hebt, Buddy past zich aan jouw situatie aan.',
  },
  {
    question: 'Wat is het verschil tussen MamaBuddy en therapie?',
    shortAnswer:
      'MamaBuddy is geen vervanging voor therapie of medische zorg — het is een laagdrempelig, altijd beschikbaar aanvullend hulpmiddel voor dagelijkse steun. Bij ernstigere zorgen verwijst Buddy altijd door naar een huisarts of professional.',
    detail: 'Denk aan Buddy als een warme eerste stap, niet als eindpunt.',
  },
  {
    question: 'Werkt MamaBuddy ook in België?',
    shortAnswer:
      'Ja, MamaBuddy is specifiek gebouwd voor moeders in zowel Nederland als België, inclusief content die rekening houdt met beide landen (zoals de toeslagen- en regelingenchecker).',
    detail: 'De taal en voorbeelden zijn afgestemd op beide landen.',
  },
];
