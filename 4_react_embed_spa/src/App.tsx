import { BrowserRouter, Routes, Route } from "react-router-dom";
import Redirect from "./pages/Redirect";
import NotFound from "./pages/NotFound";
import EmbedPage from "./pages/EmbedPage";

// ============================================================
// Conditional Provider Wrapper
// Only loads heavy providers on routes that need them
// ============================================================

const WithProvider = ({ children }: { children: React.ReactNode }) => (
  // Wrap with your auth/wallet provider here
  // <SomeProvider>{children}</SomeProvider>
  <>{children}</>
);

const Minimal = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);

// ============================================================
// App Router
// ============================================================

const App = () => (
  <BrowserRouter>
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<Redirect />} />

      {/* Embed pages (loaded inside iframes) */}
      <Route path="/embed/feature-a" element={<WithProvider><EmbedPage title="Feature A" /></WithProvider>} />
      <Route path="/embed/feature-b" element={<WithProvider><EmbedPage title="Feature B" /></WithProvider>} />

      {/* Lightweight pages (no heavy providers) */}
      <Route path="/embed/minimal" element={<Minimal><EmbedPage title="Minimal" /></Minimal>} />

      {/* 404 */}
      <Route path="*" element={<Minimal><NotFound /></Minimal>} />
    </Routes>
  </BrowserRouter>
);

export default App;
