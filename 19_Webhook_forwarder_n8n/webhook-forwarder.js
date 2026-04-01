// ============================================
// BLOCK 19 — Webhook Forwarder (securise)
// ============================================
// Pattern : Recevoir des donnees du frontend, les enrichir, et les forwarder
//           vers un service d'automatisation externe (n8n, Zapier, Make...)
//           avec authentification Bearer
// Usage   : Pont securise entre un frontend et un webhook tiers
// Source  : burn-rpc-proxy/api/airdrop-webhook.js
// ============================================

export default async function handler(req, res) {
  // --- CORS (adapter ou importer le block 15) ---
  const ALLOWED_ORIGINS = [
    'https://your-domain.com',
    'http://localhost:3000'
  ];

  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    return res.status(403).json({ error: 'Origin not allowed' });
  }

  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // --- Config ---
  const WEBHOOK_URL = process.env.WEBHOOK_URL;
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_URL || !WEBHOOK_SECRET) {
    console.error('Webhook config missing');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    // --- Extraction des donnees du body ---
    // Adapter les champs selon votre cas d'usage
    const { field_1, field_2, field_3 } = req.body;

    // --- Forward vers le webhook externe ---
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WEBHOOK_SECRET}`
      },
      body: JSON.stringify({
        // Donnees du frontend
        field_1,
        field_2,
        field_3,
        // Enrichissement serveur
        timestamp: new Date().toISOString(),
        source: 'api-proxy'
      })
    });

    if (!response.ok) {
      console.error('Webhook error:', response.status);
      return res.status(500).json({ error: 'Webhook failed' });
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Webhook failed' });
  }
}
