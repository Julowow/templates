# 15 — CORS Restrictive Middleware

## Description

Middleware CORS restrictif avec whitelist d'origines. Gere automatiquement le preflight OPTIONS et bloque les origines non autorisees.

## Origine

Extrait de `burn-rpc-proxy/api/rpc.js` et `api/airdrop-webhook.js`.

## Pattern

```
Requete entrante
  → Verification de l'origin contre une whitelist
  → Si refusee → 403
  → Si OK → Set headers CORS
  → Si OPTIONS (preflight) → 200 vide
  → Sinon → continuer le handler
```

## Utilisation

```js
import { applyCors } from './cors-middleware.js';

export default async function handler(req, res) {
  const handled = applyCors(req, res, {
    allowedOrigins: ['https://mon-site.com', 'http://localhost:3000'],
    allowedMethods: ['POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  });
  if (handled) return;

  // logique metier...
}
```

## Parametres

| Param | Type | Default | Description |
|---|---|---|---|
| `allowedOrigins` | `string[]` | `['https://your-domain.com', 'http://localhost:3000']` | Origines autorisees |
| `allowedMethods` | `string[]` | `['POST', 'OPTIONS']` | Methodes HTTP acceptees |
| `allowedHeaders` | `string[]` | `['Content-Type']` | Headers acceptes |

## Quand l'utiliser

- Tout endpoint API qui doit etre restreint a un ou plusieurs frontends specifiques
- Remplace le `Access-Control-Allow-Origin: *` quand on veut du controle
