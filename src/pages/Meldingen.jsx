import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      className={`w-12 h-7 rounded-full flex-shrink-0 relative border-none cursor-pointer transition-colors ${
        checked ? 'bg-rose' : 'bg-sand'
      }`}
    >
      <span
        className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-[22px]' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}

export default function Meldingen() {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const [checkinReminder, setCheckinReminder] = useState(profile?.notif_checkin_reminder ?? true);
  const [weeklyOverview, setWeeklyOverview] = useState(profile?.notif_weekly_overview ?? true);
  const [saving, setSaving] = useState(false);

  async function updatePref(key, value, setLocal) {
    setLocal(value);
    setSaving(true);
    await supabase.from('profiles').update({ [key]: value }).eq('id', user.id);
    await refreshProfile();
    setSaving(false);
  }

  return (
    <div className="app-page pb-6 bg-cream">
      <div className="bg-white border-b border-line flex items-center gap-3 px-4 pb-3.5 pt-[calc(14px+env(safe-area-inset-top))]">
        <button
          onClick={() => navigate('/profiel')}
          aria-label="Terug"
          className="w-9 h-9 flex items-center justify-center flex-shrink-0 bg-transparent border-none cursor-pointer text-ink"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" fill="none" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h1 className="text-[16px] font-semibold text-ink">Meldingen</h1>
      </div>

      <div className="px-5 pt-5">
        <p className="text-sm text-mid leading-relaxed mb-6">
          Pushmeldingen komen er nog aan — hieronder stel je alvast in waar je aan herinnerd wilt
          worden zodra dat live gaat. Je voorkeur wordt bewaard.
        </p>

        <div className="bg-white border border-line rounded-[20px] overflow-hidden">
          <div className="px-5 py-4.5 flex items-center gap-4 border-b border-line">
            <div className="flex-1 min-w-0">
              <div className="text-[14.5px] font-medium text-ink mb-0.5">Dagelijkse check-in herinnering</div>
              <div className="text-[12.5px] text-muted leading-snug">
                Een zacht duwtje op momenten dat je nog niet hebt ingecheckt.
              </div>
            </div>
            <Toggle
              checked={checkinReminder}
              onChange={(v) => updatePref('notif_checkin_reminder', v, setCheckinReminder)}
            />
          </div>
          <div className="px-5 py-4.5 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="text-[14.5px] font-medium text-ink mb-0.5">Wekelijks overzicht</div>
              <div className="text-[12.5px] text-muted leading-snug">
                Een samenvatting van je week, inclusief Buddy's inzichten (Premium).
              </div>
            </div>
            <Toggle
              checked={weeklyOverview}
              onChange={(v) => updatePref('notif_weekly_overview', v, setWeeklyOverview)}
            />
          </div>
        </div>

        {saving && <p className="text-muted text-xs mt-3">Opslaan…</p>}
      </div>
    </div>
  );
}
