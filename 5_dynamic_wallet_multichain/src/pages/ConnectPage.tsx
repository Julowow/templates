import { useState, useEffect } from "react";

// ============================================================
// Connect Page — Network selection + wallet connection
// Runs inside an iframe, communicates with parent window
// ============================================================

const TRUSTED_PARENT_ORIGINS = [
  "https://your-app.com",
  "https://www.your-app.com",
  "https://your-app.vercel.app",
];

function postToParent(message: Record<string, unknown>): void {
  if (!window.parent) return;
  TRUSTED_PARENT_ORIGINS.forEach((origin) => {
    try { window.parent.postMessage(message, origin); } catch { }
  });
}

type Step = "select" | "primary" | "secondary";

const ConnectPage = () => {
  const [step, setStep] = useState<Step>("select");
  const [hasNotified, setHasNotified] = useState(false);

  // Check URL params for special modes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    // ?logout=1 — disconnect all providers and notify parent
    if (params.get("logout") === "1") {
      // Call your disconnect logic here
      postToParent({ type: "LOGOUT" });
      return;
    }

    // ?fresh=1 — force re-authentication
    if (params.get("fresh") === "1") {
      // Clear any cached session
    }
  }, []);

  const handlePrimaryConnect = async () => {
    setStep("primary");
    // Your primary wallet connection logic here
    // After successful connection:
    // const address = await primaryConnect();
    // postToParent({
    //   type: 'LOGIN_SUCCESS',
    //   data: { address, balance: 0, chain: 'primary' }
    // });
  };

  const handleSecondaryConnect = () => {
    // Option A: Open popup window for secondary chain
    const popup = window.open(
      "/embed/wallet-popup",
      "wallet-popup",
      "width=420,height=600,left=200,top=100"
    );

    // Listen for popup response
    const listener = (event: MessageEvent) => {
      if (event.data?.type === "WALLET_POPUP_SUCCESS" && !hasNotified) {
        setHasNotified(true);
        postToParent({
          type: "LOGIN_SUCCESS",
          data: {
            address: event.data.address,
            balance: 0,
            chain: "secondary",
          },
        });
        window.removeEventListener("message", listener);
      }
    };
    window.addEventListener("message", listener);

    // Option B: Post message to parent to handle externally
    // postToParent({ type: 'SECONDARY_CONNECT' });
  };

  const handleClose = () => {
    postToParent({ type: "CLOSE" });
  };

  if (step === "select") {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        gap: "16px",
        fontFamily: "system-ui, sans-serif",
      }}>
        <h2 style={{ fontSize: "20px", marginBottom: "8px" }}>Select Network</h2>

        <button onClick={handlePrimaryConnect} style={btnStyle}>
          Primary Chain
        </button>

        <button onClick={handleSecondaryConnect} style={btnStyle}>
          Secondary Chain
        </button>

        <button onClick={handleClose} style={{ ...btnStyle, background: "transparent", color: "#666", border: "1px solid #ddd" }}>
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      fontFamily: "system-ui, sans-serif",
    }}>
      <p>Connecting to {step} chain...</p>
    </div>
  );
};

const btnStyle: React.CSSProperties = {
  padding: "14px 28px",
  fontSize: "16px",
  borderRadius: "12px",
  border: "none",
  background: "#111",
  color: "#fff",
  cursor: "pointer",
  width: "240px",
};

export default ConnectPage;
