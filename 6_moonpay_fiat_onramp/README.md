# Bloc 6 — Fiat On-Ramp Flow

Template de flow d'achat fiat multi-etapes avec provider de paiement (MoonPay, Stripe, etc.).

## Features

- Flow multi-etapes : Connect -> Amount -> Payment -> Processing -> Success
- Validation de montants avec limites dynamiques
- Calcul d'estimation avec multiplier
- Integration iframe du provider de paiement
- Ecoute de messages de completion depuis l'iframe paiement
- Ecran de succes avec details de transaction
- Polling de prix (intervalle configurable)

## Structure

```
src/pages/
  FiatPurchase.tsx    # Flow complet multi-etapes
api/
  payment-sign.ts     # Signature HMAC de l'URL de paiement
  payment-limits.ts   # Fetch des limites (min/max) avec cache
```

## Flow

```
[Connect Wallet] -> [Select Amount] -> [Payment iframe] -> [Processing] -> [Success]
     step 1              step 2            step 3            step 4         step 5
```

## Customisation

1. Remplacer MoonPay par ton provider (Stripe, Transak, etc.)
2. Adapter les limites et montants predefinis
3. Modifier le prix et le multiplier d'estimation
4. Configurer les variables d'env pour les cles API
