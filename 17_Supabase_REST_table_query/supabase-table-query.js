// ============================================
// BLOCK 17 — Supabase REST Table Query (sans SDK)
// ============================================
// Pattern : Requeter une table Supabase via l'API REST, sans embarquer le SDK JS
// Usage   : Environnements serverless legers ou l'on veut zero dependances
// Source  : burn-rpc-proxy/api/leaderboard.js (partie query table)
// ============================================

/**
 * Requete une table Supabase via l'API REST (GET).
 *
 * @param {object} options
 * @param {string} options.table     - Nom de la table
 * @param {string} options.filters   - Filtres PostgREST (ex: "status=eq.active&order=id.desc")
 * @param {number} [options.limit]   - Nombre max de resultats
 * @param {string} [options.select]  - Colonnes a selectionner (ex: "id,name,status")
 * @returns {Promise<Array>} Resultats de la requete
 */
export async function queryTable({ table, filters = '', limit, select }) {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error('SUPABASE_URL or SUPABASE_ANON_KEY not configured');
  }

  // Construction de l'URL
  let url = `${SUPABASE_URL}/rest/v1/${table}`;
  const params = [];

  if (filters) params.push(filters);
  if (select) params.push(`select=${select}`);
  if (limit) params.push(`limit=${limit}`);

  if (params.length > 0) {
    url += `?${params.join('&')}`;
  }

  const response = await fetch(url, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Supabase query failed (${response.status}): ${error}`);
  }

  return response.json();
}


// ============================================
// EXEMPLE D'UTILISATION
// ============================================
//
// import { queryTable } from './supabase-table-query.js';
//
// // Recuperer les competitions actives
// const competitions = await queryTable({
//   table: 'competitions',
//   filters: 'status=eq.active&order=id.desc',
//   limit: 1
// });
//
// // Recuperer un enregistrement par ID
// const [item] = await queryTable({
//   table: 'competitions',
//   filters: 'id=eq.42',
//   limit: 1
// });
//
// // Selectionner des colonnes specifiques
// const names = await queryTable({
//   table: 'users',
//   select: 'id,name,email',
//   limit: 50
// });
