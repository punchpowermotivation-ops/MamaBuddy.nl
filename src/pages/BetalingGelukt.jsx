import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Reached after the Mollie checkout redirect. Mollie's webhook is what
// actually flips subscription_status — this page just refreshes the
// profile a few times so the UI catches up, since the webhook can land
// a moment after the redirect does.
export default function BetalingGelukt() {
  const navigate = useNavigate();
  const { profile, refreshProfile } = useAuth();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;

    async function poll() {
      attempts += 1;
      await refreshProfile();
      if (cancelled) return;
      if (attempts >= 6) {
        setChecking(false);
        return;
      }
      setTimeout(poll, 1500);
    }

    poll();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (profile?.subscription_status === 'premium') {
      setChecking(false);
    }
  }, [profile]);

  const isPremium = profile?.subscription_status === 'premium';

  return (
    <div className="app-shell bg-cream flex flex-col items-center justify-center px-8 text-center pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <div className="w-16 h-16 rounded-full bg-rose-light flex items-center justify-center mb-6">
        <svg viewBox="0 0 20 18" width="34" height="34" fill="#F2567A">
          <path d="M10 16.5S1 11 1 5a4 4 0 0 1 8-1 1 1 0 0 0 2 0 4 4 0 0 1 8 1c0 6-9 11.5-9 11.5z" />
        </svg>
      </div>

      {isPremium ? (
        <>
          <h1 className="font-serif text-2xl text-ink mb-2">Welkom bij Premium 💛</h1>
          <p className="text-sm text-mid leading-relaxed mb-8">
            Je betaling is gelukt. Je kunt nu onbeperkt met Buddy praten.
          </p>
        </>
      ) : checking ? (
        <>
          <h1 className="font-serif text-2xl text-ink mb-2">Even bevestigen…</h1>
          <p className="text-sm text-mid leading-relaxed mb-8">
            We wachten op de bevestiging van je betaling. Dit duurt meestal maar een paar
            seconden.
          </p>
        </>
      ) : (
        <>
          <h1 className="font-serif text-2xl text-ink mb-2">Nog niet bevestigd</h1>
          <p className="text-sm text-mid leading-relaxed mb-8">
            Het duurt iets langer dan verwacht. Kijk zo nog even in je profiel — als de
            betaling gelukt is, staat Premium daar binnen enkele minuten actief.
          </p>
        </>
      )}

      <button
        onClick={() => navigate('/profiel')}
        className="bg-rose text-white rounded-full px-8 py-4 font-semibold text-base border-none cursor-pointer"
      >
        Naar Profiel
      </button>
    </div>
  );
}
