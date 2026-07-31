import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const SUGGESTIONS = [
  'Ik weet het niet meer',
  'Mijn partner begrijpt me niet',
  'Ik ben zo moe',
];

function formatTime(iso) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function Chat() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [hadPreviousSession, setHadPreviousSession] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    supabase
      .from('messages')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (cancelled) return;
        const msgs = data ?? [];
        setMessages(msgs);
        if (msgs.length > 0) {
          const today = new Date().toDateString();
          setHadPreviousSession(
            msgs.some((m) => new Date(m.created_at).toDateString() !== today),
          );
        }
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, typing]);

  async function send(text) {
    const value = text.trim();
    if (!value || sending) return;
    setSending(true);
    setInput('');
    setErrorMsg('');

    const tempId = `temp-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: tempId, role: 'user', content: value, created_at: new Date().toISOString() },
    ]);
    setTyping(true);

    const { data, error } = await supabase.functions.invoke('buddy-chat', {
      body: { message: value },
    });

    setTyping(false);
    setSending(false);

    if (error || data?.error) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setErrorMsg('Kon je bericht niet versturen. Probeer het nog eens.');
      return;
    }

    if (data.limitReached) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setLimitReached(true);
      return;
    }

    setMessages((prev) => {
      const withoutTemp = prev.filter((m) => m.id !== tempId);
      const userRow = data.userMessage ?? {
        id: tempId,
        role: 'user',
        content: value,
        created_at: new Date().toISOString(),
      };
      const buddyRow = {
        id: `buddy-${Date.now()}`,
        role: 'buddy',
        content: data.reply,
        created_at: new Date().toISOString(),
      };
      return [...withoutTemp, userRow, buddyRow];
    });
  }

  return (
    <div className="flex flex-col h-svh">
      <div className="px-5 py-2 pb-3.5 flex items-center gap-3 border-b border-line bg-white flex-shrink-0">
        <div className="w-11 h-11 bg-rose-light rounded-full flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 20 18" width="24" height="24" fill="#F2567A">
            <path d="M10 16.5S1 11 1 5a4 4 0 0 1 8-1 1 1 0 0 0 2 0 4 4 0 0 1 8 1c0 6-9 11.5-9 11.5z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-base font-semibold text-ink">Buddy</h3>
          <div className="text-xs text-green flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-green rounded-full" />
            altijd beschikbaar
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4.5 pt-5 pb-2 flex flex-col gap-3 bg-cream"
      >
        {!loading && (
          <div className="text-center text-[11px] text-muted my-1">Vandaag</div>
        )}

        {hadPreviousSession && (
          <div className="self-center inline-flex items-center gap-1.5 bg-rose-soft text-rose-dark px-3.5 py-1.5 rounded-full text-[11.5px] font-medium my-0.5">
            <svg viewBox="0 0 20 18" width="13" height="13" fill="#F2567A">
              <path d="M10 16.5S1 11 1 5a4 4 0 0 1 8-1 1 1 0 0 0 2 0 4 4 0 0 1 8 1c0 6-9 11.5-9 11.5z" />
            </svg>
            Buddy herinnert zich jullie vorige gesprek
          </div>
        )}

        {loading ? (
          <p className="text-muted text-sm text-center py-8">Even laden…</p>
        ) : messages.length === 0 ? (
          <p className="text-muted text-sm text-center py-8">
            Zeg gerust hallo — Buddy luistert 💛
          </p>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`max-w-[82%] flex flex-col ${
                m.role === 'user' ? 'self-end items-end' : 'self-start items-start'
              }`}
            >
              <div
                className={`px-4 py-3 text-[14.5px] leading-relaxed rounded-[20px] ${
                  m.role === 'user'
                    ? 'bg-rose text-white rounded-br-[5px]'
                    : 'bg-white text-ink rounded-bl-[5px] shadow-[0_2px_10px_rgba(30,26,24,.04)]'
                }`}
              >
                {m.content}
              </div>
              <div className="text-[10px] text-muted mt-1 px-1.5">{formatTime(m.created_at)}</div>
            </div>
          ))
        )}

        {typing && (
          <div className="self-start bg-white px-4.5 py-3.5 rounded-[20px] rounded-bl-[5px] shadow-[0_2px_10px_rgba(30,26,24,.04)]">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}

        {errorMsg && <p className="text-rose-dark text-sm text-center my-1">{errorMsg}</p>}

        {limitReached && (
          <div className="mx-1 mb-1 bg-navy rounded-2xl px-4 py-3 flex items-center gap-3">
            <p className="flex-1 text-xs text-white/80 leading-snug">
              <strong className="text-white">Je hebt je 3 gratis berichten gebruikt.</strong>{' '}
              Praat onbeperkt met Premium.
            </p>
            <button
              onClick={() => navigate('/profiel')}
              className="bg-rose text-white px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap border-none cursor-pointer"
            >
              Upgrade
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-2 px-4.5 py-2.5 overflow-x-auto bg-cream flex-shrink-0">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => send(s)}
            disabled={sending}
            className="whitespace-nowrap bg-white border border-line text-mid px-4 py-2.5 rounded-full text-[13px] flex-shrink-0 cursor-pointer disabled:opacity-60"
          >
            {s}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="px-4 py-3 pb-4.5 bg-white border-t border-line flex items-center gap-2.5 flex-shrink-0"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type je bericht…"
          className="flex-1 bg-sand border-none rounded-full px-4.5 py-3 text-[14.5px] text-ink outline-none"
        />
        <button
          type="submit"
          disabled={sending}
          className="w-11 h-11 bg-rose rounded-full flex items-center justify-center flex-shrink-0 border-none cursor-pointer disabled:opacity-60"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="white">
            <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
          </svg>
        </button>
      </form>
    </div>
  );
}
