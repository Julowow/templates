import { createClient } from "@supabase/supabase-js";

// --- Transaction Anti-Duplicate Pattern ---
// Prevents the same transaction from being processed twice.
// Uses a unique constraint on tx_signature in the database.

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Check if a transaction signature has already been processed.
 *
 * @param {string} table        - The table to check (e.g. "purchases", "payments")
 * @param {string} txSignature  - The unique transaction identifier
 * @returns {boolean} true if already exists (duplicate)
 */
async function isDuplicateTx(table, txSignature) {
  const { data: existing } = await supabase
    .from(table)
    .select("id")
    .eq("tx_signature", txSignature)
    .single();

  return !!existing;
}

export { isDuplicateTx };

// --- Usage in a handler ---
//
// if (await isDuplicateTx("purchases", txSignature)) {
//   return res.status(409).json({ error: "This transaction has already been processed" });
// }
//
// --- Recommended: also add a UNIQUE constraint in SQL ---
//
// ALTER TABLE purchases ADD CONSTRAINT unique_tx_signature UNIQUE (tx_signature);
