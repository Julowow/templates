# 18 — Supabase REST RPC Function Call (sans SDK)

## Description

Utilitaire pour appeler des fonctions PostgreSQL (RPC) exposees par Supabase, sans SDK. Permet d'executer de la logique complexe cote base de donnees (leaderboards, aggregations, calculs de stats).

## Origine

Extrait de `burn-rpc-proxy/api/leaderboard.js` (`get_competition_leaderboard`) et `api/burn-stats.js` (`get_wallet_stats`).

## Pattern

```
callRpc({ functionName, params })
  → POST {SUPABASE_URL}/rest/v1/rpc/{functionName}
  → Headers: apikey + Bearer + Content-Type JSON
  → Body: params en JSON
  → Parse JSON → retourne le resultat
```

## Variables d'environnement

| Variable | Description |
|---|---|
| `SUPABASE_URL` | URL du projet Supabase |
| `SUPABASE_ANON_KEY` | Cle anonyme du projet |

## Utilisation

```js
import { callRpc } from './supabase-rpc-call.js';

const leaderboard = await callRpc({
  functionName: 'get_competition_leaderboard',
  params: {
    comp_start: '2025-01-01',
    comp_end: '2025-03-31',
    top_limit: 10
  }
});
```

## Difference avec le Block 17

| Block 17 (Table Query) | Block 18 (RPC Function) |
|---|---|
| `GET /rest/v1/{table}` | `POST /rest/v1/rpc/{function}` |
| Lecture simple de lignes | Logique complexe cote DB |
| Filtres PostgREST | Parametres libres |
| Select, filter, order, limit | Aggregations, calculs, joins complexes |

## Quand l'utiliser

- Leaderboards, classements avec calculs complexes
- Statistiques agreges (totaux, moyennes, rangs)
- Toute logique metier qu'il vaut mieux executer en SQL cote serveur
- Quand les filtres PostgREST simples ne suffisent pas
