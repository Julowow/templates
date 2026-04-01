# Block 2 — Supabase CRUD + RPC

## Description

Client Supabase prêt à l'emploi avec les patterns de query les plus courants : SELECT filtré, INSERT avec retour, et appel de stored procedures (RPC).

## Contenu

- `supabase-client.js` — Client init + helpers CRUD + RPC

## Setup

```bash
npm install @supabase/supabase-js
```

## Variables d'environnement

| Variable | Description |
|---|---|
| `SUPABASE_URL` | URL du projet Supabase (ex: `https://xxx.supabase.co`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service_role (accès admin, ne jamais exposer côté client) |

## Patterns inclus

### SELECT avec filtres
```js
const show = await getBySlug("shows", "mon-show");
```

### INSERT avec retour
```js
const row = await insertRow("purchases", { wallet: "...", amount: 100 });
```

### Appel RPC (stored procedure)
```js
const count = await callRpc("get_wallet_purchases", { p_wallet: "..." });
```

## Notes

- `service_role_key` bypass les Row Level Security (RLS) — à utiliser uniquement côté serveur
- `.single()` retourne un objet au lieu d'un tableau (erreur si 0 ou 2+ résultats)
- Les RPC correspondent à des fonctions PostgreSQL créées dans Supabase (SQL Editor)
