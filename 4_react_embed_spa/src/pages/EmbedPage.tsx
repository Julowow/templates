import { useEffect, useState } from "react";

// ============================================================
// Example embed page that communicates with parent window
// ============================================================

const TRUSTED_PARENT_ORIGINS = [
  "https://your-app.com",
  "https://www.your-app.com",
  "https://your-app.vercel.app",
];

function postMessageToParent(message: Record<string, unknown>): void {
  if (typeof window === "undefined" || !window.parent) return;
  TRUSTED_PARENT_ORIGINS.forEach((origin) => {
    try {
      window.parent.postMessage(message, origin);
    } catch { /* ignore */ }
  });
}

interface EmbedPageProps {
  title: string;
}

const EmbedPage = ({ title }: EmbedPageProps) => {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  useEffect(() => {
    // Notify parent that embed is loaded
    postMessageToParent({ type: "EMBED_READY", page: title });
  }, [title]);

  const handleAction = async () => {
    setStatus("loading");
    try {
      // Your action logic here
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setStatus("success");
      postMessageToParent({ type: "WIDGET_SUCCESS", payload: { page: title } });
    } catch (err) {
      setStatus("error");
      postMessageToParent({
        type: "WIDGET_ERROR",
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      fontFamily: "system-ui, sans-serif",
      padding: "24px",
    }}>
      <h1 style={{ fontSize: "24px", marginBottom: "16px" }}>{title}</h1>
      <p style={{ color: "#666", marginBottom: "24px" }}>
        This page runs inside an iframe and communicates with the parent window.
      </p>
      <button
        onClick={handleAction}
        disabled={status === "loading"}
        style={{
          padding: "12px 24px",
          fontSize: "16px",
          borderRadius: "8px",
          border: "none",
          background: "#111",
          color: "#fff",
          cursor: status === "loading" ? "not-allowed" : "pointer",
          opacity: status === "loading" ? 0.6 : 1,
        }}
      >
        {status === "loading" ? "Processing..." : "Do Action"}
      </button>
      {status === "success" && <p style={{ color: "green", marginTop: "12px" }}>Success!</p>}
      {status === "error" && <p style={{ color: "red", marginTop: "12px" }}>Error occurred</p>}
    </div>
  );
};

export default EmbedPage;
