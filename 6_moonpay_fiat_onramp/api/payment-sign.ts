import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

// ============================================================
// Payment URL Signing — HMAC-SHA256 signature for payment provider
// Adapted from bloc-1 middleware pattern
// ============================================================

// Inline minimal middleware (or import from bloc-1 shared)
function getClientIP(req: VercelRequest): string {
  const realIp = req.headers['x-real-ip'];
  if (typeof realIp === 'string' && realIp.trim()) return realIp.trim();
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') return forwarded.split(',')[0]?.trim() || 'unknown';
  return 'unknown';
}

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
function isRateLimited(ip: string, windowMs: number, max: number): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  if (Math.random() < 0.01) {
    for (const [k, v] of rateLimitMap.entries()) { if (now > v.resetTime) rateLimitMap.delete(k); }
  }
  if (!record || now > record.resetTime) { rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs }); return false; }
  if (record.count >= max) return true;
  record.count++;
  return false;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const clientIP = getClientIP(req);
  if (isRateLimited(clientIP, 60000, 10)) {
    return res.status(429).json({ error: 'Too many requests' });
  }

  try {
    const { amount, walletAddress, email, currency } = req.body || {};

    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount < 1 || parsedAmount > 50000) {
      return res.status(400).json({ error: 'Amount must be between $1 and $50,000' });
    }

    const secretKey = process.env.PAYMENT_SECRET_KEY;
    const apiKey = process.env.PAYMENT_API_KEY;
    const destinationWallet = process.env.PAYMENT_DESTINATION_WALLET;

    if (!secretKey || !apiKey || !destinationWallet) {
      console.error('Payment env vars not configured');
      return res.status(500).json({ error: 'Payment service configuration error' });
    }

    // Build payment URL
    const isSandbox = apiKey.startsWith('pk_test_');
    const baseUrl = isSandbox ? 'https://buy-sandbox.moonpay.com' : 'https://buy.moonpay.com';

    const params = new URLSearchParams({
      apiKey,
      currencyCode: currency || 'sol',
      walletAddress: destinationWallet,
      baseCurrencyCode: 'usd',
      baseCurrencyAmount: String(parsedAmount),
      showWalletAddressForm: 'false',
    });

    if (walletAddress) params.set('externalCustomerId', walletAddress);
    if (email) params.set('email', email);

    // HMAC-SHA256 sign the query string
    const originalUrl = `${baseUrl}?${params.toString()}`;
    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(new URL(originalUrl).search)
      .digest('base64url');

    params.set('signature', signature);
    const signedUrl = `${baseUrl}?${params.toString()}`;

    return res.status(200).json({ url: signedUrl });
  } catch (error) {
    console.error('payment-sign error:', error);
    return res.status(500).json({ error: 'Failed to generate payment URL' });
  }
}
