import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import PaywallModal from '../components/PaywallModal';
import FeedbackModal from '../components/FeedbackModal';
import { ADMIN_EMAIL } from '../lib/constants';

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function Profile() {
  const { profile, signOut, refreshProfile } = useAuth();
  const isAdmin = profile?.email?.toLowerCase() === ADMIN_EMAIL;
  const navigate = useNavigate();
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [cancelConfirming, setCancelConfirming] = useState(false);
  const [subBusy, setSubBusy] = useState(false);
  const [subError, setSubError] = useState('');

  useEffect(() => {
    if (!profile) return;
    let cancelled = false;

    supabase
      .from('buddy_memory')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (!cancelled) {
          setMemories(data ?? []);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [profile]);

  async function saveEdit(id) {
    const value = editValue.trim();
    setEditingId(null);
    if (!value) return;
    setMemories((prev) => prev.map((m) => (m.id === id ? { ...m, content: value } : m)));
    await supabase
      .from('buddy_memory')
      .update({ content: value, updated_at: new Date().toISOString() })
      .eq('id', id);
  }

  async function removeMemory(id) {
    setMemories((prev) => prev.filter((m) => m.id !== id));
    await supabase.from('buddy_memory').delete().eq('id', id);
  }

  async function confirmCancelSubscription() {
    setSubBusy(true);
    setSubError('');
    const { error } = await supabase.functions.invoke('cancel-subscription');
    setSubBusy(false);
    setCancelConfirming(false);
    if (error) {
      setSubError('Kon het abonnement niet opzeggen. Probeer het nog eens.');
      return;
    }
    await refreshProfile();
  }

  async function reactivateSubscription() {
    setSubBusy(true);
    setSubError('');
    const { data, error } = await supabase.functions.invoke('create-subscription');
    if (error || !data?.checkoutUrl) {
      setSubBusy(false);
      setSubError('Kon de betaling niet starten. Probeer het nog eens.');
      return;
    }
    window.location.href = data.checkoutUrl;
  }

  async function updatePaymentMethod() {
    setSubBusy(true);
    setSubError('');
    // Clean up the old (failing) Mollie subscription first so it doesn't
    // keep retrying in parallel with the fresh one this creates.
    await supabase.functions.invoke('cancel-subscription');
    const { data, error } = await supabase.functions.invoke('create-subscription');
    if (error || !data?.checkoutUrl) {
      setSubBusy(false);
      setSubError('Kon de betaling niet starten. Probeer het nog eens.');
      return;
    }
    window.location.href = data.checkoutUrl;
  }

  return (
    <div className="pb-6">
      <div className="px-6 pt-6 pb-2 text-center">
        <div className="w-20 h-20 rounded-full bg-rose-light flex items-center justify-center font-serif text-[32px] text-rose-dark font-semibold mx-auto mb-3.5">
          {(profile?.naam || '?')[0]?.toUpperCase()}
        </div>
        <h2 className="font-serif text-2xl font-medium text-ink">{profile?.naam}</h2>
        {profile?.subscription_status === 'premium' && (
          <div className="inline-flex items-center gap-1.5 bg-rose-light text-rose-dark px-3.5 py-1.5 rounded-full text-xs font-semibold mt-2">
            💛 Premium
          </div>
        )}
      </div>

      <div className="mx-5 mt-2 mb-4 bg-white border border-line rounded-[20px] overflow-hidden">
        <div className="px-5 pt-4.5 pb-3.5 border-b border-line">
          <h3 className="text-[15px] font-semibold text-ink flex items-center gap-2">
            <svg viewBox="0 0 20 18" width="18" height="18" fill="#F2567A">
              <path d="M10 16.5S1 11 1 5a4 4 0 0 1 8-1 1 1 0 0 0 2 0 4 4 0 0 1 8 1c0 6-9 11.5-9 11.5z" />
            </svg>
            Wat Buddy over jou weet
          </h3>
          <p className="text-xs text-muted mt-1 leading-snug">
            Jij bepaalt wat Buddy onthoudt. Pas aan of wis wanneer je wilt.
          </p>
        </div>
        {loading ? (
          <p className="text-muted text-sm text-center py-6">Even laden…</p>
        ) : memories.length === 0 ? (
          <p className="text-muted text-sm text-center py-6 px-5">
            Nog niets — dit vult zich vanzelf naarmate je met Buddy praat.
          </p>
        ) : (
          memories.map((m) => (
            <div
              key={m.id}
              className="px-5 py-3.5 border-b border-line last:border-b-0 flex items-center justify-between gap-3"
            >
              <div className="min-w-0 flex-1">
                <div className="text-[11px] text-muted mb-0.5">
                  {m.type === 'fact' ? 'Feit' : 'Buddy merkte op'}
                </div>
                {editingId === m.id ? (
                  <input
                    autoFocus
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => saveEdit(m.id)}
                    onKeyDown={(e) => e.key === 'Enter' && saveEdit(m.id)}
                    className="w-full text-sm text-ink border border-line rounded-lg px-2 py-1 outline-none focus:border-rose"
                  />
                ) : (
                  <div className="text-sm text-ink truncate">{m.content}</div>
                )}
              </div>
              <div className="flex gap-3 flex-shrink-0">
                <button
                  onClick={() => {
                    setEditingId(m.id);
                    setEditValue(m.content);
                  }}
                  className="text-rose text-[13px] font-medium bg-transparent border-none cursor-pointer"
                >
                  Bewerk
                </button>
                <button
                  onClick={() => removeMemory(m.id)}
                  className="text-rose text-[13px] font-medium bg-transparent border-none cursor-pointer"
                >
                  Wis
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {profile?.subscription_status === 'free' && (
        <div className="mx-5 mb-4 bg-gradient-to-br from-rose to-rose-dark rounded-[22px] p-5.5 relative overflow-hidden">
          <h3 className="font-serif text-xl text-white mb-1.5 relative">
            Ontgrendel Buddy Premium
          </h3>
          <p className="text-[13px] text-white/80 leading-relaxed mb-4 relative">
            Onbeperkt praten, Buddy's volledige geheugen en je wekelijkse overzicht.
          </p>
          <button
            onClick={() => setPaywallOpen(true)}
            className="bg-white text-rose-dark rounded-full px-6 py-3 text-sm font-semibold border-none cursor-pointer relative"
          >
            Bekijk Premium →
          </button>
        </div>
      )}

      {profile?.subscription_status === 'premium' && !profile?.subscription_cancels_at && (
        <div className="mx-5 mb-4 bg-white border border-line rounded-[22px] p-5.5">
          <h3 className="font-serif text-xl text-ink mb-1.5">Premium actief</h3>
          <p className="text-[13px] text-mid leading-relaxed mb-4">
            Verlengt automatisch op {formatDate(profile.subscription_until)}.
          </p>
          {subError && <p className="text-rose-dark text-[13px] mb-3">{subError}</p>}
          {cancelConfirming ? (
            <div className="bg-sand rounded-2xl p-4">
              <p className="text-[13px] text-ink leading-relaxed mb-3.5">
                Weet je het zeker? Je Premium blijft actief tot{' '}
                {formatDate(profile.subscription_until)}, daarna ga je terug naar de gratis
                versie.
              </p>
              <div className="flex gap-2.5">
                <button
                  onClick={confirmCancelSubscription}
                  disabled={subBusy}
                  className="flex-1 bg-rose-dark text-white rounded-full py-2.5 text-[13px] font-semibold border-none cursor-pointer disabled:opacity-60"
                >
                  {subBusy ? 'Bezig…' : 'Ja, opzeggen'}
                </button>
                <button
                  onClick={() => setCancelConfirming(false)}
                  disabled={subBusy}
                  className="flex-1 bg-white border border-line text-ink rounded-full py-2.5 text-[13px] font-semibold cursor-pointer disabled:opacity-60"
                >
                  Nee, blijf Premium
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setCancelConfirming(true)}
              className="text-rose-dark text-[13px] font-semibold bg-transparent border-none cursor-pointer p-0"
            >
              Abonnement opzeggen
            </button>
          )}
        </div>
      )}

      {profile?.subscription_status === 'premium' && profile?.subscription_cancels_at && (
        <div className="mx-5 mb-4 bg-white border border-line rounded-[22px] p-5.5">
          <h3 className="font-serif text-xl text-ink mb-1.5">Premium loopt af</h3>
          <p className="text-[13px] text-mid leading-relaxed mb-4">
            Loopt af op {formatDate(profile.subscription_cancels_at)} — je bent overgestapt op
            de gratis versie.
          </p>
          {subError && <p className="text-rose-dark text-[13px] mb-3">{subError}</p>}
          <button
            onClick={reactivateSubscription}
            disabled={subBusy}
            className="bg-rose text-white rounded-full px-6 py-3 text-sm font-semibold border-none cursor-pointer disabled:opacity-60"
          >
            {subBusy ? 'Even geduld…' : 'Heractiveren →'}
          </button>
        </div>
      )}

      {profile?.subscription_status === 'payment_failed' && (
        <div className="mx-5 mb-4 bg-rose-soft border border-rose-light rounded-[22px] p-5.5">
          <h3 className="font-serif text-lg text-ink mb-1.5">Betaling niet gelukt</h3>
          <p className="text-[13px] text-mid leading-relaxed mb-4">
            We konden je betaling niet verwerken. Update je betaalgegevens om Premium te
            behouden.
          </p>
          {subError && <p className="text-rose-dark text-[13px] mb-3">{subError}</p>}
          <button
            onClick={updatePaymentMethod}
            disabled={subBusy}
            className="bg-rose text-white rounded-full px-6 py-3 text-sm font-semibold border-none cursor-pointer disabled:opacity-60"
          >
            {subBusy ? 'Even geduld…' : 'Betaling bijwerken →'}
          </button>
        </div>
      )}

      <div className="mx-5 mb-4 bg-white border border-line rounded-[20px] overflow-hidden">
        <div
          onClick={() => navigate('/toeslagen')}
          className="px-5 py-4 flex items-center gap-3.5 cursor-pointer"
        >
          <span className="flex-1 text-[14.5px] text-ink">Toeslagen & regelingen</span>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#9B8F88" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>
      </div>

      <div className="mx-5 mb-6 bg-white border border-line rounded-[20px] overflow-hidden">
        {[
          ['Meldingen', '/meldingen'],
          ['Privacy & data', '/privacy-data'],
          ['Hulp & contact', '/hulp-contact'],
        ].map(([label, path]) => (
          <div
            key={label}
            onClick={() => navigate(path)}
            className="px-5 py-4 flex items-center gap-3.5 border-b border-line last:border-b-0 cursor-pointer"
          >
            <span className="flex-1 text-[14.5px] text-ink">{label}</span>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#9B8F88" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
        ))}
        <div
          onClick={() => setFeedbackOpen(true)}
          className="px-5 py-4 flex items-center gap-3.5 border-t border-line cursor-pointer"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#5C4F47" strokeWidth="2" className="flex-shrink-0">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
          <span className="flex-1 text-[14.5px] text-ink">Feedback of bug melden</span>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#9B8F88" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>
      </div>

      {isAdmin && (
        <div className="mx-5 mb-6 bg-navy border border-navy rounded-[20px] overflow-hidden">
          <div
            onClick={() => navigate('/admin')}
            className="px-5 py-4 flex items-center gap-3.5 cursor-pointer"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#fff" strokeWidth="2" className="flex-shrink-0">
              <path d="M12 2 3 7v6c0 5 4 8.5 9 9 5-.5 9-4 9-9V7l-9-5z" />
            </svg>
            <span className="flex-1 text-[14.5px] text-white font-medium">Admin dashboard</span>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="rgba(255,255,255,.6)" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
        </div>
      )}

      <div className="text-center pb-4">
        <button
          onClick={signOut}
          className="text-muted text-sm bg-transparent border-none cursor-pointer"
        >
          Uitloggen
        </button>
      </div>

      <PaywallModal open={paywallOpen} onClose={() => setPaywallOpen(false)} />
      <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </div>
  );
}
