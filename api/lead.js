// Receives the "Customised Plan" form and forwards it to Zoho Flow, which creates/updates the Bigin contact.
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const webhookUrl = process.env.ZOHO_FLOW_WEBHOOK_URL;
  if (!webhookUrl) return res.status(500).json({ error: 'Webhook not configured' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const firstName = String(body.first_name || '').trim().slice(0, 40);
  const lastName  = String(body.last_name  || '').trim().slice(0, 80);
  const phone     = String(body.phone      || '').replace(/\D/g, '');

  if (!firstName || !lastName || !/^[6-9]\d{9}$/.test(phone)) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  try {
    const flowRes = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        phone: '+91' + phone,
        lead_source: 'Guide-lead'
      })
    });
    if (!flowRes.ok) return res.status(502).json({ error: 'Zoho Flow rejected the request' });
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(502).json({ error: 'Could not reach Zoho Flow' });
  }
};
