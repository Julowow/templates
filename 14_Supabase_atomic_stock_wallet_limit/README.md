# Block 6 — Supabase Atomic Stock + Wallet Limit

## Description

Gestion de stock atomique avec limite d'achat par wallet. Utilise des stored procedures PostgreSQL pour garantir la consistance meme sous charge concurrente.

## Contenu

- `stock-manager.js` — Helpers JS : `getWalletPurchases()`, `calculateAvailability()`, `decrementStock()`
- `schema.sql` — Stored procedures PostgreSQL a executer dans Supabase

## Setup

1. Executer `schema.sql` dans le SQL Editor de Supabase
2. Adapter les noms de tables/colonnes selon votre schema

## Usage

```js
import { getWalletPurchases, calculateAvailability, decrementStock } from "./stock-manager.js";

// 1. Verifier la disponibilite
const purchases = await getWalletPurchases(showId, wallet, "backstage");
const { canBuy, maxAllowed } = calculateAvailability(remainingStock, 2, purchases);

if (!canBuy || maxAllowed < nbPlaces) {
  return res.status(403).json({ error: "Cannot buy" });
}

// 2. Decrementer le stock (atomique)
const success = await decrementStock(showId, nbPlaces, "backstage");
if (!success) {
  return res.status(409).json({ error: "Not enough stock" });
}

// 3. Continuer avec l'insertion de l'achat...
```

## Pourquoi des stored procedures ?

Le `WHERE remaining_stock >= p_nb_places` dans l'UPDATE est **atomique** en PostgreSQL. Il empêche deux requetes concurrentes de vendre le dernier ticket en meme temps (race condition). Un simple SELECT puis UPDATE côté JS ne garantit PAS cette atomicite.

## Notes

- Adaptable a tout systeme de vente limitee : drops NFT, preventes, quotas
- Le pattern multi-tier permet de gerer plusieurs categories (VIP, standard, guestlist)
- `calculateAvailability` est une pure function, testable sans DB
