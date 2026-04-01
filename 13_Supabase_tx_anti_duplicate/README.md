# Block 5 — Supabase TX Anti-Duplicate

## Description

Pattern anti-doublon pour empecher qu'une meme transaction (ou identifiant unique) soit traitee deux fois. Essentiel pour tout systeme de paiement.

## Contenu

- `anti-duplicate.js` — Helper `isDuplicateTx()` + exemple d'usage

## Usage

```js
import { isDuplicateTx } from "./anti-duplicate.js";

// Dans un handler
if (await isDuplicateTx("purchases", txSignature)) {
  return res.status(409).json({ error: "Transaction already processed" });
}

// ... continuer le traitement
```

## SQL recommande

Ajouter une contrainte UNIQUE dans Supabase (SQL Editor) :

```sql
ALTER TABLE purchases ADD CONSTRAINT unique_tx_signature UNIQUE (tx_signature);
```

Cela garantit l'unicite meme en cas de requetes concurrentes (race condition).

## Notes

- Le code HTTP 409 (Conflict) est le standard pour signaler un doublon
- La verification applicative (`isDuplicateTx`) + contrainte SQL forment une double protection
- Adaptable a tout identifiant unique : tx hash, order ID, idempotency key, etc.
