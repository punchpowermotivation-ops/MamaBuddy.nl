import { requireAdmin, supabaseAdmin } from '../_lib/adminAuth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const admin = await requireAdmin(req);
  if (!admin) {
    res.status(401).json({ error: 'Niet geautoriseerd.' });
    return;
  }

  const { reportId, status, notes } = req.body || {};
  if (!reportId || !status) {
    res.status(400).json({ error: 'reportId en status zijn verplicht.' });
    return;
  }

  const { error } = await supabaseAdmin.rpc('update_feedback_report_status', {
    report_id: reportId,
    new_status: status,
    notes: notes ?? null,
  });

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.status(200).json({ success: true });
}
