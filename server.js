const express = require('express');
const path = require('path');
const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const GRAPH_API_VERSION = process.env.GRAPH_API_VERSION || 'v23.0';
const TEMPLATE_LANGUAGE_CODE = process.env.TEMPLATE_LANGUAGE_CODE || 'en_US';

function authorized(req, res, next) {
  if (!ADMIN_API_KEY) return res.status(503).json({ error: 'Server setup incomplete: ADMIN_API_KEY is missing.' });
  if (req.get('x-admin-key') !== ADMIN_API_KEY) return res.status(401).json({ error: 'Unauthorized. Check the admin API key.' });
  next();
}
app.get('/health', authorized, (_req, res) => res.json({ ok: true, service: 'EasyBuy/Delivery WhatsApp target API' }));

app.post('/api/send-target', authorized, async (req, res) => {
  if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
    return res.status(503).json({ error: 'Server setup incomplete: set WHATSAPP_TOKEN and PHONE_NUMBER_ID in hosting environment variables.' });
  }
  const { template, recipients } = req.body || {};
  if (!/^[a-zA-Z0-9_]{1,128}$/.test(String(template || ''))) return res.status(400).json({ error: 'Invalid template name.' });
  if (!Array.isArray(recipients) || recipients.length < 1 || recipients.length > 100) {
    return res.status(400).json({ error: 'Provide 1–100 recipients per send.' });
  }
  const results = [];
  for (const r of recipients) {
    const phone = String(r.phone || '').replace(/\D/g, '');
    if (!r.name || !/^\d{10,15}$/.test(phone)) {
      results.push({ name: String(r.name || ''), phone, status: 'failed', error: 'Invalid name or phone number.' });
      continue;
    }
    const values = [r.name, r.ebTarget, r.ebSales, r.ebRemaining, r.doTarget, r.doSales, r.doRemaining]
      .map(v => ({ type: 'text', text: String(v ?? '') }));
    try {
      const response = await fetch(`https://graph.facebook.com/${GRAPH_API_VERSION}/${PHONE_NUMBER_ID}/messages`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: phone,
          type: 'template',
          template: { name: template, language: { code: TEMPLATE_LANGUAGE_CODE }, components: [{ type: 'body', parameters: values }] }
        })
      });
      const data = await response.json().catch(() => ({}));
      results.push(response.ok
        ? { name: r.name, phone, status: 'submitted', message_id: data.messages?.[0]?.id || null }
        : { name: r.name, phone, status: 'failed', error: data.error?.message || `Meta API HTTP ${response.status}` });
    } catch (e) {
      results.push({ name: r.name, phone, status: 'failed', error: e.message || 'Network error' });
    }
  }
  res.json({ ok: results.every(x => x.status === 'submitted'), count: results.length, results });
});

app.get('*', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.listen(PORT, () => console.log(`EasyBuy target dashboard listening on ${PORT}`));
