import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import PaywallModal from '../components/PaywallModal';

const SUGGESTIONS = [
  'Ik weet het niet meer',
  'Mijn partner begrijpt me niet',
  'Ik ben zo moe',
];

const FIVE_MINUTES = 5 * 60 * 1000;
const MIN_TYPING_MS = 800;
const MAX_TEXTAREA_HEIGHT = 100;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function formatTime(iso) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function formatDayLabel(iso) {
  const date = new Date(iso);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === now.toDateString()) return 'Vandaag';
  if (date.toDateString() === yesterday.toDateString()) return 'Gisteren';
  return date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long' });
}

// Long replies read like a wall of text; splitting on sentence boundaries
// into 2-3 bubbles (with a typing beat between) feels like a person typing,
// not a document being pasted.
function splitReply(text) {
  const sentences = (text.match(/[^.!?]+[.!?]+|\S+$/g) || [text])
    .map((s) => s.trim())
    .filter(Boolean);
  if (sentences.length <= 3) return [text.trim()];
  const numChunks = sentences.length > 5 ? 3 : 2;
  const perChunk = Math.ceil(sentences.length / numChunks);
  const chunks = [];
  for (let i = 0; i < sentences.length; i += perChunk) {
    chunks.push(sentences.slice(i, i + perChunk).join(' ').trim());
  }
  return chunks;
}

function vibrate(ms) {
  if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(ms);
}

