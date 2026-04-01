# Bloc 8 — Secure Embed Communication Protocol

Protocole de communication securise entre iframe embed et site parent via `postMessage`.

## Features

- Types de messages types et strictement definis
- Broadcast vers toutes les origines trusted
- Validation d'origine pour messages entrants
- Validation de hash de transaction
- Constantes centralisees (tokens, origines, limites, timing)
- Separation messages "widget" vs messages "connect"

## Structure

```
src/
  lib/
    embed.ts          # postMessage helpers + types
  config/
    constants.ts      # Origines, validation, timing
```

## Usage

### Depuis l'iframe (embed)
```tsx
import { postMessageToParent, postConnectMessageToParent } from "@/lib/embed";

// Notifier le parent d'un succes
postMessageToParent({ type: "WIDGET_SUCCESS", payload: { txid: "abc123" } });

// Notifier le parent d'une connexion wallet
postConnectMessageToParent({
  type: "LOGIN_SUCCESS",
  data: { address: "0x...", balance: 100, chain: "ethereum" }
});
```

### Depuis le parent (site hote)
```js
window.addEventListener("message", (event) => {
  if (!TRUSTED_ORIGINS.includes(event.origin)) return;

  switch (event.data.type) {
    case "WIDGET_SUCCESS":
      console.log("Success!", event.data.payload);
      break;
    case "LOGIN_SUCCESS":
      console.log("Connected:", event.data.data.address);
      break;
  }
});
```

## Patterns

- **Broadcast**: Envoie le message a toutes les origines trusted (gere les previews Vercel, sous-domaines, etc.)
- **Origin validation**: Cote reception, verifie que `event.origin` est dans la whitelist
- **Type guards**: Fonctions de validation pour les payloads (ex: `isValidTxHash()`)
- **Separation des concerns**: Messages widget (success/error) vs messages connect (login/logout/sync)
