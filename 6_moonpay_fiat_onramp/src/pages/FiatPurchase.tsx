import { useState, useEffect, useCallback } from "react";

// ============================================================
// Fiat Purchase — Multi-step flow for fiat-to-crypto purchase
// ============================================================

// --- Configuration ---
const PRESET_AMOUNTS = [25, 50, 100, 250] as const;
const MIN_AMOUNT = 5;
const MAX_AMOUNT = 10000;
const ESTIMATION_MULTIPLIER = 0.95; // Account for fees
const PRICE_POLL_INTERVAL_MS = 60_000;

const TRUSTED_PARENT_ORIGINS = [
  "https://your-app.com",
  "https://www.your-app.com",
  "https://your-app.vercel.app",
];

const TRUSTED_PAYMENT_ORIGINS = [
  "https://buy.moonpay.com",
  "https://buy-sandbox.moonpay.com",
  // Add your payment provider origins
];

type Step = "connect" | "amount" | "payment" | "processing" | "success";

interface PurchaseLimits {
  minBuyAmount: number;
  maxBuyAmount: number;
}

function postToParent(message: Record<string, unknown>): void {
  if (!window.parent) return;
  TRUSTED_PARENT_ORIGINS.forEach((origin) => {
    try { window.parent.postMessage(message, origin); } catch { }
  });
}

