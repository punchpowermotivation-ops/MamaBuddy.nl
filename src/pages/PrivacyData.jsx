import { useNavigate, Link } from 'react-router-dom';

export default function PrivacyData() {
  const navigate = useNavigate();

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
        <h1 className="text-[16px] font-semibold text-ink">Privacy & data</h1>
      </div>

      <div className="px-5 pt-5">
        <p className="text-sm text-mid leading-relaxed mb-5">
          Jouw gegevens zijn van jou. We slaan alleen op wat nodig is om Buddy persoonlijk te
          laten aanvoelen, en niemand anders kan bij jouw gegevens — technisch afgedwongen, niet
          alleen een belofte.
        </p>

        <div className="bg-white border border-line rounded-[20px] overflow-hidden mb-5">
          <Link
            to="/privacybeleid"
            className="px-5 py-4 flex items-center gap-3.5 no-underline"
          >
            <span className="flex-1 text-[14.5px] text-ink">Lees ons volledige privacybeleid</span>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#9B8F88" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </Link>
        </div>

        <div className="bg-white border border-line rounded-[20px] overflow-hidden mb-5">
          <div className="px-5 py-4 border-b border-line">
            <div className="text-[14.5px] font-medium text-ink mb-1">Wat Buddy over jou weet</div>
            <p className="text-[13px] text-muted leading-snug">
              Feiten en inzichten die Buddy onthoudt kun je zelf bekijken, aanpassen of wissen in
              Profiel → "Wat Buddy over jou weet".
            </p>
          </div>
          <div className="px-5 py-4">
            <div className="text-[14.5px] font-medium text-ink mb-1">Account verwijderen</div>
            <p className="text-[13px] text-muted leading-snug">
              Wil je je account en alle bijbehorende gegevens laten verwijderen? Mail ons op{' '}
              <a href="mailto:mamabuddynl@gmail.com" className="text-rose">
                mamabuddynl@gmail.com
              </a>{' '}
              en we regelen dit voor je.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
