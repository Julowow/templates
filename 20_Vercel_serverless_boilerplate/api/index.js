// ============================================
// BLOCK 20 — Vercel Serverless Boilerplate
// ============================================
// Pattern : Structure minimale d'un handler Vercel serverless
//           ESM (type: module), zero dependances, Node 18+
// Usage   : Point de depart pour tout micro-backend Vercel
// Source  : burn-rpc-proxy (structure globale)
// ============================================

export default async function handler(req, res) {
  // CORS ouvert (ou importer le block 15 pour du restrictif)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  // Preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  try {
    // --- Votre logique ici ---

    // Exemple : lire un query param
    const { name } = req.query;

    // Exemple : lire le body (pour POST)
    // const { data } = req.body;

    return res.status(200).json({
      success: true,
      message: `Hello ${name || 'world'}`
    });

  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
