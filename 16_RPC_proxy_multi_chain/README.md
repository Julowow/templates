# 16 — RPC Proxy Multi-Chain

## Description

Proxy serverless qui relaye les requetes JSON-RPC du frontend vers des providers blockchain (Helius, Alchemy, etc.), en cachant les cles API cote serveur. Supporte plusieurs chains via un header HTTP.

## Origine

Extrait de `burn-rpc-proxy/api/rpc.js`.

## Pattern

```
Frontend
  → POST /api/rpc  (header: x-rpc-target = "solana" | "ethereum" | ...)
  → Serverless function
      → Selectionne le provider via le header
      → Lit la cle API depuis les env vars
      → Forward le body JSON-RPC vers le provider
      → Retourne la reponse au frontend
```

## Variables d'environnement

| Variable | Description |
|---|---|
| `HELIUS_API_KEY` | Cle API Helius pour Solana mainnet |
| `ALCHEMY_ETH_URL` | URL complete Alchemy pour Ethereum |

## Ajouter une nouvelle chain

Ajouter une entree dans l'objet `RPC_PROVIDERS` :

```js
base: {
  name: 'Base (Alchemy)',
  envVar: 'ALCHEMY_BASE_URL',
  buildUrl: (url) => url
}
```

## Appel depuis le frontend

```js
const response = await fetch('/api/rpc', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-rpc-target': 'solana' // ou 'ethereum'
  },
  body: JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'getBalance',
    params: ['<wallet_address>']
  })
});
```

## Quand l'utiliser

- Tout projet dApp qui doit cacher ses cles RPC
- Support multi-chain depuis un seul endpoint
- Proxy pour Solana (Helius), Ethereum (Alchemy, Infura), ou toute chain compatible JSON-RPC
