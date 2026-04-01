// ============================================
// BLOCK 16 — RPC Proxy Multi-Chain
// ============================================
// Pattern : Proxy transparent de requetes JSON-RPC vers des providers blockchain
//           avec selection dynamique du provider via un header HTTP
// Usage   : Cacher les cles API RPC cote serveur, supporter plusieurs chains
// Source  : burn-rpc-proxy/api/rpc.js
// ============================================

/**
 * Configuration des providers RPC.
 * Chaque cle correspond a une valeur possible du header `x-rpc-target`.
 * `buildUrl` retourne l'URL complete du provider a partir des env vars.
 */
const RPC_PROVIDERS = {
  solana: {
    name: 'Solana (Helius)',
    envVar: 'HELIUS_API_KEY',
    buildUrl: (key) => `https://mainnet.helius-rpc.com/?api-key=${key}`
  },
  ethereum: {
    name: 'Ethereum (Alchemy)',
    envVar: 'ALCHEMY_ETH_URL',
    buildUrl: (url) => url // URL complete dans l'env var
  }
  // Ajouter d'autres chains ici :
  // base: {
  //   name: 'Base (Alchemy)',
  //   envVar: 'ALCHEMY_BASE_URL',
  //   buildUrl: (url) => url
  // }
};

/** Header HTTP utilise par le frontend pour selectionner la chain */
const RPC_TARGET_HEADER = 'x-rpc-target';

/** Chain par defaut si le header est absent */
const DEFAULT_TARGET = 'solana';


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
  res.setHeader('Access-Control-Allow-Headers', `Content-Type, ${RPC_TARGET_HEADER}`);

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // --- Selection du provider ---
  const rpcTarget = req.headers[RPC_TARGET_HEADER] || DEFAULT_TARGET;
  const provider = RPC_PROVIDERS[rpcTarget];

  if (!provider) {
    return res.status(400).json({ error: `Unknown RPC target: ${rpcTarget}` });
  }

  const envValue = process.env[provider.envVar];
  if (!envValue) {
    console.error(`${provider.envVar} not configured`);
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const rpcUrl = provider.buildUrl(envValue);

  // --- Proxy de la requete ---
  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    console.log(`RPC request [${rpcTarget}] from ${ip}`);

    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`${rpcTarget} RPC error:`, data);
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);

  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ error: 'RPC request failed' });
  }
}
