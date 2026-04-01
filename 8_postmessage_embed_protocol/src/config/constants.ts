// ============================================================
// Trusted Origins — Domains allowed to embed or communicate
// ============================================================

export const TRUSTED_PARENT_ORIGINS = [
  "https://your-app.com",
  "https://www.your-app.com",
  "https://your-app.vercel.app",
] as const;

export const TRUSTED_PAYMENT_ORIGINS = [
  "https://buy.moonpay.com",
  "https://buy-sandbox.moonpay.com",
  // Add your payment provider origins
] as const;

// ============================================================
// Validation
// ============================================================

export const VALIDATION = {
  // Solana TX hash: 86-88 base58 chars
  // Ethereum TX hash: 0x + 64 hex chars
  // Customize for your chain:
  txHashRegex: /^[1-9A-HJ-NP-Za-km-z]{86,88}$|^0x[a-fA-F0-9]{64}$/,
} as const;

// ============================================================
// Payment Configuration
// ============================================================

export const PAYMENT = {
  presetAmounts: [25, 50, 100, 250] as const,
  minAmount: 5,
  maxAmount: 10000,
  estimationMultiplier: 0.95,
} as const;

// ============================================================
// Timing
// ============================================================

export const TIMING = {
  pricePollIntervalMs: 60_000,
  successDelayMs: 3_000,
  retryDelayMs: 200,
  maxRetries: 20,
} as const;

// ============================================================
// Tokens / Assets — Customize for your project
// ============================================================

export const TOKENS = {
  PRIMARY: {
    symbol: "TOKEN",
    address: "your-token-address-here",
    logoUri: "https://your-cdn.com/token-icon.png",
  },
  NATIVE: {
    symbol: "ETH", // or SOL, etc.
    address: "native",
  },
} as const;
