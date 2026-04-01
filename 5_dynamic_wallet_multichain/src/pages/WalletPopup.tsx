import { useEffect, useState } from "react";

// ============================================================
// Wallet Popup — Opens in a new window, connects wallet,
// posts result back to opener, and auto-closes
// ============================================================

type Status = "connecting" | "connected" | "error" | "closing";

const WalletPopup = () => {
  const [status, setStatus] = useState<Status>("connecting");

  useEffect(() => {
    connectWallet();
  }, []);

  const connectWallet = async () => {
    try {
      // Replace with your actual wallet connection logic:
      // const { WalletSDK } = await import('your-wallet-sdk');
      // const { address } = await WalletSDK.authModal();

      const address = "placeholder"; // Replace this

      setStatus("connected");

      // Post result back to opener window
      if (window.opener) {
        window.opener.postMessage(
          { type: "WALLET_POPUP_SUCCESS", address },
          "*" // In production, use specific origin
        );
      }

      // Auto-close after brief delay
      setTimeout(() => {
        setStatus("closing");
        setTimeout(() => window.close(), 400);
      }, 600);
    } catch (err) {
      setStatus("error");

      // Notify opener of dismissal/error
      if (window.opener) {
        const message = err instanceof Error ? err.message : "Unknown error";
        const isDismissal = /dismiss|cancel|closed/i.test(message);

        window.opener.postMessage(
          {
            type: isDismissal ? "WALLET_POPUP_DISMISSED" : "WALLET_POPUP_ERROR",
            error: message,
          },
          "*"
        );
      }

      // Auto-close on error
      setTimeout(() => window.close(), 400);
    }
  };

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      fontFamily: "system-ui, sans-serif",
      background: "#fafafa",
    }}>
      <div style={{ textAlign: "center" }}>
        {status === "connecting" && <p>Connecting wallet...</p>}
        {status === "connected" && <p style={{ color: "green" }}>Connected! Closing...</p>}
        {status === "error" && <p style={{ color: "#666" }}>Closing...</p>}
        {status === "closing" && <p style={{ color: "#666" }}>Closing...</p>}
      </div>
    </div>
  );
};

export default WalletPopup;
