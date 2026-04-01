# Templates — Reusable Building Blocks

Blocs reutilisables extraits du projet BuyNRG v3. Chaque bloc est generique, de-brande, et pret a etre copie dans un nouveau projet.

## Blocs disponibles

| # | Template | Description | Reutilisabilite |
|---|----------|-------------|-----------------|
| 1 | [1_vercel_serverless_api](./1_vercel_serverless_api/) | API serverless Vercel avec rate limiting, CORS, proxy, HMAC | Tres haute |
| 2 | [2_iframe_widget_loader](./2_iframe_widget_loader/) | Widget iframe embeddable + no-code state connector | Tres haute |
| 3 | [3_vite_iife_library](./3_vite_iife_library/) | Lib JS autonome compilee en IIFE via Vite | Haute |
| 4 | [4_react_embed_spa](./4_react_embed_spa/) | Micro-app React pour iframe avec routing | Haute |
| 5 | [5_dynamic_wallet_multichain](./5_dynamic_wallet_multichain/) | Wallet connect multi-chain (Dynamic Labs + popup) | Moyenne |
| 6 | [6_moonpay_fiat_onramp](./6_moonpay_fiat_onramp/) | Flow d'achat fiat multi-etapes via MoonPay | Moyenne |
| 7 | [7_shadcn_tailwind_foundation](./7_shadcn_tailwind_foundation/) | Base UI : shadcn/ui + Tailwind + Toast + Logger | Tres haute |
| 8 | [8_postmessage_embed_protocol](./8_postmessage_embed_protocol/) | Protocole de communication iframe via postMessage | Haute |

## Comment utiliser

1. Copier le dossier du template dans ton nouveau projet
2. Lire le README du template pour les instructions specifiques
3. Remplacer les placeholders (`your-app`, `MyWidget`, etc.)
4. Adapter les constantes (origines, tokens, theme)

## Combinaisons courantes

- **Widget SaaS** : 1 + 2 + 4 + 7 + 8
- **dApp Web3** : 1 + 4 + 5 + 7 + 8
- **dApp avec fiat** : 1 + 4 + 5 + 6 + 7 + 8
- **Lib JS distribuable** : 3 seul
- **API backend** : 1 seul

## Origine

Extraits de [buynrg-v3](https://github.com/julowow/buynrg-v3) — plateforme d'achat de tokens NRG via fiat et crypto swap.