export default function Chat() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [memories, setMemories] = useState([]);
  const [memoryOpen, setMemoryOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [justSent, setJustSent] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    Promise.all([
      supabase
        .from('messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true }),
      supabase
        .from('buddy_memory')
        .select('type, content')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(8),
    ]).then(([msgRes, memRes]) => {
      if (cancelled) return;
      setMessages(msgRes.data ?? []);
      setMemories(memRes.data ?? []);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [messages, typing]);

  function autoGrow(el) {
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`;
  }

  async function revealChunks(chunks) {
    for (let i = 0; i < chunks.length; i++) {
      if (i > 0) {
        setTyping(true);
        await sleep(600);
        setTyping(false);
      }
      setMessages((prev) => [
        ...prev,
        {
          id: `buddy-${Date.now()}-${i}`,
          role: 'buddy',
          content: chunks[i],
          created_at: new Date().toISOString(),
        },
      ]);
      if (i < chunks.length - 1) await sleep(400);
    }
  }

  async function send(text) {
    const value = text.trim();
    if (!value || sending) return;
    setSending(true);
    setInput('');
    setErrorMsg('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    vibrate(10);

    const tempId = `temp-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: tempId, role: 'user', content: value, created_at: new Date().toISOString() },
    ]);
    setTyping(true);
    const typingStarted = Date.now();

    const { data, error } = await supabase.functions.invoke('buddy-chat', {
      body: { message: value },
    });

    if (error || data?.error) {
      setTyping(false);
      setSending(false);
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setErrorMsg('Kon je bericht niet versturen. Probeer het nog eens.');
      return;
    }

    if (data.limitReached) {
      setTyping(false);
      setSending(false);
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setLimitReached(true);
      return;
    }

    // Never let the typing indicator flash for less than ~800ms — an
    // instant reply reads as robotic rather than someone actually typing.
    const elapsed = Date.now() - typingStarted;
    if (elapsed < MIN_TYPING_MS) await sleep(MIN_TYPING_MS - elapsed);
    setTyping(false);

    const userRow = data.userMessage ?? {
      id: tempId,
      role: 'user',
      content: value,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => prev.map((m) => (m.id === tempId ? userRow : m)));

    await revealChunks(splitReply(data.reply));
    setSending(false);
  }

  function handleSend() {
    setJustSent(true);
    setTimeout(() => setJustSent(false), 300);
    send(input);
  }

  const hasText = input.trim().length > 0;

  return (
    <div className="chat-screen">
      <div className="flex-shrink-0 bg-white border-b border-line flex items-center gap-3 px-4 pb-3 pt-[calc(12px+env(safe-area-inset-top))]">
        <button
          onClick={() => navigate('/')}
          aria-label="Terug"
          className="w-9 h-9 flex items-center justify-center flex-shrink-0 bg-transparent border-none cursor-pointer text-ink"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" fill="none" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div className="w-10 h-10 bg-rose-light rounded-full flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 20 18" width="20" height="20" fill="#F2567A">
            <path d="M10 16.5S1 11 1 5a4 4 0 0 1 8-1 1 1 0 0 0 2 0 4 4 0 0 1 8 1c0 6-9 11.5-9 11.5z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[15.5px] font-semibold text-ink">Buddy</h3>
          <div className="text-[11.5px] text-green flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-green rounded-full" />
            altijd beschikbaar
          </div>
        </div>
      </div>

      <div className="chat-scroll px-4 pt-4 pb-2">
        {loading ? (
          <div className="pt-2">
            <div className="flex mb-2.5">
              <div className="skeleton-bubble h-9 w-[62%] rounded-[19px]" />
            </div>
            <div className="flex justify-end mb-2.5">
              <div className="skeleton-bubble h-9 w-[45%] rounded-[19px]" />
            </div>
            <div className="flex">
              <div className="skeleton-bubble h-9 w-[70%] rounded-[19px]" />
            </div>
          </div>
        ) : (
          <>
            {messages.length === 0 && !typing && (
              <p className="text-muted text-sm text-center py-8">
                Zeg gerust hallo — Buddy luistert 💛
              </p>
            )}

            {memories.length > 0 && (
              <button
                onClick={() => setMemoryOpen(true)}
                className="self-center mx-auto flex items-center gap-1.5 bg-rose-soft text-rose-dark px-3.5 py-2 rounded-full text-[11.5px] font-semibold mb-4 border-none cursor-pointer w-fit"
              >
                <svg viewBox="0 0 20 18" width="13" height="13" fill="#F2567A">
                  <path d="M10 16.5S1 11 1 5a4 4 0 0 1 8-1 1 1 0 0 0 2 0 4 4 0 0 1 8 1c0 6-9 11.5-9 11.5z" />
                </svg>
                Buddy herinnert zich jullie vorige gesprek — tik voor details
              </button>
            )}

            {messages.map((m, i) => {
              const prev = messages[i - 1];
              const showDaySep = !prev || formatDayLabel(m.created_at) !== formatDayLabel(prev.created_at);
              const gapMs = prev ? new Date(m.created_at) - new Date(prev.created_at) : Infinity;
              const showTimeSep = showDaySep || gapMs > FIVE_MINUTES;

              return (
                <div key={m.id}>
                  {showDaySep && (
                    <div className="text-center text-[11.5px] text-muted my-3.5 font-medium">
                      {formatDayLabel(m.created_at)}
                    </div>
                  )}
                  {showTimeSep && (
                    <div className="text-center text-[10.5px] text-muted my-2.5">
                      {formatTime(m.created_at)}
                    </div>
                  )}
                  <div className={`msg-in flex mb-1 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[78%] px-4 py-2.5 text-[14.5px] leading-[1.48] rounded-[19px] ${
                        m.role === 'user'
                          ? 'bg-rose text-white rounded-br-[5px]'
                          : 'bg-white text-ink rounded-bl-[5px] shadow-[0_1px_6px_rgba(30,26,24,.04)]'
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                </div>
              );
            })}

            {typing && (
              <div className="flex justify-start mb-2">
                <div className="bg-white px-[17px] py-[13px] rounded-[19px] rounded-bl-[5px] shadow-[0_1px_6px_rgba(30,26,24,.04)] flex gap-1">
                  <span className="typing-dot w-[6.5px] h-[6.5px] bg-muted rounded-full" style={{ animationDelay: '0ms' }} />
                  <span className="typing-dot w-[6.5px] h-[6.5px] bg-muted rounded-full" style={{ animationDelay: '150ms' }} />
                  <span className="typing-dot w-[6.5px] h-[6.5px] bg-muted rounded-full" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            {errorMsg && <p className="text-rose-dark text-sm text-center my-2">{errorMsg}</p>}

            {limitReached && (
              <div className="mx-1 mb-1 mt-2 bg-navy rounded-2xl px-4 py-3 flex items-center gap-3">
                <p className="flex-1 text-xs text-white/80 leading-snug">
                  <strong className="text-white">Je hebt je 3 gratis berichten gebruikt.</strong>{' '}
                  Praat onbeperkt met Premium.
                </p>
                <button
                  onClick={() => setPaywallOpen(true)}
                  className="bg-rose text-white px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap border-none cursor-pointer"
                >
                  Upgrade
                </button>
              </div>
            )}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex-shrink-0 flex gap-2 px-4 py-2.5 overflow-x-auto bg-cream">
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

      <div
        className="chat-input-bar flex-shrink-0 flex items-end gap-2 px-3 bg-white border-t border-line"
        style={{ paddingTop: 10, paddingBottom: `calc(12px + env(safe-area-inset-bottom))` }}
      >
        <div className="flex-1 bg-sand rounded-[22px] flex items-end min-h-11 max-h-[120px] py-0.5 pl-4 pr-1">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              autoGrow(e.target);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type je bericht…"
            className="flex-1 bg-transparent border-none outline-none text-[14.5px] text-ink resize-none py-2.5 leading-[1.4] max-h-[100px]"
          />
        </div>
        <button
          onClick={handleSend}
          disabled={!hasText || sending}
          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-none cursor-pointer transition-colors ${
            hasText ? 'bg-rose' : 'bg-sand'
          } ${justSent ? 'send-pulse' : ''} disabled:cursor-default`}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill={hasText ? 'white' : '#9B8F88'}>
            <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
          </svg>
        </button>
      </div>

      {memoryOpen && (
        <div
          className="fixed inset-0 z-[2000] bg-black/40 flex items-end"
          onClick={() => setMemoryOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-white rounded-t-[28px] px-6 pt-3 pb-[calc(28px+env(safe-area-inset-bottom))] max-h-[70vh] overflow-y-auto"
          >
            <div className="w-10 h-1 bg-line rounded-full mx-auto mb-5" />
            <h3 className="font-serif text-xl text-ink mb-1">Wat Buddy zich herinnert</h3>
            <p className="text-sm text-muted mb-5">
              Alleen zichtbaar voor jou — je kunt dit altijd aanpassen in je profiel.
            </p>
            <div className="flex flex-col gap-3">
              {memories.map((m, i) => (
                <div key={i} className="bg-rose-soft rounded-2xl px-4 py-3">
                  <div className="text-[11px] text-rose-dark font-semibold mb-0.5">
                    {m.type === 'fact' ? 'Feit' : 'Inzicht'}
                  </div>
                  <div className="text-sm text-ink">{m.content}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <PaywallModal open={paywallOpen} onClose={() => setPaywallOpen(false)} />
    </div>
  );
}
