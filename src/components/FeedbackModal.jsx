import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const PLACEHOLDERS = {
  feedback: 'Wat zou je willen dat we verbeteren?',
  bug: 'Wat ging er mis? Beschrijf het zo precies mogelijk.',
};

export default function FeedbackModal({ open, onClose }) {
  const { user } = useAuth();
  const [type, setType] = useState('feedback');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  if (!open) return null;

  function handleClose() {
    onClose();
    setTimeout(() => {
      setType('feedback');
      setMessage('');
      setSent(false);
    }, 200);
  }

  async function submit() {
    const value = message.trim();
    if (!value || sending) return;
    setSending(true);
    await supabase.from('feedback_reports').insert({
      user_id: user.id,
      type,
      message: value,
    });
    setSending(false);
    setSent(true);
  }

  return (
    <div className="fixed inset-0 z-[2000] bg-black/40 flex items-end" onClick={handleClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[420px] mx-auto bg-cream rounded-t-[32px] px-6 pt-3 pb-[calc(30px+env(safe-area-inset-bottom))]"
      >
        <div className="w-10 h-1 bg-line rounded-full mx-auto mb-5" />

        {sent ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full bg-rose-light flex items-center justify-center mx-auto mb-4">
              <svg viewBox="0 0 20 18" width="26" height="26" fill="#F2567A">
                <path d="M10 16.5S1 11 1 5a4 4 0 0 1 8-1 1 1 0 0 0 2 0 4 4 0 0 1 8 1c0 6-9 11.5-9 11.5z" />
              </svg>
            </div>
            <p className="text-[15px] text-ink leading-relaxed mb-6 px-2">
              Bedankt! We lezen alles en gebruiken het om MamaBuddy te verbeteren 💛
            </p>
            <button
              onClick={handleClose}
              className="w-full bg-rose text-white rounded-2xl py-4 font-semibold text-base border-none cursor-pointer"
            >
              Sluiten
            </button>
          </div>
        ) : (
          <>
            <h2 className="font-serif text-2xl text-ink text-center mb-5">Feedback of bug melden</h2>

            <div className="flex gap-2 mb-4 bg-sand p-1 rounded-[14px]">
              <button
                onClick={() => setType('feedback')}
                className={`flex-1 py-2.5 rounded-[11px] text-[13.5px] font-semibold border-none cursor-pointer transition-colors ${
                  type === 'feedback' ? 'bg-white text-ink shadow-[0_2px_8px_rgba(30,26,24,.06)]' : 'bg-transparent text-muted'
                }`}
              >
                Feedback
              </button>
              <button
                onClick={() => setType('bug')}
                className={`flex-1 py-2.5 rounded-[11px] text-[13.5px] font-semibold border-none cursor-pointer transition-colors ${
                  type === 'bug' ? 'bg-white text-ink shadow-[0_2px_8px_rgba(30,26,24,.06)]' : 'bg-transparent text-muted'
                }`}
              >
                Bug melden
              </button>
            </div>

            <textarea
              autoFocus
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={PLACEHOLDERS[type]}
              rows={5}
              maxLength={1000}
              className="w-full bg-white border border-line rounded-2xl px-4 py-3.5 text-[14.5px] text-ink placeholder:text-muted outline-none focus:border-rose resize-none mb-4"
            />

            <button
              onClick={submit}
              disabled={!message.trim() || sending}
              className="w-full bg-rose text-white rounded-2xl py-4 font-semibold text-base border-none cursor-pointer disabled:opacity-50"
            >
              Versturen
            </button>
          </>
        )}
      </div>
    </div>
  );
}
