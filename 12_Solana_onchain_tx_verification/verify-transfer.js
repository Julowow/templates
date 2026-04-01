import { Connection } from "@solana/web3.js";

// --- Solana On-Chain Transfer Verification ---
// Requires: npm install @solana/web3.js
// Env vars: HELIUS_API_KEY (or any Solana RPC provider)

const connection = new Connection(
  `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`,
  "confirmed"
);

const TOKEN_PROGRAM_ID = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
const TOKEN_2022_PROGRAM_ID = "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb";

/**
 * Verify an SPL token transfer on-chain.
 *
 * @param {string} txSignature   - The transaction signature to verify
 * @param {string} expectedMint  - The SPL token mint address
 * @param {string} expectedDest  - The expected destination wallet
 * @param {string} expectedSender - The expected sender wallet
 * @param {number} expectedAmount - The expected raw amount (with decimals)
 * @param {number} tolerancePct  - Tolerance percentage (default 1%)
 * @returns {object} { verified, transferredAmount, senderWallet, slot, blockTime }
 */
async function verifyTransferTransaction(
  txSignature,
  expectedMint,
  expectedDest,
  expectedSender,
  expectedAmount,
  tolerancePct = 0.01
) {
  const tx = await connection.getParsedTransaction(txSignature, {
    maxSupportedTransactionVersion: 0,
    commitment: "confirmed",
  });

  if (!tx) throw new Error("Transaction not found. It may still be processing.");
  if (tx.meta?.err) throw new Error("Transaction failed on-chain");

  // --- Method 1: Parse transfer instructions ---
  const instructions = tx.transaction.message.instructions;
  const innerInstructions = tx.meta?.innerInstructions || [];
  const allInstructions = [
    ...instructions,
    ...innerInstructions.flatMap((ix) => ix.instructions),
  ];

  let transferFound = false;
  let transferredAmount = 0;
  let senderWallet = null;

  for (const ix of allInstructions) {
    const programId = ix.programId?.toString();
    if (programId !== TOKEN_PROGRAM_ID && programId !== TOKEN_2022_PROGRAM_ID) continue;

    const parsed = ix.parsed;
    if (!parsed) continue;

    if (parsed.type === "transfer" || parsed.type === "transferChecked") {
      const info = parsed.info;

      // For transferChecked, verify mint
      if (parsed.type === "transferChecked" && info.mint !== expectedMint) continue;

      senderWallet = info.authority;
      transferredAmount = parseInt(info.amount);
      transferFound = true;
      break;
    }
  }

  // --- Method 2 (fallback): Compare pre/post token balances ---
  if (!transferFound) {
    const postBalances = tx.meta?.postTokenBalances || [];
    const preBalances = tx.meta?.preTokenBalances || [];

    for (const post of postBalances) {
      if (post.mint !== expectedMint) continue;
      if (post.owner !== expectedDest) continue;

      const pre = preBalances.find(
        (p) => p.accountIndex === post.accountIndex && p.mint === expectedMint
      );

      const preAmount = pre ? parseInt(pre.uiTokenAmount.amount) : 0;
      const postAmount = parseInt(post.uiTokenAmount.amount);
      const diff = postAmount - preAmount;

      if (diff > 0) {
        transferredAmount = diff;
        transferFound = true;
        break;
      }
    }

    if (transferFound && !senderWallet) {
      senderWallet = tx.transaction.message.accountKeys
        .find((k) => k.signer)?.pubkey?.toString();
    }
  }

  // --- Validations ---
  if (!transferFound) {
    throw new Error("No matching token transfer found in this transaction");
  }

  if (expectedSender && senderWallet && senderWallet !== expectedSender) {
    throw new Error("Transfer was not sent by the expected wallet");
  }

  const tolerance = expectedAmount * tolerancePct;
  if (transferredAmount < expectedAmount - tolerance) {
    throw new Error(
      `Transferred amount (${transferredAmount}) is less than expected (${expectedAmount})`
    );
  }

  return {
    verified: true,
    transferredAmount,
    senderWallet,
    slot: tx.slot,
    blockTime: tx.blockTime,
  };
}

export { verifyTransferTransaction, connection };
