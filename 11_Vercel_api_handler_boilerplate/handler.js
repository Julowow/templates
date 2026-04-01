// --- Vercel API Handler Boilerplate ---
// Handles: OPTIONS preflight, method check, try/catch, JSON responses

export default async function handler(req, res) {
  // CORS preflight
  if (req.method === "OPTIONS") return res.status(204).end();

  // Method guard — change to "POST" if needed
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // --- Extract params ---
    // GET:  const { param1, param2 } = req.query;
    // POST: const { param1, param2 } = req.body;
    const { param1, param2 } = req.query;

    // --- Validate ---
    if (!param1) {
      return res.status(400).json({ error: "param1 is required" });
    }

    // --- Business logic here ---
    const result = { param1, param2 };

    // --- Success ---
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error("Handler error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
