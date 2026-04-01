# Bloc 1 — Vercel Serverless API (Rate Limiting, CORS, Proxy)

Template d'API serverless Vercel avec securite production-ready.

## Features

- **Rate limiting** par IP (in-memory, cleanup probabiliste)
- **CORS** strict avec whitelist d'origines (prod vs dev)
- **Client header** validation custom
- **Structured logging** (JSON avec timestamp/stack)
- **3 exemples d'endpoints** :
  - `proxy.ts` — Proxy securise vers une API tierce (whitelist de methodes)
  - `sign.ts` — Signature HMAC-SHA256 cote serveur
  - `cached-get.ts` — GET avec cache in-memory TTL

## Setup

```bash
npm install @vercel/node
```

## Usage

1. Remplacer `YOUR_APP` par le nom de ton projet dans `middleware.ts`
2. Configurer les `ALLOWED_ORIGINS` dans `middleware.ts`
3. Ajouter tes variables d'env dans Vercel Dashboard
4. Deployer avec `vercel deploy`

## Variables d'environnement

| Variable | Description |
|----------|-------------|
| `API_SECRET_KEY` | Cle secrete pour signature HMAC |
| `UPSTREAM_API_KEY` | Cle API du service tiers a proxier |

## Structure

```
api/
  _shared/
    middleware.ts   # CORS, rate limit, logging, validation
  proxy.ts          # Proxy securise avec whitelist de methodes
  sign.ts           # Signature HMAC-SHA256
  cached-get.ts     # GET avec cache TTL
```
