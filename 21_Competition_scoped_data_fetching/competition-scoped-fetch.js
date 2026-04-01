// ============================================
// BLOCK 21 — Competition-Scoped Data Fetching
// ============================================
// Pattern : Recuperer une competition active (ou par ID), puis utiliser ses
//           parametres temporels pour filtrer des donnees associees
// Usage   : Leaderboards par saison, stats par evenement, tout systeme
//           de "rounds" ou "saisons" avec des periodes definies
// Source  : burn-rpc-proxy/api/leaderboard.js & burn-stats.js
// Depend  : Block 17 (queryTable) + Block 18 (callRpc)
// ============================================

import { queryTable } from '../17_Supabase_REST_table_query/supabase-table-query.js';
import { callRpc } from '../18_Supabase_REST_RPC_function/supabase-rpc-call.js';


/**
 * Recupere la competition active ou une competition specifique par ID.
 *
 * @param {string} [competitionId] - ID optionnel. Si absent, retourne la derniere competition active.
 * @returns {Promise<object|null>} La competition, ou null si aucune trouvee
 */
export async function getCompetition(competitionId) {
  let filters;

  if (competitionId) {
    filters = `id=eq.${competitionId}`;
  } else {
    filters = 'status=eq.active&order=id.desc';
  }

  const competitions = await queryTable({
    table: 'competitions',
    filters,
    limit: 1
  });

  return competitions[0] || null;
}


/**
 * Recupere des donnees filtrees par les dates d'une competition.
 * Combine getCompetition + appel RPC pour obtenir des resultats scoped.
 *
 * @param {object} options
 * @param {string} [options.competitionId] - ID de la competition (optionnel)
 * @param {string} options.rpcFunction     - Nom de la fonction RPC Supabase a appeler
 * @param {object} [options.extraParams]   - Parametres supplementaires pour la fonction RPC
 * @returns {Promise<{ competition: object|null, data: any }>}
 */
export async function fetchCompetitionScopedData({ competitionId, rpcFunction, extraParams = {} }) {
  // 1. Recuperer la competition
  const competition = await getCompetition(competitionId);

  if (!competition?.start_date) {
    return { competition: null, data: [] };
  }

  // 2. Appeler la fonction RPC avec les dates de la competition
  const data = await callRpc({
    functionName: rpcFunction,
    params: {
      comp_start: competition.start_date,
      comp_end: competition.end_date,
      ...extraParams
    }
  });

  return {
    competition: {
      id: competition.id,
      name: competition.name,
      start_date: competition.start_date,
      end_date: competition.end_date
    },
    data
  };
}


// ============================================
// EXEMPLES D'UTILISATION
// ============================================
//
// import { fetchCompetitionScopedData, getCompetition } from './competition-scoped-fetch.js';
//
// // --- Leaderboard de la competition active ---
// const { competition, data: leaderboard } = await fetchCompetitionScopedData({
//   rpcFunction: 'get_competition_leaderboard',
//   extraParams: { top_limit: 10 }
// });
//
// // --- Stats d'un wallet pour une competition specifique ---
// const { data: stats } = await fetchCompetitionScopedData({
//   competitionId: '5',
//   rpcFunction: 'get_wallet_stats',
//   extraParams: { wallet_address: '0xABC...' }
// });
//
// // --- Juste recuperer la competition active ---
// const comp = await getCompetition();
// console.log(comp.name, comp.start_date, comp.end_date);
