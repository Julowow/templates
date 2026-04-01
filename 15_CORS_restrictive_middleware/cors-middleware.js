// ============================================
// BLOCK 15 — CORS Restrictive Middleware
// ============================================
// Pattern : Whitelist d'origines autorisees + preflight OPTIONS + restriction de methodes HTTP
// Usage   : A placer en debut de tout handler Vercel serverless qui doit etre verrouille a des domaines specifiques
// Source  : burn-rpc-proxy/api/rpc.js & airdrop-webhook.js
// ============================================

/**
 * Applique les headers CORS restrictifs et gere le preflight.
 * Retourne `true` si la requete a ete geree (origin refusee ou preflight) — le handler doit s'arreter.
 * Retourne `false` si la requete peut continuer.
 *
 * @param {object} req - Vercel request object
 * @param {object} res - Vercel response object
 * @param {object} [options]
 * @param {string[]} [options.allowedOrigins] - Liste des origines autorisees
 * @param {string[]} [options.allowedMethods] - Methodes HTTP autorisees (defaut: ['POST', 'OPTIONS'])
 * @param {string[]} [options.allowedHeaders] - Headers autorises (defaut: ['Content-Type'])
 * @returns {boolean} true si la requete a ete geree et qu'il faut return dans le handler
 */
export function applyCors(req, res, options = {}) {
  const {
    allowedOrigins = [
      'https://your-domain.com',
      'http://localhost:3000'
    ],
    allowedMethods = ['POST', 'OPTIONS'],
    allowedHeaders = ['Content-Type']
  } = options;

  const origin = req.headers.origin;

  // Verifier l'origine
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.status(403).json({ error: 'Origin not allowed' });
    return true; // requete geree — stop
  }

  res.setHeader('Access-Control-Allow-Methods', allowedMethods.join(', '));
  res.setHeader('Access-Control-Allow-Headers', allowedHeaders.join(', '));

  // Preflight OPTIONS
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true; // requete geree — stop
  }

  return false; // continuer le handler
}


// ============================================
// EXEMPLE D'UTILISATION DANS UN HANDLER VERCEL
// ============================================
//
// import { applyCors } from './cors-middleware.js';
//
// export default async function handler(req, res) {
//   const handled = applyCors(req, res, {
//     allowedOrigins: ['https://my-app.com', 'http://localhost:3000'],
//     allowedMethods: ['POST', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization']
//   });
//   if (handled) return;
//
//   // ... logique metier ici
// }
