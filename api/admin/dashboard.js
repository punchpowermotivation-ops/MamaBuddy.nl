import { requireAdmin, supabaseAdmin } from '../_lib/adminAuth.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const admin = await requireAdmin(req);
  if (!admin) {
    res.status(401).json({ error: 'Niet geautoriseerd.' });
    return;
  }

  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [
      { count: activeUsersWeek },
      { data: satisfactionSignals },
      { count: openBugs },
      { count: totalFeedback },
      { data: reports, error: reportsError },
      { data: signals, error: signalsError },
      { data: profiles },
      { data: checkins },
    ] = await Promise.all([
      supabaseAdmin
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .gte('last_active_at', sevenDaysAgo),
      supabaseAdmin.from('feedback_signals').select('rating').eq('context', 'app_tevredenheid'),
      supabaseAdmin
        .from('feedback_reports')
        .select('id', { count: 'exact', head: true })
        .eq('type', 'bug')
        .eq('status', 'nieuw'),
      supabaseAdmin.from('feedback_reports').select('id', { count: 'exact', head: true }),
      supabaseAdmin.rpc('get_all_feedback_reports'),
      supabaseAdmin.rpc('get_all_feedback_signals'),
      supabaseAdmin.from('profiles').select('id, naam, last_active_at, total_sessions, subscription_status'),
      supabaseAdmin.from('checkins').select('user_id'),
    ]);

    if (reportsError) throw reportsError;
    if (signalsError) throw signalsError;

    const avgSatisfaction = satisfactionSignals?.length
      ? satisfactionSignals.reduce((sum, s) => sum + (s.rating || 0), 0) / satisfactionSignals.length
      : null;

    const checkinCounts = {};
    (checkins ?? []).forEach((c) => {
      checkinCounts[c.user_id] = (checkinCounts[c.user_id] || 0) + 1;
    });
    const activity = (profiles ?? []).map((p) => ({
      ...p,
      checkin_count: checkinCounts[p.id] || 0,
    }));

    res.status(200).json({
      stats: {
        activeUsersWeek: activeUsersWeek ?? 0,
        avgSatisfaction,
        openBugs: openBugs ?? 0,
        totalFeedback: totalFeedback ?? 0,
      },
      reports: reports ?? [],
      signals: signals ?? [],
      activity,
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Er ging iets mis.' });
  }
}
