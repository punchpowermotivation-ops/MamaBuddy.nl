import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PaywallModal from '../components/PaywallModal';

const ICON_BG = {
  rose: 'bg-rose-light',
  green: 'bg-green-light',
  sand: 'bg-sand border border-line',
};

const NL_CARDS = [
  {
    icon: '👶',
    color: 'rose',
    title: 'Kinderopvangtoeslag',
    sub: 'Check dit als je kind naar opvang gaat',
    items: [
      'Je hebt recht op toeslag als beide ouders werken, studeren, of een traject volgen bij de gemeente.',
      'De hoogte hangt af van je inkomen — hoe lager, hoe meer toeslag.',
      'Vraag dit binnen 3 maanden na de eerste opvangdag aan, anders mis je met terugwerkende kracht.',
      'Veel ouders krijgen niet het volledige bedrag — een jaarlijkse check loont.',
    ],
    link: { text: 'Bereken je toeslag', sub: 'belastingdienst.nl', href: 'https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/toeslagen/kinderopvangtoeslag' },
    tip: true,
  },
  {
    icon: '🤰',
    color: 'green',
    title: 'Zwangerschaps- & bevallingsverlof',
    sub: 'De basis die je moet weten',
    items: [
      'Je hebt recht op minimaal 16 weken verlof, met volledige doorbetaling via het UWV.',
      'Verlof start 4 tot 6 weken vóór de uitgerekende datum — jij kiest binnen die marge.',
      'Partners hebben apart recht op geboorteverlof — vaak vergeten om aan te vragen.',
    ],
    link: { text: 'Alle verlofregels', sub: 'uwv.nl', href: 'https://www.uwv.nl/particulieren/zwanger/' },
  },
  {
    icon: '🏠',
    color: 'sand',
    title: 'Kindgebonden budget',
    sub: 'Extra steun per kind',
    items: [
      'Een extra bijdrage bovenop de kinderbijslag, afhankelijk van je inkomen en aantal kinderen.',
      'Wordt vaak automatisch toegekend, maar check altijd of het klopt.',
    ],
    link: { text: 'Check je bedrag', sub: 'belastingdienst.nl', href: 'https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/toeslagen/kindgebonden_budget' },
  },
  {
    icon: '📋',
    color: 'rose',
    title: 'Zorgtoeslag',
    sub: 'Vaak over het hoofd gezien',
    items: [
      'Tegemoetkoming in je zorgverzekering-premie, gebaseerd op je (gezamenlijk) inkomen.',
      'Verandert je inkomen door verlof of minder werken? Pas je toeslag dan ook aan.',
    ],
    link: { text: 'Bereken je zorgtoeslag', sub: 'belastingdienst.nl', href: 'https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/toeslagen/zorgtoeslag' },
  },
];

