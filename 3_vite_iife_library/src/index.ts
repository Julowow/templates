import { THEME, ALLOWED_ITEMS } from "./constants";
import { BUTTON_STYLES, MODAL_OVERRIDE_STYLES } from "./styles";

// ============================================================
// Types
// ============================================================

interface LibState {
  value: string | null;
  connected: boolean;
  connecting: boolean;
}

interface LibAPI {
  connect: () => Promise<string | null>;
  disconnect: () => void;
  getState: () => string | null;
  isReady: () => boolean;
  readonly version: string;
}

// ============================================================
// State
// ============================================================

const VERSION = "1.0.0";

const state: LibState = {
  value: null,
  connected: false,
  connecting: false,
};

let sdkReady = false;
let buttonEl: HTMLButtonElement | null = null;

// ============================================================
// Helpers
// ============================================================

function truncate(str: string): string {
  return str.slice(0, 6) + "..." + str.slice(-4);
}

function dispatch(name: string, detail?: Record<string, unknown>): void {
  window.dispatchEvent(new CustomEvent(name, { detail: detail ?? null }));
}

function updateButton(): void {
  if (!buttonEl) return;

  if (state.connecting) {
    buttonEl.disabled = true;
    buttonEl.textContent = "Connecting...";
    buttonEl.classList.remove("connected");
    return;
  }

  buttonEl.disabled = false;

  if (state.connected && state.value) {
    buttonEl.textContent = truncate(state.value);
    buttonEl.classList.add("connected");
  } else {
    buttonEl.textContent = "Connect";
    buttonEl.classList.remove("connected");
  }
}

// ============================================================
// SDK Integration (lazy-loaded)
// Replace this with your actual SDK initialization
// ============================================================

function ensureSDK(): void {
  if (sdkReady) return;

  // Example: Initialize your SDK here
  // SomeSDK.init({
  //   modules: defaultModules({ filterBy: (m) => ALLOWED_ITEMS.includes(m.id) }),
  //   theme: THEME,
  // });

  sdkReady = true;
}

// ============================================================
// Connect / Disconnect
// ============================================================

async function connect(): Promise<string | null> {
  if (state.connecting) return null;

  // Toggle: if already connected, disconnect
  if (state.connected && state.value) {
    disconnect();
    return null;
  }

  state.connecting = true;
  updateButton();

  try {
    ensureSDK();
    injectModalStyles();

    // Replace with your actual connection logic
    // const { address } = await SomeSDK.authModal();
    const result = "placeholder-value"; // Replace this

    state.value = result;
    state.connected = true;
    state.connecting = false;
    updateButton();

    dispatch("mylib:connected", { value: result });
    return result;
  } catch (err: unknown) {
    state.connecting = false;
    updateButton();

    const message = err instanceof Error ? err.message : String(err);
    const isDismissal = /dismiss|cancel|closed|user cancelled/i.test(message);

    if (isDismissal) {
      dispatch("mylib:disconnected", { reason: "dismissed" });
    } else {
      dispatch("mylib:error", { error: message });
    }

    return null;
  }
}

function disconnect(): void {
  const previousValue = state.value;
  state.value = null;
  state.connected = false;
  state.connecting = false;
  updateButton();

  dispatch("mylib:disconnected", {
    value: previousValue,
    reason: "manual",
  });
}

// ============================================================
// Style Injection
// ============================================================

function injectModalStyles(): void {
  if (document.getElementById("mylib-modal-styles")) return;
  const style = document.createElement("style");
  style.id = "mylib-modal-styles";
  style.textContent = MODAL_OVERRIDE_STYLES;
  document.head.appendChild(style);
}

function injectStyles(): void {
  if (document.getElementById("mylib-styles")) return;
  const style = document.createElement("style");
  style.id = "mylib-styles";
  style.textContent = BUTTON_STYLES;
  document.head.appendChild(style);
  injectModalStyles();
}

// ============================================================
// Mount Button
// ============================================================

function mount(): void {
  const container = document.getElementById("mylib-container");
  if (!container) return;
  if (container.querySelector("#mylib-btn")) return;

  injectStyles();

  buttonEl = document.createElement("button");
  buttonEl.id = "mylib-btn";
  buttonEl.type = "button";
  buttonEl.textContent = "Connect";
  buttonEl.addEventListener("click", () => { connect(); });

  container.appendChild(buttonEl);
}

// ============================================================
// Init
// ============================================================

function init(): void {
  mount();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

// ============================================================
// Public API
// ============================================================

const api: LibAPI = {
  connect,
  disconnect,
  getState: () => state.value,
  isReady: () => state.connected,
  version: VERSION,
};

export default api;
