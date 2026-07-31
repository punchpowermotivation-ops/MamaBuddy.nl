import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function MentalLoad() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    supabase
      .from('load_items')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) setError('Kon je lijstje niet laden. Probeer het nog eens.');
        else setItems(data ?? []);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  async function addItem(e) {
    e.preventDefault();
    const value = text.trim();
    if (!value) return;
    setText('');

    const { data, error } = await supabase
      .from('load_items')
      .insert({ user_id: user.id, text: value, category: 'Nieuw' })
      .select()
      .single();

    if (error) {
      setError('Kon dit niet opslaan. Probeer het nog eens.');
      return;
    }
    setItems((prev) => [data, ...prev]);
  }

  async function toggleItem(item) {
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, is_done: !i.is_done } : i)),
    );
    const { error } = await supabase
      .from('load_items')
      .update({ is_done: !item.is_done })
      .eq('id', item.id);
    if (error) {
      // revert on failure
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, is_done: item.is_done } : i)),
      );
      setError('Kon dit niet bijwerken. Probeer het nog eens.');
    }
  }

  const open = items.filter((i) => !i.is_done);
  const done = items.filter((i) => i.is_done);

  return (
    <div className="pb-6">
      <div className="px-6 pt-4 pb-1">
        <h2 className="font-serif text-[26px] text-ink">Mijn hoofd</h2>
        <p className="text-sm text-muted mt-1 leading-relaxed">
          Leg je hoofd leeg. Buddy onthoudt het voor je.
        </p>
      </div>

      <div className="mx-5 my-4 bg-green-light rounded-[18px] px-4.5 py-4 flex gap-3 items-start">
        <svg viewBox="0 0 20 18" width="20" height="20" fill="#2D8C6A" className="flex-shrink-0 mt-0.5">
          <path d="M10 16.5S1 11 1 5a4 4 0 0 1 8-1 1 1 0 0 0 2 0 4 4 0 0 1 8 1c0 6-9 11.5-9 11.5z" />
        </svg>
        <p className="text-[13px] text-mid leading-relaxed">
          Alle lijstjes die in je hoofd rondspoken? Zet ze hier neer. Dat geeft rust.
        </p>
      </div>

      <form onSubmit={addItem} className="mx-5 mb-5 flex gap-2.5">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Wat zit er in je hoofd?"
          className="flex-1 bg-white border-[1.5px] border-line rounded-2xl px-4 py-3.5 text-sm text-ink outline-none focus:border-rose transition-colors"
        />
        <button
          type="submit"
          className="w-[50px] bg-rose rounded-2xl text-white text-2xl flex items-center justify-center border-none cursor-pointer"
        >
          +
        </button>
      </form>

      {error && <p className="text-rose-dark text-sm text-center mb-3 px-5">{error}</p>}

      <div className="px-5 pb-5">
        {loading ? (
          <p className="text-muted text-sm text-center py-8">Even laden…</p>
        ) : items.length === 0 ? (
          <p className="text-muted text-sm text-center py-8">
            Nog niets hier. Zet je eerste gedachte hierboven neer 💛
          </p>
        ) : (
          <>
            {open.length > 0 && (
              <div className="text-xs font-semibold text-muted uppercase tracking-wide mt-4 mb-2.5">
                Deze week
              </div>
            )}
            {open.map((item) => (
              <LoadItem key={item.id} item={item} onToggle={() => toggleItem(item)} />
            ))}
            {done.length > 0 && (
              <div className="text-xs font-semibold text-muted uppercase tracking-wide mt-4 mb-2.5">
                Afgerond ✨
              </div>
            )}
            {done.map((item) => (
              <LoadItem key={item.id} item={item} onToggle={() => toggleItem(item)} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function LoadItem({ item, onToggle }) {
  return (
    <div
      onClick={onToggle}
      className={`bg-white border border-line rounded-2xl px-4 py-3.5 mb-2.5 flex items-center gap-3.5 cursor-pointer transition-opacity ${
        item.is_done ? 'opacity-50' : ''
      }`}
    >
      <div
        className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
          item.is_done ? 'bg-green border-green' : 'border-line'
        }`}
      >
        {item.is_done && (
          <svg viewBox="0 0 24 24" width="13" height="13" stroke="white" fill="none" strokeWidth="3">
            <path d="M5 12l5 5L20 7" />
          </svg>
        )}
      </div>
      <span className={`flex-1 text-[14.5px] text-ink ${item.is_done ? 'line-through' : ''}`}>
        {item.text}
      </span>
      {item.category && (
        <span className="text-[11px] text-muted bg-sand px-2.5 py-0.5 rounded-full">
          {item.category}
        </span>
      )}
    </div>
  );
}