const FiatPurchase = () => {
  const [step, setStep] = useState<Step>("connect");
  const [selectedAmount, setSelectedAmount] = useState<number>(PRESET_AMOUNTS[1]);
  const [customAmount, setCustomAmount] = useState("");
  const [tokenPrice, setTokenPrice] = useState<number | null>(null);
  const [limits, setLimits] = useState<PurchaseLimits | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  // --- Fetch price (with polling) ---
  const fetchPrice = useCallback(async () => {
    try {
      // Replace with your actual price fetch
      const response = await fetch("https://api.example.com/price");
      const data = await response.json();
      setTokenPrice(data.priceUsd);
    } catch { /* ignore */ }
  }, []);

  // --- Fetch payment limits ---
  const fetchLimits = useCallback(async () => {
    try {
      const response = await fetch("/api/payment-limits?currency=usd", {
        headers: { "X-App-Client": "web/1" },
      });
      const data = await response.json();
      setLimits({ minBuyAmount: data.minBuyAmount, maxBuyAmount: data.maxBuyAmount });
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (step === "amount") {
      fetchPrice();
      fetchLimits();
      const interval = setInterval(fetchPrice, PRICE_POLL_INTERVAL_MS);
      return () => clearInterval(interval);
    }
  }, [step, fetchPrice, fetchLimits]);

  // --- Listen for payment completion messages ---
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!TRUSTED_PAYMENT_ORIGINS.includes(event.origin)) return;

      const data = event.data;
      if (data?.type === "payment_complete" || data?.status === "completed") {
        setTxHash(data.transactionId || data.txHash || null);
        setStep("processing");

        // Brief processing delay then show success
        setTimeout(() => setStep("success"), 2000);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // --- Get signed payment URL ---
  const startPayment = async () => {
    try {
      const response = await fetch("/api/payment-sign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-App-Client": "web/1",
        },
        body: JSON.stringify({
          amount: selectedAmount,
          walletAddress,
          currency: "usd",
        }),
      });
      const data = await response.json();
      if (data.url) {
        setPaymentUrl(data.url);
        setStep("payment");
      }
    } catch { /* handle error */ }
  };

  // --- Amount validation ---
  const effectiveMin = limits?.minBuyAmount ?? MIN_AMOUNT;
  const effectiveMax = limits?.maxBuyAmount ?? MAX_AMOUNT;
  const amount = customAmount ? Number(customAmount) : selectedAmount;
  const isAmountValid = amount >= effectiveMin && amount <= effectiveMax;
  const estimatedTokens = tokenPrice ? (amount / tokenPrice) * ESTIMATION_MULTIPLIER : null;

  // ============================================================
  // RENDER
  // ============================================================

  // Step 1: Connect wallet
  if (step === "connect") {
    return (
      <div style={containerStyle}>
        <h2>Connect your wallet</h2>
        <button
          style={btnStyle}
          onClick={() => {
            // Replace with actual wallet connection
            setWalletAddress("mock-address");
            setStep("amount");
          }}
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  // Step 2: Select amount
  if (step === "amount") {
    return (
      <div style={containerStyle}>
        <h2>Select Amount</h2>

        <div style={{ display: "flex", gap: "8px", margin: "16px 0" }}>
          {PRESET_AMOUNTS.map((amt) => (
            <button
              key={amt}
              onClick={() => { setSelectedAmount(amt); setCustomAmount(""); }}
              style={{
                ...presetBtnStyle,
                background: selectedAmount === amt && !customAmount ? "#111" : "#f0f0f0",
                color: selectedAmount === amt && !customAmount ? "#fff" : "#111",
              }}
            >
              ${amt}
            </button>
          ))}
        </div>

        <input
          type="number"
          placeholder="Custom amount"
          value={customAmount}
          onChange={(e) => setCustomAmount(e.target.value)}
          style={inputStyle}
        />

        {!isAmountValid && amount > 0 && (
          <p style={{ color: "red", fontSize: "14px" }}>
            Amount must be between ${effectiveMin} and ${effectiveMax}
          </p>
        )}

        {estimatedTokens !== null && (
          <p style={{ color: "#666", fontSize: "14px", margin: "8px 0" }}>
            Estimated: ~{estimatedTokens.toFixed(2)} tokens
          </p>
        )}

        <button
          style={{ ...btnStyle, opacity: isAmountValid ? 1 : 0.5 }}
          disabled={!isAmountValid}
          onClick={startPayment}
        >
          Continue — ${amount}
        </button>
      </div>
    );
  }

  // Step 3: Payment iframe
  if (step === "payment" && paymentUrl) {
    return (
      <div style={{ width: "100%", height: "100vh" }}>
        <iframe
          src={paymentUrl}
          style={{ width: "100%", height: "100%", border: "none" }}
          allow="payment; camera"
        />
      </div>
    );
  }

  // Step 4: Processing
  if (step === "processing") {
    return (
      <div style={containerStyle}>
        <h2>Processing...</h2>
        <p style={{ color: "#666" }}>Your purchase is being confirmed.</p>
      </div>
    );
  }

  // Step 5: Success
  if (step === "success") {
    postToParent({ type: "FIAT_SUCCESS", txHash });

    return (
      <div style={containerStyle}>
        <h2 style={{ color: "green" }}>Purchase Complete!</h2>
        {txHash && (
          <p style={{ fontSize: "14px", color: "#666", wordBreak: "break-all" }}>
            TX: {txHash}
          </p>
        )}
        <button style={btnStyle} onClick={() => setStep("amount")}>
          Buy More
        </button>
      </div>
    );
  }

  return null;
};

// --- Styles ---
const containerStyle: React.CSSProperties = {
  display: "flex", flexDirection: "column", alignItems: "center",
  justifyContent: "center", height: "100vh", gap: "12px",
  fontFamily: "system-ui, sans-serif", padding: "24px",
};

const btnStyle: React.CSSProperties = {
  padding: "14px 28px", fontSize: "16px", borderRadius: "12px",
  border: "none", background: "#111", color: "#fff", cursor: "pointer", width: "100%", maxWidth: "320px",
};

const presetBtnStyle: React.CSSProperties = {
  padding: "10px 16px", fontSize: "14px", borderRadius: "8px",
  border: "none", cursor: "pointer",
};

const inputStyle: React.CSSProperties = {
  padding: "12px 16px", fontSize: "16px", borderRadius: "8px",
  border: "1px solid #ddd", width: "100%", maxWidth: "320px", textAlign: "center",
};

export default FiatPurchase;
