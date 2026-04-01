# Block 1 — Vercel Serverless Scaffold

## Description

Structure de base pour un projet API serverless deployé sur Vercel avec ES Modules.

## Contenu

- `package.json` — Config Node.js ESM, scripts dev/deploy
- `vercel.json` — Config Vercel : durée max des fonctions, CORS global, rewrites/redirects

## Setup

1. Remplacer `"my-project"` par le nom du projet dans `package.json`
2. Remplacer `YOUR_FRONTEND_DOMAIN.com` par le domaine du frontend dans `vercel.json`
3. Ajouter les dépendances nécessaires
4. Créer un dossier `api/` avec les endpoints

## Variables d'environnement

Configurer dans le dashboard Vercel (Settings > Environment Variables).

## Commandes

```bash
npm install
npm run dev      # Dev local
npm run deploy   # Deploy production
```

## Notes

- Les fichiers dans `api/` deviennent automatiquement des endpoints (`api/users.js` → `GET/POST /api/users`)
- Le CORS est géré globalement par `vercel.json`, pas besoin de le gérer dans chaque handler
- `maxDuration: 30` = timeout de 30 secondes par fonction
