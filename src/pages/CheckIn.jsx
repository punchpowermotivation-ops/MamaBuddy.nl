import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const MOODS = [
  { value: 'uitgeput', emoji: '😮‍💨', label: 'Uitgeput' },
  { value: 'overprikkeld', emoji: '🌀', label: 'Overprikkeld' },
  { value: 'oké', emoji: '🙂', label: 'Wel oké' },
  { value: 'goed', emoji: '✨', label: 'Eigenlijk best goed' },
];

// Alleen gebruikt als de edge function om wat voor reden dan ook geen
// antwoord teruggeeft — nooit een lege of kapotte staat tonen.
const FALLBACK_RESPONSES = {
  uitgeput:
    'Uitgeput zijn is geen zwakte. Het is je lichaam dat om rust vraagt. Je doet ontzettend veel — vergeet jezelf niet.',
  overprikkeld:
    'Alle prikkels van een dag met kinderen zijn echt veel. Gun jezelf straks 10 minuten stilte, alleen voor jou.',
  oké: 'Fijn dat het wel oké gaat. Onthoud dit gevoel — ook de rustige dagen tellen.',
  goed: 'Wat heerlijk om te horen! 💛 Geniet ervan, je verdient deze goede momenten.',
};

const STEPS = { MOOD: 'mood', NOTE: 'note', RESPONSE: 'response' };

export default function CheckIn() {
  const [step, setStep] = useState(STEPS.MOOD);
  const [mood, setMood] = useState(null);
  const [note, setNote] = useState('');
  const [reply, setReply] = useState('');
  const [saving, setSaving] = useState(false);
  const [checkinId, setCheckinId] = useState(null);
  const [replyVote, setReplyVote] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  function chooseMood(value) {
    setMood(value);
    setStep(STEPS.NOTE);
  }

  async function submit() {
    setSaving(true);
    setStep(STEPS.RESPONSE);

    const { data, error } = await supabase.functions.invoke('checkin-respond', {
      body: { mood, note: note.trim() || null },
    });

    setReply(error || !data?.reply ? FALLBACK_RESPONSES[mood] : data.reply);
    setCheckinId(data?.checkinId ?? null);
    setSaving(false);
  }

  async function voteOnReply(rating) {
    if (replyVote || !checkinId) return;
    setReplyVote(rating);
    await supabase.from('feedback_signals').insert({
      user_id: user.id,
      context: 'checkin_reactie',
      rating,
      related_id: checkinId,
    });
  }

  const progress = step === STEPS.MOOD ? '33%' : step === STEPS.NOTE ? '66%' : '100%';

  return (
    <div className="app-shell bg-gradient-to-br from-navy to-[#14110f] flex flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <div className="px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate('/')}
          className="w-9.5 h-9.5 rounded-full bg-white/10 border-none text-white text-xl flex items-center justify-center cursor-pointer"
          aria-label="Sluiten"
        >
          ✕
        </button>
        <div className="flex-1 h-1 bg-white/15 rounded-full overflow-hidden">
          <div
            className="h-full bg-rose rounded-full transition-all duration-400"
            style={{ width: progress }}
          />
        </div>
        <div className="w-9.5" />
      </div>

      <div className="flex-1 flex flex-col justify-center px-8 pb-10">
        {step === STEPS.MOOD && (
          <>
            <div className="font-serif text-[30px] text-white text-center leading-tight mb-2">
              Hoe voel je je
              <br />
              op dit moment?
            </div>
            <div className="text-[15px] text-white/55 text-center mb-10">
              Er is geen goed of fout antwoord.
            </div>
            <div className="flex flex-col gap-3">
              {MOODS.map((m) => (
                <button
                  key={m.value}
                  onClick={() => chooseMood(m.value)}
                  className="bg-white/8 border-[1.5px] border-white/12 rounded-[18px] px-5 py-4.5 flex items-center gap-4 cursor-pointer"
                >
                  <span className="text-[28px]">{m.emoji}</span>
                  <span className="text-base text-white font-medium">{m.label}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {step === STEPS.NOTE && (
          <>
            <div className="font-serif text-[26px] text-white text-center leading-tight mb-2">
              Wil je er iets bij vertellen?
            </div>
            <div className="text-[15px] text-white/55 text-center mb-8">Optioneel — helemaal aan jou.</div>
            <textarea
              autoFocus
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Typ hier gerust wat er speelt…"
              rows={4}
              maxLength={500}
              className="w-full bg-white/8 border-[1.5px] border-white/12 rounded-[18px] px-5 py-4 text-[15px] text-white placeholder:text-white/40 outline-none focus:border-rose resize-none mb-6"
            />
            <div className="flex flex-col gap-3">
              <button
                onClick={submit}
                className="bg-rose text-white rounded-full px-9 py-4 font-semibold text-base border-none cursor-pointer"
              >
                {note.trim() ? 'Versturen' : 'Overslaan'}
              </button>
            </div>
          </>
        )}

        {step === STEPS.RESPONSE && (
          <div className="text-center animate-[fadeIn_.6s_ease]">
            <div className="w-16 h-16 rounded-full bg-rose-light flex items-center justify-center mx-auto mb-6">
              <svg viewBox="0 0 20 18" width="34" height="34" fill="#F2567A">
                <path d="M10 16.5S1 11 1 5a4 4 0 0 1 8-1 1 1 0 0 0 2 0 4 4 0 0 1 8 1c0 6-9 11.5-9 11.5z" />
              </svg>
            </div>
            {saving ? (
              <div className="flex justify-center gap-1.5 mb-8">
                <span className="typing-dot w-2 h-2 bg-white/50 rounded-full" style={{ animationDelay: '0ms' }} />
                <span className="typing-dot w-2 h-2 bg-white/50 rounded-full" style={{ animationDelay: '150ms' }} />
                <span className="typing-dot w-2 h-2 bg-white/50 rounded-full" style={{ animationDelay: '300ms' }} />
              </div>
            ) : (
              <>
                <div className="font-serif text-[22px] text-white leading-relaxed mb-5">{reply}</div>
                <div className="h-8 mb-6 flex items-center justify-center">
                  {replyVote ? (
                    <span className="text-sm text-white/50">Bedankt 💛</span>
                  ) : (
                    <div className="flex gap-3">
                      <button
                        onClick={() => voteOnReply(1)}
                        aria-label="Vond ik fijn"
                        className="w-9 h-9 rounded-full bg-white/8 border-none text-lg flex items-center justify-center cursor-pointer"
                      >
                        👍
                      </button>
                      <button
                        onClick={() => voteOnReply(-1)}
                        aria-label="Vond ik niet fijn"
                        className="w-9 h-9 rounded-full bg-white/8 border-none text-lg flex items-center justify-center cursor-pointer"
                      >
                        👎
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
            <button
              onClick={() => navigate('/')}
              disabled={saving}
              className="bg-rose text-white rounded-full px-9 py-4 font-semibold text-base border-none cursor-pointer disabled:opacity-60"
            >
              Dank je, Buddy 💛
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
