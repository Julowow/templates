# 21 — Competition-Scoped Data Fetching

## Description

Pattern pour recuperer des donnees filtrees par une competition/saison/evenement actif. Recupere d'abord la competition (active ou par ID), puis utilise ses dates comme parametres pour filtrer les donnees via une fonction RPC.

## Origine

Extrait de `burn-rpc-proxy/api/leaderboard.js` et `api/burn-stats.js`.

## Dependances internes

- **Block 17** (`queryTable`) pour la requete sur la table `competitions`
- **Block 18** (`callRpc`) pour l'appel des fonctions RPC Supabase

## Pattern

```
1. getCompetition(id?)
   → Si ID fourni : fetch competition par ID
   → Sinon : fetch la derniere competition active

2. fetchCompetitionScopedData({ rpcFunction, extraParams })
   → Recupere la competition
   → Appelle la fonction RPC avec comp_start + comp_end + extraParams
   → Retourne { competition, data }
```

## Utilisation

```js
import { fetchCompetitionScopedData } from './competition-scoped-fetch.js';

// Leaderboard de la saison active
const { competition, data: leaderboard } = await fetchCompetitionScopedData({
  rpcFunction: 'get_competition_leaderboard',
  extraParams: { top_limit: 10 }
});

// Stats wallet pour une saison specifique
const { data: stats } = await fetchCompetitionScopedData({
  competitionId: '5',
  rpcFunction: 'get_wallet_stats',
  extraParams: { wallet_address: '0xABC...' }
});
```

## Schema de table attendu

```sql
CREATE TABLE competitions (
  id SERIAL PRIMARY KEY,
  name TEXT,
  status TEXT DEFAULT 'active',  -- 'active', 'ended', 'upcoming'
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  -- ajoutez vos champs specifiques ici
);
```

## Adaptable a d'autres contextes

Ce pattern fonctionne pour tout systeme base sur des periodes :

| Contexte | Table | Champs cles |
|---|---|---|
| Competitions de burn | `competitions` | `start_date`, `end_date`, `burn_wallet` |
| Saisons de jeu | `seasons` | `start_date`, `end_date`, `rewards_pool` |
| Sprints | `sprints` | `start_date`, `end_date`, `team_id` |
| Evenements promo | `events` | `start_date`, `end_date`, `discount_code` |

Il suffit d'adapter le nom de la table et les champs dans `getCompetition()`.

## Quand l'utiliser

- Leaderboards par saison/competition
- Statistiques filtrees par periode active
- Tout systeme ou les donnees doivent etre scopees a un evenement temporel
