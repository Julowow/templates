import { createClient } from "@supabase/supabase-js";

// --- Atomic Stock Management + Per-Wallet Limit ---
// Requires Supabase stored procedures (see SQL below)

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Check how many items a wallet has already purchased.
 *
 * @param {string} itemId  - The item ID (show, product, drop, etc.)
 * @param {string} wallet  - The wallet address
 * @param {string} tier    - Optional tier/category
 * @returns {number} Number of purchases
 */
async function getWalletPurchases(itemId, wallet, tier = "default") {
  const { data: count } = await supabase.rpc("get_wallet_purchases", {
    p_show_id: itemId,
    p_wallet: wallet,
    p_tier: tier,
  });
  return count || 0;
}

/**
 * Calculate how many items a wallet can still buy.
 *
 * @param {number} remainingStock  - Current stock remaining
 * @param {number} maxPerWallet    - Max allowed per wallet
 * @param {number} walletPurchases - Already purchased by this wallet
 * @returns {{ canBuy: boolean, maxAllowed: number }}
 */
function calculateAvailability(remainingStock, maxPerWallet, walletPurchases) {
  const canBuy = remainingStock > 0;
  const maxAllowed = Math.max(
    0,
    Math.min(maxPerWallet - walletPurchases, remainingStock)
  );
  return { canBuy, maxAllowed };
}

/**
 * Atomically decrement stock. Returns false if not enough stock.
 * This MUST be a Supabase stored procedure to be atomic.
 *
 * @param {string} itemId   - The item ID
 * @param {number} quantity - Number to decrement
 * @param {string} tier     - Optional tier
 * @returns {boolean} true if stock was successfully decremented
 */
async function decrementStock(itemId, quantity, tier = "default") {
  const { data: success } = await supabase.rpc("decrement_stock", {
    p_show_id: itemId,
    p_nb_places: quantity,
    p_tier: tier,
  });
  return !!success;
}

export { getWalletPurchases, calculateAvailability, decrementStock };
