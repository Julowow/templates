# 17 — Supabase REST Table Query (sans SDK)

## Description

Utilitaire pour requeter des tables Supabase via l'API REST PostgREST, sans aucune dependance npm. Ideal pour les serverless functions zero-dependency.

## Origine

Extrait de `burn-rpc-proxy/api/leaderboard.js` (pattern de query sur la table `competitions`).

## Pattern

```
queryTable({ table, filters, limit, select })
  → GET {SUPABASE_URL}/rest/v1/{table}?{filters}&limit={limit}
  → Headers: apikey + Bearer token
  → Parse JSON → retourne le tableau de resultats
```

## Variables d'environnement

| Variable | Description |
|---|---|
| `SUPABASE_URL` | URL du projet Supabase (ex: `https://xxx.supabase.co`) |
| `SUPABASE_ANON_KEY` | Cle anonyme du projet |

## Utilisation

```js
import { queryTable } from './supabase-table-query.js';

// Filtrer par statut
const active = await queryTable({
  table: 'competitions',
  filters: 'status=eq.active&order=id.desc',
  limit: 1
});

// Par ID
const [item] = await queryTable({
  table: 'products',
  filters: 'id=eq.42',
  limit: 1
});

// Selection de colonnes
const users = await queryTable({
  table: 'users',
  select: 'id,name,email',
  limit: 50
});
```

## Syntaxe des filtres PostgREST

| Filtre | Exemple | Signification |
|---|---|---|
| `eq` | `status=eq.active` | egal a |
| `neq` | `status=neq.deleted` | different de |
| `gt` / `gte` | `amount=gt.100` | superieur (ou egal) |
| `lt` / `lte` | `amount=lt.50` | inferieur (ou egal) |
| `like` | `name=like.*john*` | contient |
| `in` | `id=in.(1,2,3)` | dans la liste |
| `order` | `order=created_at.desc` | tri |

## Quand l'utiliser

- Serverless functions Vercel/Netlify sans SDK Supabase
- Scripts legers qui n'ont besoin que de quelques requetes
- Projets ou l'on veut garder 0 dependances npm
