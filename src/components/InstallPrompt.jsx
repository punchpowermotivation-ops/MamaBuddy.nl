import { useEffect, useState } from 'react';

const DISMISS_KEY = 'mamabuddy-install-dismissed-until';
const DISMISS_DAYS = 14;

function isStandalone() {
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
}

function isIos() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent) && !window.MSStream;
}

function isDismissed() {
  const until = localStorage.getItem(DISMISS_KEY);
  return until && Number(until) > Date.now();
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [platform, setPlatform] = useState(null); // 'android' | 'ios'
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isStandalone() || isDismissed()) return;

    if (isIos()) {
      setPlatform('ios');
      const timer = setTimeout(() => setVisible(true), 2500);
      return () => clearTimeout(timer);
    }

    function onBeforeInstallPrompt(e) {
      e.preventDefault();
      setDeferredPrompt(e);
      setPlatform('android');
      setVisible(true);
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
  }, []);

  function dismiss() {
    setVisible(false);
    localStorage.setItem(
      DISMISS_KEY,
      String(Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000),
    );
  }

  async function install() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed left-3 right-3 bottom-[calc(84px+env(safe-area-inset-bottom))] z-[999] bg-white border border-line rounded-2xl shadow-[0_10px_30px_rgba(30,26,24,.12)] px-4 py-3.5 flex items-center gap-3 animate-[fadeIn_.4s_ease]">
      <div className="w-11 h-11 rounded-xl bg-rose-light flex items-center justify-center flex-shrink-0">
        <svg viewBox="0 0 20 18" width="22" height="22" fill="#F2567A">
          <path d="M10 16.5S1 11 1 5a4 4 0 0 1 8-1 1 1 0 0 0 2 0 4 4 0 0 1 8 1c0 6-9 11.5-9 11.5z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13.5px] font-semibold text-ink">Zet MamaBuddy op je beginscherm</div>
        <div className="text-xs text-muted leading-snug mt-0.5">
          {platform === 'ios'
            ? <>Tik op <strong className="text-mid">Delen</strong> onderin, kies <strong className="text-mid">"Zet op beginscherm"</strong>.</>
            : 'Snel erbij, voelt als een echte app.'}
        </div>
      </div>
      {platform === 'android' && (
        <button
          onClick={install}
          className="bg-rose text-white text-xs font-semibold px-3.5 py-2 rounded-full flex-shrink-0 border-none cursor-pointer"
        >
          Installeer
        </button>
      )}
      <button
        onClick={dismiss}
        aria-label="Sluiten"
        className="text-muted text-lg leading-none px-1 flex-shrink-0 bg-transparent border-none cursor-pointer"
      >
        ✕
      </button>
    </div>
  );
}
