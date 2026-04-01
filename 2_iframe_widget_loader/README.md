# Bloc 2 — Widget Embeddable (iframe + loader)

Template de widget SaaS embeddable sur n'importe quel site tiers via iframe.

## Features

- **widget-loader.js** — Script principal a inclure sur le site hote
  - Ouvre un modal overlay avec iframe
  - Animations fade-in/out, blur backdrop
  - Close on Esc, click-outside, bouton X
  - Communication iframe <-> parent via `postMessage`
  - Auto-binding sur attributs `data-*`
  - API publique `window.MyWidget.open() / close()`

- **state-connector.js** — Integration no-code (Webflow, etc.)
  - Binding DOM via `data-mywidget="..."` attributes
  - Persistence localStorage
  - Login/logout cross-domain via hidden iframe

- **vercel-headers.json** — Headers CORS + CSP pour deploiement Vercel

## Usage sur le site hote

```html
<!-- Charger le widget -->
<script src="https://your-app.com/widget-loader.js"></script>

<!-- Boutons declencheurs -->
<button data-mywidget-open="feature-a">Open Feature A</button>
<button data-mywidget-open="feature-b">Open Feature B</button>

<!-- API JS -->
<script>
  window.MyWidget.open('feature-a');
  window.MyWidget.close();

  window.addEventListener('mywidget:success', (e) => {
    console.log('Success!', e.detail);
  });
</script>
```

## Customisation

1. Remplacer `MyWidget` / `mywidget` par ton nom de projet
2. Configurer `WIDGET_BASE_URL` et `TRUSTED_ORIGINS`
3. Definir tes `WIDGET_PATHS` (routes iframe)
4. Adapter les message types dans `handleIframeMessage`
