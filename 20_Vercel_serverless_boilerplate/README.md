# 20 — Vercel Serverless Boilerplate

## Description

Structure de projet minimale pour un backend serverless sur Vercel. Zero dependances npm, ESM natif, Node 18+.

## Origine

Extrait de la structure globale de `burn-rpc-proxy`.

## Structure

```
project/
  ├── api/
  │   ├── index.js          → GET /api
  │   ├── users.js           → GET /api/users
  │   └── webhook.js         → POST /api/webhook
  ├── package.json
  ├── .gitignore
  └── .env.local             (non commite)
```

## Points cles

- **`"type": "module"`** dans `package.json` pour utiliser `import/export`
- **Chaque fichier dans `api/`** devient automatiquement un endpoint
- **`fetch` natif** disponible sans import (Node 18+)
- **Zero dependances** : pas de `node_modules` a gerer

## Demarrage

```bash
# 1. Installer Vercel CLI (une seule fois)
npm i -g vercel

# 2. Dev local
vercel dev

# 3. Deployer
vercel --prod
```

## Variables d'environnement

```bash
# En local : creer .env.local
MY_API_KEY=xxx
MY_SECRET=yyy

# Sur Vercel : via le dashboard ou CLI
vercel env add MY_API_KEY
```

## Convention des handlers

```js
// api/mon-endpoint.js → accessible via /api/mon-endpoint
export default async function handler(req, res) {
  // req.method  → GET, POST, etc.
  // req.query   → query params (?key=value)
  // req.body    → body JSON (POST)
  // res.status(200).json({ ... })
}
```

## Quand l'utiliser

- Tout nouveau micro-backend sans framework
- API proxy, webhooks, endpoints simples
- Projets ou la rapidite de deploiement prime
