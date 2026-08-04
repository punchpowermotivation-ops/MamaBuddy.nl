import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [entered, setEntered] = useState(false);
  const [naam, setNaam] = useState('');
  const [kids, setKids] = useState([{ naam: '', leeftijd: '' }]);
  const [saving, setSaving] = useState(false);
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();

  function updateKid(index, field, value) {
    setKids((prev) => prev.map((k, i) => (i === index ? { ...k, [field]: value } : k)));
  }

  function addKid() {
    setKids((prev) => [...prev, { naam: '', leeftijd: '' }]);
  }

  async function finish() {
    setSaving(true);

    await supabase.from('profiles').update({ naam, onboarding_done: true }).eq('id', user.id);

    const validKids = kids.filter((k) => k.naam.trim());
    if (validKids.length > 0) {
      const today = new Date();
      await supabase.from('children').insert(
        validKids.map((k) => {
          const age = parseInt(k.leeftijd, 10);
          const geboortedatum = Number.isFinite(age)
            ? new Date(today.getFullYear() - age, today.getMonth(), today.getDate())
                .toISOString()
                .slice(0, 10)
            : null;
          return { user_id: user.id, naam: k.naam.trim(), geboortedatum };
        }),
      );
    }

    await refreshProfile();
    setSaving(false);
    setEntered(true);
  }

  if (entered) {
    return (
      <div className="app-shell theme-dark bg-gradient-to-br from-navy to-[#14110f] flex flex-col items-center justify-center px-10 text-center pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
        <div className="w-20 h-20 rounded-full bg-rose-light flex items-center justify-center mb-6">
          <svg viewBox="0 0 20 18" width="42" height="42" fill="#F2567A">
            <path d="M10 16.5S1 11 1 5a4 4 0 0 1 8-1 1 1 0 0 0 2 0 4 4 0 0 1 8 1c0 6-9 11.5-9 11.5z" />
          </svg>
        </div>
        <h2 className="font-serif text-3xl text-white leading-tight mb-3">
          Welkom, {naam || 'daar'} 💛
          <br />
          Buddy staat <em className="text-rose not-italic italic">voor je klaar.</em>
        </h2>
        <p className="text-white/60 text-[15px] mb-8">Vanaf nu ben je nooit meer alleen.</p>
        <button
          onClick={() => navigate('/')}
          className="bg-rose text-white rounded-full px-10 py-4 font-semibold text-base border-none cursor-pointer"
        >
          Open MamaBuddy →
        </button>
      </div>
    );
  }

  return (
    <div className="app-shell flex flex-col bg-cream pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <div className="p-4 flex items-center gap-3">
        <div className="flex-1 h-1 bg-sand rounded-full overflow-hidden">
          <div
            className="h-full bg-rose rounded-full transition-all duration-400"
            style={{ width: step === 1 ? '50%' : '100%' }}
          />
        </div>
      </div>

      <div className="flex-1 px-8 pt-5 overflow-y-auto">
        {step === 1 ? (
          <>
            <div className="text-rose text-sm font-semibold tracking-wide mb-2.5">
              Even kennismaken
            </div>
            <h2 className="font-serif text-3xl text-ink leading-tight mb-2">
              Hoe mag Buddy
              <br />
              je noemen?
            </h2>
            <p className="text-mid text-[15px] leading-relaxed mb-7">
              Zo voelt het gesprek persoonlijk — als een vriendin die je naam kent.
            </p>
            <div className="mb-4.5">
              <label className="block text-sm font-semibold text-ink mb-2">Jouw voornaam</label>
              <input
                type="text"
                value={naam}
                onChange={(e) => setNaam(e.target.value)}
                placeholder="bijv. Lisa"
                className="w-full bg-white border-[1.5px] border-line rounded-2xl px-4.5 py-4 text-base text-ink outline-none focus:border-rose transition-colors"
              />
            </div>
          </>
        ) : (
          <>
            <div className="text-rose text-sm font-semibold tracking-wide mb-2.5">
              Vertel Buddy over je gezin
            </div>
            <h2 className="font-serif text-3xl text-ink leading-tight mb-2">
              Wie zijn jouw
              <br />
              kleintjes?
            </h2>
            <p className="text-mid text-[15px] leading-relaxed mb-7">
              Zo kan Buddy meedenken over hun leeftijd. Je kunt dit altijd later aanpassen.
            </p>
            {kids.map((kid, i) => (
              <div className="flex gap-2.5 mb-3" key={i}>
                <input
                  type="text"
                  placeholder="Naam kind"
                  value={kid.naam}
                  onChange={(e) => updateKid(i, 'naam', e.target.value)}
                  className="flex-[2] bg-white border-[1.5px] border-line rounded-2xl px-4.5 py-3.5 text-base text-ink outline-none focus:border-rose transition-colors"
                />
                <input
                  type="number"
                  placeholder="Leeftijd"
                  value={kid.leeftijd}
                  onChange={(e) => updateKid(i, 'leeftijd', e.target.value)}
                  className="flex-1 bg-white border-[1.5px] border-line rounded-2xl px-4.5 py-3.5 text-base text-ink outline-none focus:border-rose transition-colors"
                />
              </div>
            ))}
            <button
              onClick={addKid}
              className="w-full bg-rose-soft text-rose-dark rounded-xl py-3 text-sm font-medium mb-5 border-none cursor-pointer"
            >
              + Nog een kindje toevoegen
            </button>
          </>
        )}
      </div>

      <div className="px-8 pb-8 pt-4">
        {step === 1 ? (
          <button
            onClick={() => setStep(2)}
            disabled={!naam.trim()}
            className="w-full bg-rose text-white rounded-2xl py-4 font-semibold text-base border-none cursor-pointer disabled:opacity-50"
          >
            Verder →
          </button>
        ) : (
          <>
            <button
              onClick={finish}
              disabled={saving}
              className="w-full bg-rose text-white rounded-2xl py-4 font-semibold text-base border-none cursor-pointer mb-1 disabled:opacity-60"
            >
              {saving ? 'Even opslaan…' : 'Klaar, breng me naar Buddy →'}
            </button>
            <button
              onClick={finish}
              disabled={saving}
              className="w-full bg-transparent text-muted text-sm py-2.5 mt-1 border-none cursor-pointer"
            >
              Sla over
            </button>
          </>
        )}
      </div>
    </div>
  );
}
