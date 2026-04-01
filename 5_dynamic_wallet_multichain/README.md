# Bloc 5 — Wallet Connection Multi-Chain

Template de connexion wallet multi-chain avec React providers et popup pattern.

## Features

- **PrimaryWalletProvider** — Provider pour la chain principale (ex: Dynamic Labs / Solana)
- **SecondaryWalletProvider** — Provider React custom avec lazy-loading de SDK (ex: Stellar)
- **ConnectPage** — Page de selection de reseau + connection
- **WalletPopup** — Popup window pour connection wallet externe

## Architecture

```
src/
  providers/
    PrimaryWalletProvider.tsx    # SDK-based auth provider
    SecondaryWalletProvider.tsx  # Custom React context + lazy-loaded SDK
  pages/
    ConnectPage.tsx              # Network selection + wallet connect
    WalletPopup.tsx              # Opens in new window, posts back to opener
```

## Patterns cles

### Provider conditionnel
```tsx
// N'inclure le provider que sur les routes qui en ont besoin
<Route path="/embed/connect" element={
  <PrimaryWalletProvider>
    <SecondaryWalletProvider>
      <ConnectPage />
    </SecondaryWalletProvider>
  </PrimaryWalletProvider>
} />
```

### Popup window pattern
```tsx
// Parent ouvre un popup
window.open('/wallet-popup', 'wallet', 'width=400,height=600');

// Popup poste le resultat au parent
window.opener.postMessage({
  type: 'WALLET_CONNECTED',
  data: { address, chain: 'secondary' }
}, origin);
window.close();
```

### Lazy-loaded SDK
```tsx
// Le SDK lourd n'est charge qu'au moment du connect
const connectWallet = async () => {
  const { SDK } = await import('heavy-wallet-sdk');
  SDK.init({ theme, modules });
  const { address } = await SDK.authModal();
};
```

## Customisation

1. Remplacer Dynamic Labs par ton provider auth (Magic, Privy, etc.)
2. Remplacer Stellar par ta chain secondaire
3. Adapter le theme et les wallets autorises dans `SecondaryWalletProvider`
