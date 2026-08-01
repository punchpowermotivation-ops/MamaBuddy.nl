import { useState } from 'react';
import Logo from '../components/Logo';
import { useAuth } from '../contexts/AuthContext';

export default function Welcome() {
  const [step, setStep] = useState('welcome'); // welcome | email | sent
  const [email, setEmail] = useState('');
  const [sentTo, setSentTo] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const { signInWithMagicLink, verifyEmailCode } = useAuth();

  async function handleSend(e) {
    e.preventDefault();
    if (!email.trim()) return;
    setSending(true);
    setError('');
    const { error } = await signInWithMagicLink(email.trim());
    setSending(false);
    if (error) {
      setError('Er ging iets mis. Probeer het nog eens.');
      return;
    }
    setSentTo(email.trim());
    setStep('sent');
  }

  async function handleVerifyCode(e) {
    e.preventDefault();
    if (!code.trim()) return;
    setVerifying(true);
    setCodeError('');
    const { error } = await verifyEmailCode(sentTo, code.trim());
    setVerifying(false);
    if (error) {
      setCodeError('Die code klopt niet (meer). Vraag een nieuwe aan.');
    }
  }

  if (step === 'email') {
    return (
      <div className="min-h-full bg-cream flex flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
        <div className="p-3 flex items-center">
          <button
            onClick={() => setStep('welcome')}
            className="w-10 h-10 rounded-full bg-sand flex items-center justify-center text-ink text-lg"
            aria-label="Terug"
          >
            ←
          </button>
        </div>
        <div className="flex-1 px-8 pt-2">
          <div className="w-15 h-15 rounded-2xl bg-rose-light flex items-center justify-center mb-6">
            <svg viewBox="0 0 24 24" width="30" height="30" fill="#F2567A">
              <path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z" />
            </svg>
          </div>
          <h2 className="font-serif text-3xl text-ink leading-tight mb-2.5">
            Log in met je
            <br />
            e-mailadres
          </h2>
          <p className="text-mid text-[15px] leading-relaxed mb-7">
            Geen wachtwoord nodig. We sturen je een veilige inloglink — één tik en je bent binnen.
          </p>
          <form onSubmit={handleSend}>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-ink mb-2">E-mailadres</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jouw@email.nl"
                className="w-full bg-white border-[1.5px] border-line rounded-2xl px-4.5 py-4 text-base text-ink outline-none focus:border-rose transition-colors"
              />
            </div>
            {error && <p className="text-rose-dark text-sm mb-3">{error}</p>}
            <button
              type="submit"
              disabled={sending}
              className="w-full bg-rose active:bg-rose-dark text-white rounded-2xl py-4 font-semibold text-base transition-colors disabled:opacity-60"
            >
              {sending ? 'Versturen…' : 'Stuur mij een inloglink →'}
            </button>
            <p className="text-xs text-muted text-center leading-relaxed mt-5 px-2">
              Door verder te gaan ga je akkoord met onze voorwaarden en privacyverklaring. Jouw
              gesprekken zijn privé en versleuteld.
            </p>
          </form>
        </div>
      </div>
    );
  }

  if (step === 'sent') {
    return (
      <div className="min-h-full bg-cream flex flex-col items-center justify-center text-center px-10 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
        <div className="w-24 h-24 rounded-full bg-rose-light flex items-center justify-center mb-7">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="#F2567A">
            <path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z" />
          </svg>
        </div>
        <h2 className="font-serif text-2xl text-ink leading-tight mb-3">Check je inbox 💛</h2>
        <p className="text-mid text-[15px] leading-relaxed">
          We hebben een inloglink gestuurd naar
        </p>
        <p className="font-semibold text-ink mb-1">{sentTo}</p>
        <div className="bg-white border border-line rounded-2xl px-4.5 py-4 mt-7 text-sm text-mid leading-relaxed">
          <strong className="text-ink">Geen mail?</strong> Kijk even in je spam-map, of wacht een
          paar seconden. De link is 15 minuten geldig.
        </div>

        <div className="w-full max-w-xs mt-7 pt-6 border-t border-line">
          <p className="text-xs text-muted leading-relaxed mb-3">
            App al toegevoegd aan je beginscherm? Tik niet op de link, maar vul hier de{' '}
            <strong className="text-mid">code uit de mail</strong> in — dan blijf je ingelogd in
            de app zelf.
          </p>
          <form onSubmit={handleVerifyCode} className="flex gap-2">
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={10}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="code"
              className="flex-1 bg-white border-[1.5px] border-line rounded-2xl px-4 py-3 text-base text-ink text-center tracking-[0.2em] outline-none focus:border-rose transition-colors"
            />
            <button
              type="submit"
              disabled={verifying || !code.trim()}
              className="bg-rose text-white rounded-2xl px-5 text-sm font-semibold border-none cursor-pointer disabled:opacity-50"
            >
              {verifying ? '…' : 'OK'}
            </button>
          </form>
          {codeError && <p className="text-rose-dark text-xs mt-2">{codeError}</p>}
        </div>

        <button
          onClick={() => setStep('email')}
          className="text-rose font-medium text-sm mt-6 bg-transparent border-none cursor-pointer"
        >
          Ander e-mailadres gebruiken
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-navy to-[#14110f] flex flex-col relative overflow-hidden pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <div className="flex-1 flex flex-col justify-center px-8 relative z-10">
        <div className="mb-11">
          <Logo variant="dark" />
        </div>
        <h1 className="font-serif text-4xl text-white leading-tight mb-4">
          Jouw persoonlijke
          <br />
          Buddy als <em className="text-rose not-italic italic">mama.</em>
        </h1>
        <p className="text-white/60 text-base leading-relaxed font-light">
          Voor als het moederschap even te veel is. 24/7, in het Nederlands, alleen voor jou.
        </p>
        <div className="mt-8 flex gap-2.5 items-start bg-white/8 border border-white/10 rounded-2xl rounded-bl-sm px-4.5 py-3.5 max-w-[88%]">
          <div className="w-6.5 h-6.5 rounded-full bg-rose-light flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 20 18" width="14" height="14" fill="#F2567A">
              <path d="M10 16.5S1 11 1 5a4 4 0 0 1 8-1 1 1 0 0 0 2 0 4 4 0 0 1 8 1c0 6-9 11.5-9 11.5z" />
            </svg>
          </div>
          <span className="text-sm text-white/85 leading-relaxed">
            Hé 👋 Fijn dat je er bent. Hoe voel jij je vandaag écht?
          </span>
        </div>
      </div>
      <div className="px-8 pb-11 relative z-10">
        <button
          onClick={() => setStep('email')}
          className="w-full bg-rose active:bg-rose-dark active:scale-[.98] text-white rounded-2xl py-4.5 font-semibold text-base transition-all mb-3"
        >
          Aan de slag →
        </button>
        <button
          onClick={() => setStep('email')}
          className="w-full bg-transparent text-white/75 py-2 text-sm font-medium border-none cursor-pointer"
        >
          Al een account? <u className="text-white">Log in</u>
        </button>
        <div className="flex items-center justify-center gap-1.5 text-xs text-white/40 mt-3.5">
          <svg viewBox="0 0 24 24" width="12" height="12" stroke="rgba(255,255,255,.35)" fill="none" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          Privé & veilig · opgeslagen in Europa
        </div>
      </div>
    </div>
  );
}
