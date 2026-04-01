import { createContext, useContext, useState, useCallback, useRef, useEffect, ReactNode } from 'react';

// ============================================================
// Secondary Wallet Provider
// Custom React context with lazy-loaded SDK
// Pattern: lazy init + authModal + connect/disconnect state
// ============================================================

interface WalletState {
  publicKey: string | null;
  connected: boolean;
  connecting: boolean;
  error: string | null;
}

interface WalletContextType extends WalletState {
  connectWallet: () => Promise<string>;
  disconnect: () => void;
}

// Configuration — customize for your chain
const ALLOWED_WALLETS = ['wallet-a', 'wallet-b', 'wallet-c'];

const WALLET_THEME = {
  'background': '#FFFFFF',
  'background-secondary': '#FAFAFA',
  'foreground-strong': '#111111',
  'foreground': '#111111',
  'foreground-secondary': 'rgba(0, 0, 0, 0.55)',
  'primary': '#111111',
  'primary-foreground': '#FFFFFF',
  'transparent': 'transparent',
  'lighter': '#FFFFFF',
  'light': '#F5F5F5',
  'light-gray': 'rgba(0, 0, 0, 0.12)',
  'gray': 'rgba(0, 0, 0, 0.4)',
  'danger': '#CC0000',
  'border': '2px solid #111111',
  'shadow': '0 20px 60px rgba(0, 0, 0, 0.15)',
  'border-radius': '16px',
  'font-family': "system-ui, sans-serif",
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function SecondaryWalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>({
    publicKey: null,
    connected: false,
    connecting: false,
    error: null,
  });
  const sdkRef = useRef<any>(null);

  // Lazy-load the SDK on mount
  useEffect(() => {
    (async () => {
      try {
        // Replace with your actual SDK imports:
        // const { WalletSDK } = await import('your-wallet-sdk');
        // const { defaultModules } = await import('your-wallet-sdk/modules');
        //
        // WalletSDK.init({
        //   modules: defaultModules({ filterBy: (m: any) => ALLOWED_WALLETS.includes(m.productId) }),
        //   theme: WALLET_THEME,
        // });
        //
        // sdkRef.current = WalletSDK;
      } catch { /* SDK load failed — will retry on connect */ }
    })();
  }, []);

  const connectWallet = useCallback(async (): Promise<string> => {
    setState(s => ({ ...s, connecting: true, error: null }));

    try {
      if (!sdkRef.current) {
        // Retry lazy-load if first attempt failed
        // const { WalletSDK } = await import('your-wallet-sdk');
        // const { defaultModules } = await import('your-wallet-sdk/modules');
        // WalletSDK.init({
        //   modules: defaultModules({ filterBy: (m: any) => ALLOWED_WALLETS.includes(m.productId) }),
        //   theme: WALLET_THEME,
        // });
        // sdkRef.current = WalletSDK;
        throw new Error('SDK not configured — replace with your actual SDK');
      }

      const { address } = await sdkRef.current.authModal();
      setState({ publicKey: address, connected: true, connecting: false, error: null });
      return address;
    } catch (err: any) {
      const message = err.message || 'Failed to connect wallet';
      setState(s => ({ ...s, connecting: false, error: message }));
      throw err;
    }
  }, []);

  const disconnect = useCallback(() => {
    setState({ publicKey: null, connected: false, connecting: false, error: null });
  }, []);

  return (
    <WalletContext.Provider value={{ ...state, connectWallet, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useSecondaryWallet() {
  const context = useContext(WalletContext);
  if (!context) throw new Error('useSecondaryWallet must be used within SecondaryWalletProvider');
  return context;
}
