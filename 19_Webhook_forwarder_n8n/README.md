# 19 — Webhook Forwarder (securise)

## Description

Endpoint serverless qui sert de pont securise entre un frontend et un webhook externe (n8n, Zapier, Make, custom). Le frontend envoie des donnees, le serveur les enrichit (timestamp, source) et les forwarde avec un token d'authentification.

## Origine

Extrait de `burn-rpc-proxy/api/airdrop-webhook.js`.

## Pattern

```
Frontend
  → POST /api/webhook  { field_1, field_2 }
  → Serverless function
      → CORS check
      → Enrichit les donnees (timestamp, source)
      → Forward POST vers WEBHOOK_URL avec Bearer token
      → Retourne { success: true }
```

## Variables d'environnement

| Variable | Description |
|---|---|
| `WEBHOOK_URL` | URL du webhook cible (n8n, Zapier, Make, custom) |
| `WEBHOOK_SECRET` | Token secret pour le header Authorization Bearer |

## Utilisation

1. Configurer les env vars sur Vercel
2. Adapter les champs extraits du `req.body` a votre cas
3. Adapter les origines CORS autorisees
4. Deployer

## Appel depuis le frontend

```js
const response = await fetch('/api/webhook', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    field_1: 'valeur1',
    field_2: 'valeur2',
    field_3: 'valeur3'
  })
});
```

## Securite

- **CORS restrictif** : seuls les domaines whitelistes peuvent appeler l'endpoint
- **Bearer token** : le webhook externe est protege par un secret
- **Pas d'exposition du secret** : le token n'est jamais visible cote frontend

## Quand l'utiliser

- Connexion frontend → n8n pour des workflows d'automatisation
- Forwarding vers Zapier, Make, ou tout webhook HTTP
- Tout cas ou le frontend ne doit pas connaitre l'URL/secret du webhook
