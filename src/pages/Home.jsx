import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const DAY_LABELS = ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo'];

function greeting(date) {
  const hour = date.getHours();
  if (hour < 12) return 'Goedemorgen';
  if (hour < 18) return 'Goedemiddag';
  return 'Goedenavond';
}

function startOfWeek(date) {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7; // maandag = 0
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function Home() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [insight, setInsight] = useState(null);
  const [checkinDays, setCheckinDays] = useState(new Set());
  const [openLoadCount, setOpenLoadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showSatisfactionCard, setShowSatisfactionCard] = useState(false);
  const [satisfactionDismissed, setSatisfactionDismissed] = useState(false);
  const [stars, setStars] = useState(0);
  const [satNote, setSatNote] = useState('');
  const [satSubmitting, setSatSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    async function load() {
      const weekStart = startOfWeek(new Date());

      const [insightRes, checkinsRes, loadRes, totalCheckinsRes, satisfactionSignalRes] = await Promise.all([
        supabase
          .from('buddy_memory')
          .select('content')
          .eq('user_id', user.id)
          .eq('type', 'insight')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('checkins')
          .select('created_at')
          .eq('user_id', user.id)
          .gte('created_at', weekStart.toISOString()),
        supabase
          .from('load_items')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('is_done', false),
        supabase
          .from('checkins')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id),
        supabase
          .from('feedback_signals')
          .select('id')
          .eq('user_id', user.id)
          .eq('context', 'app_tevredenheid')
          .limit(1)
          .maybeSingle(),
      ]);

      if (cancelled) return;

      setInsight(insightRes.data?.content ?? null);

      const days = new Set(
        (checkinsRes.data ?? []).map((c) => new Date(c.created_at).toDateString()),
      );
      setCheckinDays(days);
      setOpenLoadCount(loadRes.count ?? 0);
      setShowSatisfactionCard((totalCheckinsRes.count ?? 0) === 7 && !satisfactionSignalRes.data);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  async function submitSatisfaction() {
    if (!stars) return;
    setSatSubmitting(true);
    await supabase.from('feedback_signals').insert({
      user_id: user.id,
      context: 'app_tevredenheid',
      rating: stars,
      comment: satNote.trim() || null,
    });
    setSatSubmitting(false);
    setShowSatisfactionCard(false);
  }

  const today = new Date();
  const weekStart = startOfWeek(today);
  const streakCount = [...checkinDays].length;

  return (
    <div className="pb-6">
      {showSatisfactionCard && !satisfactionDismissed && (
        <div className="mx-5 mt-4 mb-2 bg-white border border-line rounded-[20px] px-5 py-4.5">
          <h4 className="text-sm font-semibold text-ink mb-3">Hoe bevalt MamaBuddy tot nu toe?</h4>
          <div className="flex gap-1.5 mb-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setStars(n)}
                aria-label={`${n} ster${n === 1 ? '' : 'ren'}`}
                className="text-2xl bg-transparent border-none cursor-pointer p-0.5 leading-none"
              >
                {n <= stars ? '⭐' : '☆'}
              </button>
            ))}
          </div>
          {stars > 0 && (
            <textarea
              value={satNote}
              onChange={(e) => setSatNote(e.target.value)}
              placeholder="Wil je toelichten? (optioneel)"
              rows={2}
              maxLength={500}
              className="w-full bg-sand rounded-xl px-3.5 py-2.5 text-[13.5px] text-ink placeholder:text-muted outline-none resize-none mb-3"
            />
          )}
          <div className="flex gap-3">
            <button
              onClick={submitSatisfaction}
              disabled={!stars || satSubmitting}
              className="bg-rose text-white rounded-full px-5 py-2 text-[13px] font-semibold border-none cursor-pointer disabled:opacity-50"
            >
              Versturen
            </button>
            <button
              onClick={() => setSatisfactionDismissed(true)}
              className="text-muted text-[13px] bg-transparent border-none cursor-pointer"
            >
              Niet nu
            </button>
          </div>
        </div>
      )}

      <div className="px-6 pt-2 pb-4 flex items-center justify-between">
        <div>
          <div className="text-sm text-muted">{greeting(today)} 💛</div>
          <div className="font-serif text-2xl text-ink mt-0.5">
            Hoi {profile?.naam || 'daar'}
          </div>
        </div>
        <button
          onClick={() => navigate('/profiel')}
          className="w-11 h-11 rounded-full bg-rose-light flex items-center justify-center font-serif text-[17px] text-rose-dark font-semibold border-none cursor-pointer"
        >
          {(profile?.naam || '?')[0]?.toUpperCase()}
        </button>
      </div>

      <button
        onClick={() => navigate('/check-in')}
        className="w-[calc(100%-40px)] mx-5 mb-4 block text-left bg-gradient-to-br from-navy to-[#2d3654] rounded-3xl p-6.5 relative overflow-hidden border-none cursor-pointer"
      >
        <div className="inline-flex items-center gap-1.5 bg-white/12 text-white px-3 py-1.5 rounded-full text-[11px] font-medium mb-3.5">
          <span className="w-1.5 h-1.5 bg-rose rounded-full animate-pulse" />
          Dagelijkse check-in
        </div>
        <h2 className="font-serif text-[23px] text-white leading-tight mb-2">
          Hoe voel jij je
          <br />
          vandaag écht?
        </h2>
        <p className="text-sm text-white/60 leading-relaxed mb-4.5">
          Neem 2 minuten voor jezelf. Buddy luistert.
        </p>
        <span className="inline-flex items-center gap-2 bg-rose text-white px-5 py-2.5 rounded-full text-sm font-medium">
          Start check-in →
        </span>
      </button>

      <div className="px-6 pb-3 flex items-center justify-between">
        <h3 className="font-serif text-lg font-medium text-ink">Vandaag</h3>
      </div>
      <div className="flex gap-3 px-5 pb-5">
        <button
          onClick={() => navigate('/chat')}
          className="flex-1 bg-white border border-line rounded-[20px] p-4.5 text-left border-none cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-light flex items-center justify-center text-xl mb-3">
            💬
          </div>
          <h4 className="text-sm font-semibold text-ink mb-0.5">Praat met Buddy</h4>
          <p className="text-xs text-muted leading-snug">Altijd beschikbaar</p>
        </button>
        <button
          onClick={() => navigate('/mijn-hoofd')}
          className="flex-1 bg-white border border-line rounded-[20px] p-4.5 text-left cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-green-light flex items-center justify-center text-xl mb-3">
            🧠
          </div>
          <h4 className="text-sm font-semibold text-ink mb-0.5">Mijn hoofd</h4>
          <p className="text-xs text-muted leading-snug">
            {loading ? '…' : `${openLoadCount} ding${openLoadCount === 1 ? '' : 'en'} open`}
          </p>
        </button>
      </div>

      {insight && (
        <>
          <div className="px-6 pb-3">
            <h3 className="font-serif text-lg font-medium text-ink">Buddy denkt met je mee</h3>
          </div>
          <div className="mx-5 mb-4 bg-rose-soft rounded-[20px] px-5 py-4.5 flex gap-3.5 items-start">
            <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 20 18" width="18" height="18" fill="#F2567A">
                <path d="M10 16.5S1 11 1 5a4 4 0 0 1 8-1 1 1 0 0 0 2 0 4 4 0 0 1 8 1c0 6-9 11.5-9 11.5z" />
              </svg>
            </div>
            <p className="text-[13px] text-mid leading-relaxed">{insight}</p>
          </div>
        </>
      )}

      <div className="mx-5 mb-6 bg-white border border-line rounded-[20px] px-5 py-4.5">
        <div className="flex items-center justify-between mb-3.5">
          <h4 className="text-sm font-semibold text-ink">Jouw check-in reeks</h4>
          <span className="text-[15px] text-rose font-semibold">🔥 {streakCount} dagen</span>
        </div>
        <div className="flex justify-between gap-1.5">
          {DAY_LABELS.map((label, i) => {
            const dayDate = new Date(weekStart);
            dayDate.setDate(weekStart.getDate() + i);
            const isToday = dayDate.toDateString() === today.toDateString();
            const done = checkinDays.has(dayDate.toDateString());
            return (
              <div className="flex-1 text-center" key={label}>
                <div
                  className={`w-full aspect-square max-w-[34px] mx-auto mb-1.5 rounded-full flex items-center justify-center text-[13px] ${
                    done
                      ? 'bg-rose text-white'
                      : isToday
                        ? 'bg-rose-light border-2 border-rose'
                        : 'bg-sand'
                  }`}
                >
                  {done ? '✓' : ''}
                </div>
                <div className="text-[10px] text-muted">{label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