const BE_CARDS = [
  {
    icon: '👶',
    color: 'rose',
    title: 'Groeipakket',
    sub: 'De opvolger van de kinderbijslag',
    items: [
      'Sinds de regionalisering heet dit in Vlaanderen "Groeipakket" — Wallonië en Brussel hebben een eigen regeling met een andere naam en uitvoerder.',
      'Je krijgt dit automatisch bij de geboorte van je kind, zodra je aangesloten bent bij een uitbetaler — check of jouw aansluiting nog klopt.',
      'Naast het basisbedrag bestaan er extra toeslagen voor gezinnen met een lager inkomen of een specifieke gezinssituatie — vraag dit na bij je uitbetaler.',
    ],
    link: { text: 'Mijn Groeipakket (Vlaanderen)', sub: 'mijngroeipakket.be', href: 'https://www.mijngroeipakket.be/' },
    tip: true,
  },
  {
    icon: '🤰',
    color: 'green',
    title: 'Moederschapsrust & geboorteverlof',
    sub: 'De basis die je moet weten',
    items: [
      'Als werknemer heb je recht op moederschapsrust rond de bevalling, uitbetaald door je ziekenfonds (mutualiteit) — niet door je werkgever.',
      'Partners hebben apart recht op geboorteverlof, los van het moederschapsverlof — vaak niet volledig opgenomen.',
      'De exacte duur en voorwaarden verschillen per statuut (werknemer, zelfstandige, ambtenaar).',
    ],
    link: { text: 'Alles over moederschapsrust', sub: 'riziv.fgov.be', href: 'https://www.riziv.fgov.be/nl/themas/verzuim-en-invaliditeit/moederschap' },
  },
  {
    icon: '🏠',
    color: 'sand',
    title: 'Kinderopvang op inkomen',
    sub: 'Betaal je wel de juiste dagprijs?',
    items: [
      'Erkende kinderopvang (via Kind en Gezin in Vlaanderen, of ONE in Wallonië/Brussel) rekent vaak een dagprijs die meestijgt of -daalt met je inkomen.',
      'Hoe lager je inkomen, hoe lager de dagprijs — vraag dit na bij je opvang of het regionale gezinsagentschap.',
      'Zelfstandige opvang buiten dit systeem hanteert meestal een vaste prijs, zonder inkomenskorting.',
    ],
    link: { text: 'Opvang zoeken & regels', sub: 'kindengezin.be', href: 'https://www.kindengezin.be/' },
  },
  {
    icon: '📋',
    color: 'rose',
    title: 'Verhoogde tegemoetkoming',
    sub: 'Vaak over het hoofd gezien',
    items: [
      'Gezinnen met een lager inkomen kunnen recht hebben op een "verhoogde tegemoetkoming" bij het ziekenfonds, wat je zorgkosten verlaagt.',
      'Dit wordt niet altijd automatisch toegekend — check dit zelf bij je mutualiteit/ziekenfonds.',
    ],
    link: { text: 'Check bij je ziekenfonds', sub: 'riziv.fgov.be', href: 'https://www.riziv.fgov.be/nl/themas/kost-terugbetaling/verhoogde-tegemoetkoming' },
  },
];

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" stroke="#2D8C6A" fill="none" strokeWidth="2.4" className="flex-shrink-0 mt-0.5">
      <path d="M5 12l5 5L20 7" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

