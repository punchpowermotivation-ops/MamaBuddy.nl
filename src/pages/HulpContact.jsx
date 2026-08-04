import { useNavigate } from 'react-router-dom';

export default function HulpContact() {
  const navigate = useNavigate();

  return (
    <div className="pb-6">
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
        <h1 className="text-[16px] font-semibold text-ink">Hulp & contact</h1>
      </div>

      <div className="px-5 pt-5">
        <p className="text-sm text-mid leading-relaxed mb-5">
          Loop je ergens tegenaan, of heb je een vraag? We lezen alles zelf en reageren zo snel
          mogelijk.
        </p>

        <div className="bg-white border border-line rounded-[20px] overflow-hidden mb-5">
          <a
            href="mailto:mamabuddynl@gmail.com"
            className="px-5 py-4 flex items-center gap-3.5 no-underline"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-light flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#F2567A" strokeWidth="2">
                <path d="M4 4h16v16H4z" opacity="0" />
                <path d="M3 6l9 7 9-7M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[14.5px] font-medium text-ink">Mail ons</div>
              <div className="text-[13px] text-muted">mamabuddynl@gmail.com</div>
            </div>
          </a>
        </div>

        <div className="bg-white border border-line rounded-[20px] overflow-hidden">
          <a href="https://mamabuddy.nl/#faq" className="px-5 py-4 flex items-center gap-3.5 no-underline">
            <div className="w-10 h-10 rounded-xl bg-green-light flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#2D8C6A" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.9.4-1.5 1.1-1.5 2.2M12 17h.01" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[14.5px] font-medium text-ink">Veelgestelde vragen</div>
              <div className="text-[13px] text-muted">Bekijk de FAQ op mamabuddy.nl</div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
