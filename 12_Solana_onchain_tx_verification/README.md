# Block 4 — Solana On-Chain TX Verification

## Description

Vérification on-chain qu'un transfert de token SPL a bien eu lieu sur Solana. Utilise deux méthodes : parsing des instructions de transfert, puis fallback via comparaison des balances pre/post transaction.

## Contenu

- `verify-transfer.js` — Fonction `verifyTransferTransaction()` complète

## Setup

```bash
npm install @solana/web3.js
```

## Variables d'environnement

| Variable | Description |
|---|---|
| `HELIUS_API_KEY` | Clé API Helius (ou remplacer l'URL par un autre RPC provider) |

## Usage

```js
import { verifyTransferTransaction } from "./verify-transfer.js";

const result = await verifyTransferTransaction(
  "5xyz...signature",         // txSignature
  "9f52...pump",              // expectedMint (token address)
  "BURN_WALLET_ADDRESS",      // expectedDest (destination)
  "USER_WALLET_ADDRESS",      // expectedSender
  1000000,                    // expectedAmount (raw, avec decimals)
  0.01                        // tolerancePct (1%)
);

// result = { verified: true, transferredAmount, senderWallet, slot, blockTime }
```

## Comment ca marche

### Methode 1 — Parsing des instructions
Parcourt toutes les instructions (y compris inner instructions) pour trouver un `transfer` ou `transferChecked` du Token Program.

### Methode 2 — Fallback balances
Si aucune instruction explicite n'est trouvee, compare les `preTokenBalances` et `postTokenBalances` pour detecter un changement de solde sur le wallet de destination.

### Validations
- Le sender correspond au wallet attendu
- Le montant transfere est >= montant attendu (avec tolerance configurable)

## Notes

- Supporte le Token Program classique ET Token-2022
- Supporte les transactions versionnees (v0) via `maxSupportedTransactionVersion: 0`
- La tolerance par defaut est de 1% pour absorber les arrondis et frais
- Le RPC provider (Helius) peut etre remplace par Alchemy, QuickNode, etc.
