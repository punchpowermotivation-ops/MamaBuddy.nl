import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const STATUS_LABELS = { nieuw: 'Nieuw', gelezen: 'Gelezen', opgelost: 'Opgelost' };
const STATUS_OPTIONS = ['nieuw', 'gelezen', 'opgelost'];
const MESSAGE_TRUNCATE = 140;

function StatCard({ label, value }) {
  return (
    <div className="bg-white border border-line rounded-2xl px-5 py-4.5">
      <div className="text-[13px] text-muted mb-1.5">{label}</div>
      <div className="text-2xl font-semibold text-ink">{value}</div>
    </div>
  );
}

function TypeBadge({ type }) {
  const isBug = type === 'bug';
  return (
    <span
      className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold ${
        isBug ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
      }`}
    >
      {isBug ? 'Bug' : 'Feedback'}
    </span>
  );
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function ReportsTable({ reports, onStatusChange }) {
  const [typeFilter, setTypeFilter] = useState('alle');
  const [statusFilter, setStatusFilter] = useState('alle');
  const [expanded, setExpanded] = useState({});

  const filtered = reports.filter((r) => {
    if (typeFilter !== 'alle' && r.type !== typeFilter) return false;
    if (statusFilter !== 'alle' && r.status !== statusFilter) return false;
    return true;
  });

  return (
    <div>
      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex gap-1.5">
          {[
            ['alle', 'Alle'],
            ['bug', 'Alleen bugs'],
            ['feedback', 'Alleen feedback'],
          ].map(([value, label]) => (
            <button
              key={value}
              onClick={() => setTypeFilter(value)}
              className={`px-3.5 py-1.5 rounded-full text-[12.5px] font-medium border cursor-pointer ${
                typeFilter === value ? 'bg-rose text-white border-rose' : 'bg-white text-mid border-line'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          {[['alle', 'Alle statussen'], ...STATUS_OPTIONS.map((s) => [s, STATUS_LABELS[s]])].map(
            ([value, label]) => (
              <button
                key={value}
                onClick={() => setStatusFilter(value)}
                className={`px-3.5 py-1.5 rounded-full text-[12.5px] font-medium border cursor-pointer ${
                  statusFilter === value ? 'bg-navy text-white border-navy' : 'bg-white text-mid border-line'
                }`}
              >
                {label}
              </button>
            ),
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted text-sm py-8 text-center">Geen feedback binnen dit filter.</p>
      ) : (
        <div className="overflow-x-auto border border-line rounded-2xl bg-white">
          <table className="w-full text-left text-[13px] border-collapse">
            <thead>
              <tr className="border-b border-line text-muted text-[11.5px] uppercase tracking-wide">
                <th className="px-4 py-3 font-medium">Naam</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Bericht</th>
                <th className="px-4 py-3 font-medium">Datum</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const isLong = r.message.length > MESSAGE_TRUNCATE;
                const isExpanded = expanded[r.id];
                return (
                  <tr
                    key={r.id}
                    className={`border-b border-line last:border-b-0 align-top ${
                      r.status === 'nieuw' ? 'bg-rose-soft/40' : ''
                    }`}
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-ink">{r.naam || '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-mid">{r.email || '—'}</td>
                    <td className="px-4 py-3">
                      <TypeBadge type={r.type} />
                    </td>
                    <td className="px-4 py-3 text-ink max-w-[360px]">
                      {isLong && !isExpanded ? (
                        <>
                          {r.message.slice(0, MESSAGE_TRUNCATE)}…{' '}
                          <button
                            onClick={() => setExpanded((prev) => ({ ...prev, [r.id]: true }))}
                            className="text-rose font-medium bg-transparent border-none cursor-pointer p-0 text-[13px]"
                          >
                            meer
                          </button>
                        </>
                      ) : (
                        r.message
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-mid">{formatDate(r.created_at)}</td>
                    <td className="px-4 py-3">
                      <select
                        value={r.status}
                        onChange={(e) => onStatusChange(r.id, e.target.value)}
                        className="border border-line rounded-lg px-2 py-1.5 text-[12.5px] text-ink bg-white cursor-pointer"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {STATUS_LABELS[s]}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function MicroFeedbackSection({ signals, avgSatisfaction }) {
  const checkinSignals = signals.filter((s) => s.context === 'checkin_reactie');
  const positive = checkinSignals.filter((s) => s.rating === 1).length;
  const negative = checkinSignals.filter((s) => s.rating === -1).length;
  const totalVotes = positive + negative;
  const positivePct = totalVotes ? Math.round((positive / totalVotes) * 100) : null;

  const satisfactionComments = signals
    .filter((s) => s.context === 'app_tevredenheid' && s.comment)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const limitReasons = signals
    .filter((s) => s.context === 'chat_limiet_reden' && s.comment)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="bg-white border border-line rounded-2xl p-5">
        <h4 className="text-[13px] font-semibold text-ink mb-2">Check-in reacties</h4>
        {totalVotes === 0 ? (
          <p className="text-muted text-[13px]">Nog geen stemmen.</p>
        ) : (
          <p className="text-[13.5px] text-mid">
            <strong className="text-ink">{positivePct}% positief</strong>, {totalVotes} reactie
            {totalVotes === 1 ? '' : 's'}
          </p>
        )}
      </div>

      <div className="bg-white border border-line rounded-2xl p-5">
        <h4 className="text-[13px] font-semibold text-ink mb-2">App-tevredenheid</h4>
        <p className="text-[13.5px] text-mid mb-3">
          Gemiddeld{' '}
          <strong className="text-ink">
            {avgSatisfaction !== null ? `${avgSatisfaction.toFixed(1)} / 5 ⭐` : 'nog geen data'}
          </strong>
        </p>
        {satisfactionComments.length > 0 && (
          <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
            {satisfactionComments.map((s) => (
              <div key={s.id} className="bg-sand rounded-lg px-3 py-2 text-[12.5px] text-ink">
                <div className="text-muted mb-0.5">{'⭐'.repeat(s.rating)} — {s.naam || 'onbekend'}</div>
                {s.comment}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white border border-line rounded-2xl p-5">
        <h4 className="text-[13px] font-semibold text-ink mb-2">Waarom niet upgraden</h4>
        {limitReasons.length === 0 ? (
          <p className="text-muted text-[13px]">Nog geen reacties.</p>
        ) : (
          <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
            {limitReasons.map((s) => (
              <div key={s.id} className="bg-sand rounded-lg px-3 py-2 text-[12.5px] text-ink">
                <div className="text-muted mb-0.5">{s.naam || 'onbekend'}</div>
                {s.comment}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ActivityTable({ activity }) {
  const [sortDir, setSortDir] = useState('asc');

  const sorted = useMemo(() => {
    return [...activity].sort((a, b) => {
      const aTime = a.last_active_at ? new Date(a.last_active_at).getTime() : 0;
      const bTime = b.last_active_at ? new Date(b.last_active_at).getTime() : 0;
      return sortDir === 'asc' ? aTime - bTime : bTime - aTime;
    });
  }, [activity, sortDir]);

  return (
    <div className="overflow-x-auto border border-line rounded-2xl bg-white">
      <table className="w-full text-left text-[13px] border-collapse">
        <thead>
          <tr className="border-b border-line text-muted text-[11.5px] uppercase tracking-wide">
            <th className="px-4 py-3 font-medium">Naam</th>
            <th className="px-4 py-3 font-medium">
              <button
                onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
                className="bg-transparent border-none cursor-pointer p-0 font-medium text-[11.5px] uppercase tracking-wide text-muted flex items-center gap-1"
              >
                Laatst actief {sortDir === 'asc' ? '↑' : '↓'}
              </button>
            </th>
            <th className="px-4 py-3 font-medium">Totaal sessies</th>
            <th className="px-4 py-3 font-medium">Check-ins</th>
            <th className="px-4 py-3 font-medium">Abonnement</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((u) => (
            <tr key={u.id} className="border-b border-line last:border-b-0">
              <td className="px-4 py-3 text-ink whitespace-nowrap">{u.naam || '—'}</td>
              <td className="px-4 py-3 text-mid whitespace-nowrap">{formatDate(u.last_active_at)}</td>
              <td className="px-4 py-3 text-mid">{u.total_sessions ?? 0}</td>
              <td className="px-4 py-3 text-mid">{u.checkin_count}</td>
              <td className="px-4 py-3 text-mid capitalize">{u.subscription_status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FeedbackTab({ data, onStatusChange }) {
  const { stats, reports, signals, activity } = data;
  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <StatCard label="Actieve gebruikers deze week" value={stats.activeUsersWeek} />
        <StatCard
          label="Gemiddelde tevredenheid"
          value={stats.avgSatisfaction !== null ? `${stats.avgSatisfaction.toFixed(1)} / 5` : '—'}
        />
        <StatCard label="Open bug reports" value={stats.openBugs} />
        <StatCard label="Totaal feedback ontvangen" value={stats.totalFeedback} />
      </div>

      <div>
        <h3 className="font-serif text-xl text-ink mb-3">Feedback & bugs</h3>
        <ReportsTable reports={reports} onStatusChange={onStatusChange} />
      </div>

      <div>
        <h3 className="font-serif text-xl text-ink mb-3">Micro-feedback</h3>
        <MicroFeedbackSection signals={signals} avgSatisfaction={stats.avgSatisfaction} />
      </div>

      <div>
        <h3 className="font-serif text-xl text-ink mb-3">Gebruikersactiviteit</h3>
        <ActivityTable activity={activity} />
      </div>
    </div>
  );
}

export default function Admin() {
  const { session } = useAuth();
  const [tab, setTab] = useState('feedback');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!session) return;
    let cancelled = false;

    fetch('/api/admin/dashboard', {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        if (json.error) {
          setError(json.error);
        } else {
          setData(json);
        }
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setError('Kon het dashboard niet laden.');
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [session]);

  async function handleStatusChange(reportId, status) {
    setData((prev) => ({
      ...prev,
      reports: prev.reports.map((r) => (r.id === reportId ? { ...r, status } : r)),
    }));
    await fetch('/api/admin/report-status', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ reportId, status }),
    });
  }

  return (
    <div className="min-h-svh bg-[#FAFAF9]">
      <div className="border-b border-line bg-white px-6 py-5">
        <h1 className="font-serif text-2xl text-ink">MamaBuddy Admin</h1>
      </div>

      <div className="border-b border-line bg-white px-6 flex gap-1">
        {[
          ['aanmeldingen', 'Aanmeldingen'],
          ['feedback', 'Feedback'],
        ].map(([value, label]) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            className={`px-4 py-3.5 text-sm font-medium border-b-2 bg-transparent cursor-pointer ${
              tab === value ? 'border-rose text-ink' : 'border-transparent text-muted'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="px-6 py-6 max-w-[1100px] mx-auto">
        {tab === 'aanmeldingen' && (
          <div className="bg-white border border-line rounded-2xl p-8 text-center">
            <p className="text-mid text-sm">
              Er is geen <code className="bg-sand px-1.5 py-0.5 rounded">early_access_signups</code>-tabel in dit
              Supabase-project — dit tabblad is een placeholder totdat die aanmeldingenbron bestaat.
            </p>
          </div>
        )}

        {tab === 'feedback' && (
          <>
            {loading && <p className="text-muted text-sm">Laden…</p>}
            {error && <p className="text-rose-dark text-sm">{error}</p>}
            {data && <FeedbackTab data={data} onStatusChange={handleStatusChange} />}
          </>
        )}
      </div>
    </div>
  );
}
