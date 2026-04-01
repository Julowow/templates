import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { guard, logServerError, isValidEmail } from './_shared/middleware';

// ============================================================
// HMAC Signature Endpoint
// Signs a URL or payload with a secret key (e.g. for payment providers)
// ============================================================

const RATE_LIMIT_WINDOW_MS = 60000;
const RATE_LIMIT_MAX_REQUESTS = 10; // Strict — sensitive endpoint

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { ok } = guard(req, res, {
    method: 'POST',
    rateLimitWindow: RATE_LIMIT_WINDOW_MS,
    rateLimitMax: RATE_LIMIT_MAX_REQUESTS,
  });
  if (!ok) return;

  try {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const { amount, email, callbackUrl } = req.body;

    // --- Input validation ---
    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount < 1 || parsedAmount > 50000) {
      return res.status(400).json({ error: 'Amount must be between $1 and $50,000' });
    }

    if (email && !isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // --- Env vars ---
    const secretKey = process.env.API_SECRET_KEY;
    if (!secretKey) {
      logServerError('sign', new Error('API_SECRET_KEY not configured'));
      return res.status(500).json({ error: 'Service configuration error' });
    }

    const apiKey = process.env.API_PUBLIC_KEY;
    if (!apiKey) {
      logServerError('sign', new Error('API_PUBLIC_KEY not configured'));
      return res.status(500).json({ error: 'Service configuration error' });
    }

    // --- Build signed URL ---
    const baseUrl = 'https://pay.example.com';
    const params = new URLSearchParams({
      apiKey,
      amount: String(parsedAmount),
      ...(email && { email }),
      ...(callbackUrl && { callbackUrl }),
    });

    const originalUrl = `${baseUrl}?${params.toString()}`;
    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(new URL(originalUrl).search)
      .digest('base64url');

    params.set('signature', signature);
    const signedUrl = `${baseUrl}?${params.toString()}`;

    return res.status(200).json({ url: signedUrl });
  } catch (error: unknown) {
    logServerError('sign', error);
    return res.status(500).json({ error: 'Failed to generate signed URL' });
  }
}
