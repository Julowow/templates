// ============================================
// BLOCK 18 — Supabase REST RPC Function Call (sans SDK)
// ============================================
// Pattern : Appeler une fonction PostgreSQL (RPC) via l'API REST Supabase
// Usage   : Executer de la logique complexe cote DB (leaderboards, aggregations, stats...)
// Source  : burn-rpc-proxy/api/leaderboard.js (appel get_competition_leaderboard)
//           burn-rpc-proxy/api/burn-stats.js (appel get_wallet_stats)
// ============================================

/**
 * Appelle une fonction RPC Supabase (PostgreSQL function) via l'API REST.
 *
 * @param {object} options
 * @param {string} options.functionName - Nom de la fonction PostgreSQL
 * @param {object} options.params       - Parametres a passer a la fonction (body JSON)
 * @returns {Promise<any>} Resultat de la fonction
 */
export async function callRpc({ functionName, params = {} }) {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error('SUPABASE_URL or SUPABASE_ANON_KEY not configured');
  }

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/rpc/${functionName}`,
    {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Supabase RPC "${functionName}" failed (${response.status}): ${error}`);
  }

  return response.json();
}


// ============================================
// EXEMPLES D'UTILISATION
// ============================================
//
// import { callRpc } from './supabase-rpc-call.js';
//
// // Appeler une fonction de leaderboard
// const leaderboard = await callRpc({
//   functionName: 'get_competition_leaderboard',
//   params: {
//     comp_start: '2025-01-01',
//     comp_end: '2025-03-31',
//     comp_burn_wallet: '0xABC...',
//     top_limit: 10
//   }
// });
//
// // Appeler une fonction de stats wallet
// const stats = await callRpc({
//   functionName: 'get_wallet_stats',
//   params: {
//     wallet_address: '0xDEF...',
//     comp_start: '2025-01-01',
//     comp_end: '2025-03-31'
//   }
// });
//
// // Appeler n'importe quelle fonction PostgreSQL
// const result = await callRpc({
//   functionName: 'calculate_rewards',
//   params: { user_id: 42 }
// });