function RegelingCard({ card, isOpen, onToggle, locked, onLockedClick }) {
  return (
    <div className="bg-white border border-line rounded-[20px] mb-3.5 overflow-hidden">
      <div
        onClick={locked ? onLockedClick : onToggle}
        className="px-[18px] pt-[18px] pb-3.5 flex items-start gap-3.5 cursor-pointer"
      >
        <div className={`w-11 h-11 rounded-[13px] flex items-center justify-center text-xl flex-shrink-0 ${ICON_BG[card.color]}`}>
          {card.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[15.5px] font-semibold text-ink mb-0.5">{card.title}</h3>
          <div className="text-[12.5px] text-muted">{card.sub}</div>
        </div>
        {locked ? (
          <div className="w-6 h-6 rounded-full bg-sand flex items-center justify-center text-muted flex-shrink-0 mt-0.5">
            <LockIcon />
          </div>
        ) : (
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            stroke="#9B8F88"
            fill="none"
            strokeWidth="2"
            className={`flex-shrink-0 mt-1 transition-transform duration-250 ${isOpen ? 'rotate-180' : ''}`}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        )}
      </div>
      {locked && (
        <div className="px-[18px] pb-5">
          <button
            onClick={onLockedClick}
            className="w-full bg-rose-light text-rose-dark rounded-[13px] py-3 text-[13px] font-semibold border-none cursor-pointer"
          >
            Ontgrendel met Premium →
          </button>
        </div>
      )}
      {!locked && (
        <div
          className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
          style={{ maxHeight: isOpen ? 400 : 0 }}
        >
          <div className="px-[18px] pb-5">
            <div className="flex flex-col gap-2.5 mb-4">
              {card.items.map((item) => (
                <div key={item} className="flex items-start gap-2.5 text-[13.5px] text-ink leading-[1.5]">
                  <CheckIcon />
                  {item}
                </div>
              ))}
            </div>
            <a
              href={card.link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between bg-sand rounded-[13px] px-[15px] py-3.5 no-underline text-ink"
            >
              <div>
                <div className="text-[13px] font-semibold">{card.link.text}</div>
                <div className="text-[11px] text-muted mt-0.5">{card.link.sub}</div>
              </div>
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="#5C4F47" fill="none" strokeWidth="2" className="flex-shrink-0">
                <path d="M7 17L17 7M7 7h10v10" />
              </svg>
            </a>
            {card.tip && (
              <div className="flex gap-2.5 items-start mt-3.5 pt-3.5 border-t border-line">
                <div className="w-6.5 h-6.5 bg-rose-light rounded-full flex items-center justify-center flex-shrink-0">
                  <svg viewBox="0 0 20 18" width="13" height="13" fill="#F2567A">
                    <path d="M10 16.5S1 11 1 5a4 4 0 0 1 8-1 1 1 0 0 0 2 0 4 4 0 0 1 8 1c0 6-9 11.5-9 11.5z" />
                  </svg>
                </div>
                <div className="text-[12.5px] text-mid leading-[1.5] italic">
                  "Wil je dat ik met je meedenk over jouw situatie? Praat er gewoon over in de chat 💛"
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Toeslagen() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const isPremium = profile?.subscription_status === 'premium';
  const [country, setCountry] = useState('nl');
  const [openIndex, setOpenIndex] = useState(0);
  const [paywallOpen, setPaywallOpen] = useState(false);

  const cards = country === 'nl' ? NL_CARDS : BE_CARDS;

  function switchCountry(next) {
    setCountry(next);
    setOpenIndex(0);
  }

  return (
    <div className="app-page pb-6 bg-cream">
      <div className="bg-white border-b border-line flex items-center gap-3 px-4 pb-3.5 pt-[calc(14px+env(safe-area-inset-top))]">
        <button
          onClick={() => navigate('/profiel')}
          aria-label="Terug"
          className="w-9 h-9 flex items-center justify-center flex-shrink-0 bg-transparent border-none cursor-pointer text-ink"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" fill="none" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h1 className="text-[16px] font-semibold text-ink">Toeslagen & regelingen</h1>
      </div>

      <div className="px-5 pt-5">
        <div className="mb-5.5">
          <h2 className="font-serif text-2xl font-normal text-ink leading-tight mb-2">Waar heb jij recht op?</h2>
          <p className="text-sm text-mid leading-relaxed">
            De belangrijkste regelingen in gewone taal. Voor actuele bedragen verwijzen we altijd naar de officiële bron.
          </p>
        </div>

        <div className="flex gap-2 mb-6 bg-sand p-1 rounded-[14px]">
          <button
            onClick={() => switchCountry('nl')}
            className={`flex-1 py-2.5 rounded-[11px] text-[13.5px] font-semibold border-none cursor-pointer flex items-center justify-center gap-1.5 transition-colors ${
              country === 'nl' ? 'bg-white text-ink shadow-[0_2px_8px_rgba(30,26,24,.06)]' : 'bg-transparent text-muted'
            }`}
          >
            🇳🇱 Nederland
          </button>
          <button
            onClick={() => switchCountry('be')}
            className={`flex-1 py-2.5 rounded-[11px] text-[13.5px] font-semibold border-none cursor-pointer flex items-center justify-center gap-1.5 transition-colors ${
              country === 'be' ? 'bg-white text-ink shadow-[0_2px_8px_rgba(30,26,24,.06)]' : 'bg-transparent text-muted'
            }`}
          >
            🇧🇪 België
          </button>
        </div>

        {cards.map((card, i) => (
          <RegelingCard
            key={card.title}
            card={card}
            isOpen={openIndex === i}
            onToggle={() => setOpenIndex((cur) => (cur === i ? -1 : i))}
            locked={!isPremium && i > 0}
            onLockedClick={() => setPaywallOpen(true)}
          />
        ))}

        <div className="bg-rose-soft rounded-2xl px-[18px] py-4 mt-2 flex gap-3 items-start">
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="#B83055" fill="none" strokeWidth="2" className="flex-shrink-0 mt-0.5">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
          <p className="text-[12.5px] text-mid leading-[1.55]">
            <strong className="text-ink">Let op:</strong> bedragen en regels veranderen jaarlijks. Deze pagina geeft de
            hoofdlijnen — check altijd de officiële site voor jouw exacte situatie.
          </p>
        </div>
      </div>

      <PaywallModal open={paywallOpen} onClose={() => setPaywallOpen(false)} />
    </div>
  );
}
