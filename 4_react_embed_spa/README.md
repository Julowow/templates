# Bloc 4 — React Embed SPA (multi-page iframe app)

Template de micro-app React conçue pour tourner dans un iframe, avec routing multi-pages et communication vers le parent.

## Features

- React 18 + TypeScript + Vite (SWC)
- React Router v6 pour routing des pages embed
- Provider conditionnel par route (evite de charger des SDKs inutiles)
- Communication embed -> parent via `postMessage`
- Pages de base : Redirect, NotFound
- Path alias `@/` -> `./src`

## Structure

```
src/
  main.tsx          # Entry point
  App.tsx           # Router avec providers conditionnels
  pages/
    Redirect.tsx    # Redirige vers site principal
    NotFound.tsx    # 404
    EmbedPage.tsx   # Exemple de page embed
index.html          # HTML shell
vite.config.ts      # Config Vite
package.json        # Dependencies
```

## Usage

```bash
npm install
npm run dev     # -> http://localhost:8080
npm run build   # -> dist/
```

## Customisation

1. Ajouter tes pages embed dans `src/pages/`
2. Enregistrer les routes dans `App.tsx`
3. Wrapper avec tes providers si besoin (auth, wallet, etc.)
4. Configurer la redirection dans `Redirect.tsx`
