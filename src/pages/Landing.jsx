import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FAQS } from '../data/faq';

// Mirrors the .reveal/.visible fade-up-on-scroll pattern from the HTML
// reference, per element, via IntersectionObserver.
function Reveal({ children, className = '' }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.unobserve(el);
        }
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[18px]'
      } ${className}`}
    >
      {children}
    </div>
  );
}

function CheckIcon({ muted = false }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke={muted ? '#9B8F88' : '#2D8C6A'}
      strokeWidth="2.4"
      className="flex-shrink-0 mt-0.5"
    >
      <path d="M5 12l5 5L20 7" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#9B8F88" strokeWidth="2.4" className="flex-shrink-0 mt-0.5">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

const FEATURES = [
  {
    icon: '💛',
    bg: 'bg-rose-light',
    title: 'Buddy, jouw coach als mama',
    text: 'Niet alleen over je kind. Over hoe jij het doet. Schuldgevoelens, vermoeidheid, relatie — Buddy begrijpt het allemaal.',
    tag: 'Kern feature',
  },
  {
    icon: '🧠',
    bg: 'bg-green-light',
    title: 'Onthoudt wat er speelt',
    text: 'Buddy bouwt een beeld op van jouw situatie. Jij bepaalt wat hij onthoudt — en kunt het altijd inzien of wissen.',
  },
  {
    icon: '✓',
    bg: 'bg-rose-light',
    title: 'Mijn Hoofd — mental load ontladen',
    text: 'Zet alle rondspokende lijstjes ergens neer. Buddy helpt ordenen en herinnert je eraan.',
    tag: 'Alleen bij MamaBuddy',
  },
  {
    icon: '📋',
    bg: 'bg-sand border border-line',
    title: 'Toeslagen & regelingen checker',
    text: 'Kinderopvangtoeslag, verlofregels — in gewone taal. Speciaal voor Nederland en België.',
  },
  {
    icon: '⚡',
    bg: 'bg-green-light',
    title: '24/7 beschikbaar',
    text: "Om 3 uur 's nachts, in de pauze, op de wc — Buddy is er altijd. Geen wachttijd, geen afspraken.",
  },
  {
    icon: '🔒',
    bg: 'bg-rose-light',
    title: 'Privé & veilig',
    text: 'Versleuteld, opgeslagen in Europa, nooit gedeeld. Jij bepaalt wat je deelt en kunt alles wissen.',
  },
];

const TESTIMONIALS = [
  {
    text: '"Eindelijk een app die niet over het kind gaat, maar over mij. Ik had tranen in mijn ogen bij het eerste gesprek."',
    initials: 'SV',
    name: 'Sophie V.',
    meta: 'Moeder van 2, Utrecht',
  },
  {
    text: '"Buddy voelt niet als een chatbot. Het voelt als die vriendin die altijd beschikbaar is en nooit oordeelt."',
    initials: 'NB',
    name: 'Nathalie B.',
    meta: 'Moeder van 3, Antwerpen',
  },
  {
    text: '"Mijn Hoofd alleen al was het waard. Ik heb voor het eerst in maanden geen lijstjes meer in mijn hoofd rondspoken."',
    initials: 'AK',
    name: 'Ayşe K.',
    meta: 'Moeder van 1, Amsterdam',
  },
];

const FLOW_STEPS = [
  {
    title: 'Dagelijkse check-in',
    text: 'Elke ochtend 2 minuten. Buddy vraagt hoe je erbij staat. Niet als formulier — als een gesprek dat écht iets vraagt.',
  },
  {
    title: 'Buddy leert je kennen',
    text: 'Elk gesprek bouwt verder op het vorige. Buddy onthoudt wat er speelt, zodat jij het niet steeds opnieuw hoeft uit te leggen.',
  },
  {
    title: 'Leg je hoofd leeg',
    text: 'Alle lijstjes die rondspoken — gymschoenen, tandarts, cadeaus — zet je in Mijn Hoofd. Dat alleen al geeft rust.',
  },
  {
    title: 'Jij krijgt energie terug',
    text: 'Praktische inzichten, oprechte erkenning, en het gevoel dat je er niet alleen voor staat — elke dag een beetje meer.',
  },
];

export default function Landing() {
  return (
    <div className="bg-cream text-ink" style={{ overflowX: 'hidden' }}>
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-[100] px-[5%] py-4.5 flex items-center justify-between bg-cream/92 backdrop-blur-md border-b border-ink/[.06]">
        <a href="#" aria-label="MamaBuddy" className="flex items-center">
          <svg width="150" height="34" viewBox="0 0 240 52" fill="none">
            <circle cx="26" cy="26" r="22" stroke="#F2567A" strokeWidth="2.8" />
            <path
              d="M26 38C26 38 15 30.5 15 21.5C15 17.9 17.9 15 21.5 15C23.4 15 25.1 15.8 26 17.1C26.9 15.8 28.6 15 30.5 15C34.1 15 37 17.9 37 21.5C37 30.5 26 38 26 38Z"
              fill="#F2567A"
            />
            <text x="60" y="34" fontFamily="Fraunces,serif" fontSize="26" fontWeight="600" fill="#1E2640">
              MamaBuddy
            </text>
          </svg>
        </a>
        <Link
          to="/welkom"
          className="bg-rose text-white px-6 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all hover:bg-rose-dark hover:-translate-y-0.5"
        >
          Probeer gratis →
        </Link>
      </nav>

      {/* HERO */}
      <section className="max-w-[1140px] mx-auto px-[5%] pt-[150px] pb-[90px] grid md:grid-cols-[1.05fr_.95fr] gap-11 items-center">
        <div>
          <div
            className="fade-up inline-flex items-center gap-2 bg-rose-light text-rose-dark px-3.5 py-1.5 rounded-full text-[13px] font-medium mb-6"
            style={{ animationDelay: '0s' }}
          >
            <span className="w-1.5 h-1.5 bg-rose rounded-full animate-pulse" />
            Nu beschikbaar — gratis te proberen
          </div>
          <h1
            className="fade-up font-serif text-[clamp(38px,4.6vw,58px)] font-normal leading-[1.08] mb-5"
            style={{ animationDelay: '.1s' }}
          >
            Jij bent <em className="not-italic italic text-rose">meer</em>
            <br />
            dan alleen mama.
          </h1>
          <p
            className="fade-up text-lg text-mid leading-[1.7] mb-8 font-light max-w-[480px]"
            style={{ animationDelay: '.2s' }}
          >
            MamaBuddy is jouw persoonlijke Buddy. Voor de momenten dat het zwaar voelt, je hoofd vol
            zit, en je gewoon even iemand nodig hebt die begrijpt wat moederschap echt vraagt.
          </p>
          <div className="fade-up flex gap-3 flex-wrap" style={{ animationDelay: '.3s' }}>
            <Link
              to="/welkom"
              className="bg-rose text-white px-7.5 py-4 rounded-full text-base font-medium inline-flex items-center gap-2 transition-all hover:bg-rose-dark hover:-translate-y-0.5"
            >
              Start gratis met Buddy →
            </Link>
            <a
              href="#hoe"
              className="bg-transparent text-ink px-6 py-4 rounded-full text-base font-medium border-[1.5px] border-line transition-colors hover:border-mid hover:bg-white"
            >
              Hoe het werkt
            </a>
          </div>
          <p
            className="fade-up mt-4.5 text-[13px] text-muted flex items-center gap-1.5"
            style={{ animationDelay: '.4s' }}
          >
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="#9B8F88" fill="none" strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Geen creditcard nodig · privé & versleuteld · opgeslagen in Europa
          </p>
        </div>

        <div className="fade-up relative" style={{ animationDelay: '.3s' }}>
          <div className="w-[300px] mx-auto bg-white rounded-[38px] border border-ink/[.08] p-3.5 shadow-[0_40px_90px_rgba(30,26,24,.14),0_4px_24px_rgba(242,86,122,.08)] relative">
            <div className="bg-cream rounded-[26px] overflow-hidden px-4.5 pt-6 pb-5">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-[34px] h-[34px] bg-rose-light rounded-full flex items-center justify-center flex-shrink-0">
                  <svg viewBox="0 0 20 18" width="18" height="18" fill="#F2567A">
                    <path d="M10 16.5S1 11 1 5a4 4 0 0 1 8-1 1 1 0 0 0 2 0 4 4 0 0 1 8 1c0 6-9 11.5-9 11.5z" />
                  </svg>
                </div>
                <div>
                  <div className="text-[13px] font-semibold">Buddy</div>
                  <div className="text-[10.5px] text-green flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green rounded-full" />
                    altijd beschikbaar
                  </div>
                </div>
              </div>
              <div className="inline-flex items-center gap-1.5 bg-rose-soft text-rose-dark px-2.5 py-1 rounded-full text-[9.5px] font-semibold mb-3">
                <svg viewBox="0 0 20 18" width="9" height="9" fill="#F2567A">
                  <path d="M10 16.5S1 11 1 5a4 4 0 0 1 8-1 1 1 0 0 0 2 0 4 4 0 0 1 8 1c0 6-9 11.5-9 11.5z" />
                </svg>
                Buddy herinnert zich jullie gesprek
              </div>
              <div className="bg-white shadow-[0_1px_6px_rgba(30,26,24,.04)] rounded-2xl rounded-bl-[4px] px-3.5 py-2.5 text-[13px] leading-relaxed mb-2.5 max-w-[85%]">
                Hé 👋 Hoe voel jij je vandaag écht?
              </div>
              <div className="bg-rose text-white rounded-2xl rounded-br-[4px] px-3.5 py-2.5 text-[13px] leading-relaxed mb-2.5 max-w-[85%] ml-auto">
                Eerlijk? Uitgeput. En ik voel me schuldig dat ik geïrriteerd was 😔
              </div>
              <div className="bg-white shadow-[0_1px_6px_rgba(30,26,24,.04)] rounded-2xl rounded-bl-[4px] px-3.5 py-2.5 text-[13px] leading-relaxed max-w-[85%]">
                Dat je geïrriteerd was betekent niet dat je faalt — het betekent dat je moe bent. Dat
                is een signaal, geen falen. 💛
              </div>
            </div>
          </div>
          <div className="animate-float-a hidden sm:flex absolute left-[-46px] top-[60px] bg-white border border-ink/[.06] rounded-2xl px-3.5 py-2.5 shadow-[0_10px_30px_rgba(30,26,24,.1)] items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-green-light flex items-center justify-center text-[13px]">💬</div>
            <div>
              <div className="text-[11.5px] font-semibold text-ink">24/7 beschikbaar</div>
              <div className="text-[9.5px] text-muted">altijd iemand die luistert</div>
            </div>
          </div>
          <div className="animate-float-b hidden sm:flex absolute right-[-40px] bottom-[70px] bg-white border border-ink/[.06] rounded-2xl px-3.5 py-2.5 shadow-[0_10px_30px_rgba(30,26,24,.1)] items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-rose-light flex items-center justify-center text-[13px]">🧠</div>
            <div>
              <div className="text-[11.5px] font-semibold text-ink">Onthoudt jou</div>
              <div className="text-[9.5px] text-muted">geen dossier, wel vertrouwen</div>
            </div>
          </div>
        </div>
      </section>

      {/* PAIN */}
      <section className="bg-ink px-[5%] py-[88px]">
        <div className="max-w-[980px] mx-auto">
          <div className="text-[12.5px] font-medium tracking-[1.6px] uppercase text-rose mb-4">
            Herken jij dit?
          </div>
          <h2 className="font-serif text-[clamp(28px,3.6vw,42px)] font-normal text-white leading-[1.2] mb-11">
            Moeders staan <em className="not-italic italic text-rose">altijd aan.</em>
          </h2>
          <div className="grid gap-4.5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
            {[
              { quote: '"Ik weet niet meer waar ik eindig en de mama begint."', src: '— Staat van Gezinnen 2025' },
              {
                quote: '"9 op de 10 moeders ervaren dagelijks stress. 1 op de 12 krijgt een mama burn-out."',
                src: '— Onderzoek 2025',
              },
              { quote: '"Er zijn apps voor je baby. Maar wie denkt er aan jou?"', src: '— MamaBuddy' },
            ].map((p) => (
              <Reveal key={p.src}>
                <div className="bg-white/5 border border-white/[.09] rounded-[20px] p-6.5 h-full">
                  <p className="font-serif italic text-[15.5px] text-white/85 leading-relaxed mb-3.5 border-l-[3px] border-rose pl-3.5">
                    {p.quote}
                  </p>
                  <p className="text-[11px] text-white/30">{p.src}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="hoe" className="max-w-[1080px] mx-auto px-[5%] py-[100px]">
        <div className="text-[12.5px] font-medium tracking-[1.6px] uppercase text-rose mb-4 text-center">
          Hoe het werkt
        </div>
        <h2 className="font-serif text-[clamp(28px,3.6vw,42px)] font-normal text-center mb-16 leading-[1.2]">
          Jouw Buddy. Elke dag. <em className="not-italic italic text-rose">Echt voor jou.</em>
        </h2>
        <div className="flex flex-col">
          {FLOW_STEPS.map((step, i) => (
            <Reveal key={step.title}>
              <div
                className="grid gap-5 sm:gap-6.5 py-8 relative"
                style={{ gridTemplateColumns: '52px 1fr' }}
              >
                {i < FLOW_STEPS.length - 1 && (
                  <div
                    className="absolute w-[1.5px] bg-gradient-to-b from-rose to-line"
                    style={{ left: 25, top: 76, bottom: -32 }}
                  />
                )}
                <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-full bg-rose-light border-[1.5px] border-rose flex items-center justify-center font-serif text-lg sm:text-xl text-rose flex-shrink-0 z-[1]">
                  {i + 1}
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 pt-3">{step.title}</h3>
                  <p className="text-[15.5px] text-mid leading-[1.7] max-w-[520px]">{step.text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="bg-sand px-[5%] py-24">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-[12.5px] font-medium tracking-[1.6px] uppercase text-rose mb-4 text-center">
            Wat je krijgt
          </div>
          <h2 className="font-serif text-[clamp(26px,3.6vw,42px)] font-normal text-center mb-13 leading-[1.2]">
            Gebouwd voor <em className="not-italic italic">echte</em> moeders
          </h2>
          <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            {FEATURES.map((f) => (
              <Reveal key={f.title}>
                <div className="bg-white rounded-[22px] p-7.5 border border-ink/[.06] transition-all hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(30,26,24,.06)] h-full">
                  <div className={`w-[50px] h-[50px] rounded-2xl flex items-center justify-center text-2xl mb-4.5 ${f.bg}`}>
                    {f.icon}
                  </div>
                  <h3 className="text-[17.5px] font-semibold mb-2">{f.title}</h3>
                  <p className="text-[14.5px] text-mid leading-[1.7] font-light">{f.text}</p>
                  {f.tag && (
                    <span className="inline-block mt-3.5 bg-rose-light text-rose-dark px-3 py-1 rounded-full text-[11px] font-semibold">
                      {f.tag}
                    </span>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* PRICE */}
      <section className="max-w-[900px] mx-auto px-[5%] py-[100px] text-center">
        <div className="text-[12.5px] font-medium tracking-[1.6px] uppercase text-rose mb-4">Prijzen</div>
        <h2 className="font-serif text-[clamp(26px,3.6vw,42px)] font-normal mb-3.5 leading-[1.2]">
          Begin gratis. <em className="not-italic italic text-rose">Groei mee</em> als je meer nodig hebt.
        </h2>
        <p className="text-[16.5px] text-mid font-light mb-13">
          Geen verrassingen, geen verborgen kosten. Zeg op wanneer je wilt.
        </p>
        <div className="grid gap-6 text-left" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          <Reveal>
            <div className="bg-white border-[1.5px] border-line rounded-3xl p-8.5 h-full">
              <div className="text-[15px] font-semibold text-muted mb-2.5">Gratis</div>
              <div className="font-serif text-[40px] font-normal mb-1">
                €0<span className="text-base text-muted font-normal">/maand</span>
              </div>
              <div className="text-[13.5px] text-mid mb-6">Om te voelen of Buddy bij je past.</div>
              <div className="flex flex-col gap-3 mb-7">
                <div className="flex items-start gap-2.5 text-[14.5px]">
                  <CheckIcon />
                  Dagelijkse check-in, onbeperkt
                </div>
                <div className="flex items-start gap-2.5 text-[14.5px]">
                  <CheckIcon />3 chatberichten per dag
                </div>
                <div className="flex items-start gap-2.5 text-[14.5px]">
                  <CheckIcon />
                  Mijn Hoofd — mental load lijst
                </div>
                <div className="flex items-start gap-2.5 text-[14.5px] text-muted">
                  <XIcon />
                  Onbeperkt chatten
                </div>
                <div className="flex items-start gap-2.5 text-[14.5px] text-muted">
                  <XIcon />
                  Buddy's volledige geheugen
                </div>
              </div>
              <Link
                to="/welkom"
                className="block text-center w-full py-3.5 rounded-full text-[15px] font-semibold border-[1.5px] border-line text-ink transition-colors hover:border-mid"
              >
                Start gratis
              </Link>
            </div>
          </Reveal>

          <Reveal>
            <div className="bg-white border-[1.5px] border-rose rounded-3xl p-8.5 relative shadow-[0_20px_50px_rgba(242,86,122,.12)] h-full">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-rose text-white text-xs font-semibold px-4 py-1.5 rounded-full whitespace-nowrap">
                Meest gekozen
              </div>
              <div className="text-[15px] font-semibold text-muted mb-2.5">Premium</div>
              <div className="font-serif text-[40px] font-normal mb-1">
                €7,99<span className="text-base text-muted font-normal">/maand</span>
              </div>
              <div className="text-[13.5px] text-mid mb-6">Voor als je Buddy echt wilt leren kennen.</div>
              <div className="flex flex-col gap-3 mb-7">
                <div className="flex items-start gap-2.5 text-[14.5px]">
                  <CheckIcon />
                  Onbeperkt chatten met Buddy
                </div>
                <div className="flex items-start gap-2.5 text-[14.5px]">
                  <CheckIcon />
                  Buddy's volledige geheugen & inzichten
                </div>
                <div className="flex items-start gap-2.5 text-[14.5px]">
                  <CheckIcon />
                  Wekelijks persoonlijk overzicht
                </div>
                <div className="flex items-start gap-2.5 text-[14.5px]">
                  <CheckIcon />
                  Toeslagen & regelingen checker
                </div>
                <div className="flex items-start gap-2.5 text-[14.5px]">
                  <CheckIcon />
                  Altijd maandelijks opzegbaar
                </div>
              </div>
              <Link
                to="/welkom"
                className="block text-center w-full py-3.5 rounded-full text-[15px] font-semibold bg-ink text-white transition-all hover:bg-black hover:-translate-y-0.5"
              >
                Start met Premium
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="max-w-[1000px] mx-auto px-[5%] py-24 text-center">
        <div className="text-[12.5px] font-medium tracking-[1.6px] uppercase text-rose mb-4">
          Wat moeders zeggen
        </div>
        <h2 className="font-serif text-[clamp(24px,3.4vw,38px)] font-normal leading-[1.2] mb-11">
          Echte verhalen van
          <br />
          echte moeders
        </h2>
        <div className="grid gap-5 text-left" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          {TESTIMONIALS.map((t) => (
            <Reveal key={t.name}>
              <div className="bg-white rounded-[20px] p-6.5 border border-ink/[.06] h-full">
                <div className="text-[#F5A623] text-sm mb-3">★★★★★</div>
                <p className="font-serif italic text-[15.5px] text-ink leading-relaxed mb-4">{t.text}</p>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-rose-light text-rose-dark flex items-center justify-center text-[13px] font-semibold flex-shrink-0">
                    {t.initials}
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold">{t.name}</div>
                    <div className="text-xs text-muted">{t.meta}</div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-sand px-[5%] py-24">
        <div className="max-w-[760px] mx-auto">
          <div className="text-[12.5px] font-medium tracking-[1.6px] uppercase text-rose mb-4 text-center">
            Veelgestelde vragen
          </div>
          <h2 className="font-serif text-[clamp(26px,3.6vw,42px)] font-normal text-center mb-13 leading-[1.2]">
            Alles wat je wilt weten
          </h2>
          <div className="flex flex-col gap-8">
            {FAQS.map((faq) => (
              <Reveal key={faq.question}>
                <div className="bg-white rounded-2xl border border-ink/[.06] p-7">
                  <h3 className="text-lg font-semibold mb-2.5">{faq.question}</h3>
                  <p className="text-[15px] text-mid leading-[1.7]">{faq.shortAnswer}</p>
                  {faq.detail && (
                    <p className="text-[15px] text-mid leading-[1.7] mt-2">{faq.detail}</p>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-rose px-[5%] py-[100px] text-center relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,.15) 0%, transparent 60%)',
          }}
        />
        <h2 className="relative font-serif text-[clamp(30px,4.6vw,50px)] font-normal text-white leading-[1.2] mb-4">
          Klaar om <em className="not-italic italic opacity-85">eindelijk</em>
          <br />
          voor jezelf te kiezen?
        </h2>
        <p className="relative text-lg text-white/82 font-light mb-9 max-w-[480px] mx-auto">
          Start vandaag nog een gesprek met Buddy. Gratis, geen creditcard nodig, direct beschikbaar.
        </p>
        <div className="relative flex gap-3 justify-center flex-wrap">
          <Link
            to="/welkom"
            className="bg-white text-rose-dark px-8 py-4.5 rounded-full text-base font-semibold inline-flex items-center gap-2 transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_36px_rgba(0,0,0,.2)]"
          >
            Start gratis met Buddy →
          </Link>
        </div>
        <p className="relative mt-5.5 text-[13.5px] text-white/65">
          Duurt minder dan een minuut om te beginnen
        </p>
      </section>

      {/* FOOTER */}
      <footer className="px-[5%] py-11 text-center text-[13px] text-muted border-t border-line">
        <p className="mb-2.5 text-sm text-mid">Jouw Buddy. Altijd beschikbaar.</p>
        <p className="mb-2">
          <a href="#" className="text-rose no-underline">
            Privacy
          </a>{' '}
          &nbsp;·&nbsp;{' '}
          <a href="#" className="text-rose no-underline">
            Voorwaarden
          </a>{' '}
          &nbsp;·&nbsp;{' '}
          <a href="mailto:hallo@mamabuddy.nl" className="text-rose no-underline">
            hallo@mamabuddy.nl
          </a>
        </p>
        <p>© 2026 MamaBuddy · Gemaakt met ❤️ in Nederland</p>
      </footer>
    </div>
  );
}
