# Bloc 3 — Standalone IIFE Library

Template pour creer une lib JavaScript distribuable en `<script>` tag, compilee en IIFE via Vite.

## Features

- Build IIFE autonome (bundle unique, toutes deps inlinées)
- API publique simple sur `window.MyLib`
- Lazy-loading de SDK lourds
- Injection de styles CSS programmatique
- Custom events pour communication externe
- Minification esbuild

## Structure

```
src/
  index.ts      # Point d'entree, API publique
  constants.ts  # Configuration (wallets, theme, etc.)
  styles.ts     # CSS injecte dynamiquement
vite.config.ts  # Build config IIFE
package.json    # Scripts build/dev
```

## Usage

```bash
# Build
npm run build    # -> public/my-lib.js

# Dev (watch mode)
npm run dev
```

## Integration sur un site

```html
<script src="https://your-cdn.com/my-lib.js"></script>
<div id="my-lib-container"></div>

<script>
  // API
  const result = await window.MyLib.connect();
  window.MyLib.disconnect();
  window.MyLib.getState();
  window.MyLib.isReady();

  // Events
  window.addEventListener('mylib:connected', (e) => {
    console.log('Connected:', e.detail);
  });
</script>
```

## Customisation

1. Renommer `MyLib` partout (index.ts, vite.config.ts)
2. Adapter les styles dans `styles.ts`
3. Modifier l'API dans `index.ts`
4. Changer le nom du fichier output dans `vite.config.ts`
