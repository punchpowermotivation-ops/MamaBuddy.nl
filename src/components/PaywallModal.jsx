import { useState } from 'react';
import { supabase } from '../lib/supabase';

const FEATURES = [
  'Onbeperkt praten met Buddy',
  "Buddy's volledige geheugen & inzichten",
  'Wekelijks persoonlijk overzicht',
  'Toeslagen & regelingen checker',
];

// Shared across every premium-gated spot in the app (chat daily limit,
// Toeslagen cards, ...) so there's one paywall look and one Mollie
// checkout flow instead of several diverging ad-hoc UIs.
export default function PaywallModal({ open, onClose }) {
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  async function startCheckout() {
    setStarting(true);
    setError('');
    const { data, error: fnError } = await supabase.functions.invoke('create-subscription');
    if (fnError || !data?.checkoutUrl) {
      setStarting(false);
      setError('Kon de betaling niet starten. Probeer het nog eens.');
      return;
    }
    window.location.href = data.checkoutUrl;
  }

  return (
    <div
      className="fixed inset-0 z-[2000] bg-black/40 flex items-end"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[420px] mx-auto bg-cream rounded-t-[32px] px-6 pt-3 pb-[calc(30px+env(safe-area-inset-bottom))]"
      >
        <div className="w-10 h-1 bg-line rounded-full mx-auto mb-5" />
        <div className="w-15 h-15 mx-auto mb-4 bg-rose-light rounded-full flex items-center justify-center">
          <svg viewBox="0 0 20 18" width="32" height="32" fill="#F2567A">
            <path d="M10 16.5S1 11 1 5a4 4 0 0 1 8-1 1 1 0 0 0 2 0 4 4 0 0 1 8 1c0 6-9 11.5-9 11.5z" />
          </svg>
        </div>
        <h2 className="font-serif text-2xl text-ink text-center mb-2">Buddy Premium</h2>
        <p className="text-sm text-mid text-center leading-relaxed mb-6">
          Voor als je meer dan een paar berichten per dag nodig hebt.
        </p>
        <div className="flex flex-col gap-3 mb-6">
          {FEATURES.map((f) => (
            <div key={f} className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-green-light flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 24 24" width="13" height="13" stroke="#2D8C6A" fill="none" strokeWidth="3">
                  <path d="M5 12l5 5L20 7" />
                </svg>
              </div>
              <span className="text-[14.5px] text-ink">{f}</span>
            </div>
          ))}
        </div>
        <div className="bg-white border-2 border-rose rounded-2xl px-5 py-4.5 mb-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-muted">Maandelijks · altijd opzegbaar</div>
            <div className="font-serif text-2xl text-ink">
              €7,99<span className="text-sm text-muted font-normal">/maand</span>
            </div>
          </div>
        </div>
        {error && <p className="text-rose-dark text-sm text-center mb-3">{error}</p>}
        <button
          onClick={startCheckout}
          disabled={starting}
          className="w-full bg-rose text-white rounded-2xl py-4 font-semibold text-base border-none cursor-pointer disabled:opacity-60"
        >
          {starting ? 'Even geduld…' : 'Start met Mollie →'}
        </button>
        <button
          onClick={onClose}
          disabled={starting}
          className="w-full bg-transparent text-muted text-sm py-3 mt-1 border-none cursor-pointer disabled:opacity-60"
        >
          Niet nu
        </button>
      </div>
    </div>
  );
}
