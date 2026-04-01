import { TRUSTED_PARENT_ORIGINS, TRUSTED_PAYMENT_ORIGINS, VALIDATION } from "@/config/constants";

// ============================================================
// Widget Messages (feature actions: success, error, close)
// ============================================================

export type WidgetMessageType =
  | "WIDGET_SUCCESS"
  | "WIDGET_ERROR"
  | "WIDGET_CLOSE";

export interface WidgetMessage {
  type: WidgetMessageType;
  payload?: Record<string, unknown>;
  error?: string;
}

export function postMessageToParent(message: WidgetMessage): void {
  if (typeof window === "undefined" || !window.parent) return;

  TRUSTED_PARENT_ORIGINS.forEach((origin) => {
    try {
      window.parent.postMessage(message, origin);
    } catch { }
  });
}

// ============================================================
// Connect Messages (auth actions: login, logout, sync, close)
// ============================================================

export type ConnectMessageType =
  | "LOGIN_SUCCESS"
  | "LOGOUT"
  | "CLOSE"
  | "WALLET_SYNC"
  | "EXTERNAL_CONNECT";

export interface ConnectMessage {
  type: ConnectMessageType;
  data?: {
    address: string;
    balance: number;
    chain: string;
  };
}

export function postConnectMessageToParent(message: ConnectMessage): void {
  if (typeof window === "undefined" || !window.parent) return;

  TRUSTED_PARENT_ORIGINS.forEach((origin) => {
    try {
      window.parent.postMessage(message, origin);
    } catch { }
  });
}

// ============================================================
// Origin Validation
// ============================================================

export function isTrustedPaymentOrigin(origin: string): boolean {
  return TRUSTED_PAYMENT_ORIGINS.includes(origin);
}

export function isTrustedParentOrigin(origin: string): boolean {
  return TRUSTED_PARENT_ORIGINS.includes(origin);
}

// ============================================================
// Payload Validation
// ============================================================

export function isValidTxHash(txHash: unknown): txHash is string {
  return (
    typeof txHash === "string" &&
    VALIDATION.txHashRegex.test(txHash)
  );
}
