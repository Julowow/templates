# Block 3 — Vercel API Handler Boilerplate

## Description

Template de handler pour un endpoint Vercel serverless. Inclut le traitement CORS preflight, le guard de méthode HTTP, la validation des paramètres et le try/catch global.

## Contenu

- `handler.js` — Template de handler complet

## Structure du handler

```
1. OPTIONS → 204 (preflight CORS)
2. Method guard → 405 si mauvaise méthode
3. try {
     Extract params (query ou body)
     Validate → 400 si invalide
     Business logic
     Return 200 + JSON
   } catch → 500
```

## Usage

1. Copier `handler.js` dans `api/mon-endpoint.js`
2. Changer la méthode HTTP (GET/POST)
3. Adapter les params et la validation
4. Ajouter la logique métier

## Notes

- Le preflight OPTIONS est nécessaire si le CORS n'est pas géré à 100% par `vercel.json`
- Pour un POST, remplacer `req.query` par `req.body` (Vercel parse automatiquement le JSON)
- Les codes HTTP standards : 200 OK, 400 Bad Request, 404 Not Found, 405 Method Not Allowed, 409 Conflict, 500 Internal Error
