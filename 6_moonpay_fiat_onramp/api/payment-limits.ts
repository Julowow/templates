import type { VercelRequest, VercelResponse } from '@vercel/node';

// ============================================================
// Payment Limits — Cached GET endpoint for min/max amounts
// ============================================================

const cache = new Map<string, { data: unknown; expiresAt: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

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

function getClientIP(req: VercelRequest): string {
  const realIp = req.headers['x-real-ip'];
  if (typeof realIp === 'string' && realIp.trim()) return realIp.trim();
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') return forwarded.split(',')[0]?.trim() || 'unknown';
  return 'unknown';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const clientIP = getClientIP(req);
  if (isRateLimited(clientIP, 60000, 30)) {
    return res.status(429).json({ error: 'Too many requests' });
  }

  try {
    const apiKey = process.env.PAYMENT_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Payment service configuration error' });
    }

    const currency = String(req.query.currency || 'usd').toLowerCase();
    const currencyCode = String(req.query.currencyCode || 'sol').toLowerCase();

    // Check cache
    const cacheKey = `${currencyCode}:${currency}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt) {
      res.setHeader('Cache-Control', 'public, max-age=300');
      return res.status(200).json(cached.data);
    }

    // Fetch from payment provider
    const url = `https://api.moonpay.com/v3/currencies/${currencyCode}/limits?apiKey=${apiKey}&baseCurrencyCode=${currency}`;
    const response = await fetch(url);

    if (!response.ok) {
      return res.status(502).json({ error: 'Failed to fetch limits' });
    }

    const data = await response.json();
    const result = {
      minBuyAmount: Number(data?.baseCurrency?.minBuyAmount ?? data?.minBuyAmount ?? 5),
      maxBuyAmount: Number(data?.baseCurrency?.maxBuyAmount ?? data?.maxBuyAmount ?? 10000),
      currency,
      currencyCode,
    };

    cache.set(cacheKey, { data: result, expiresAt: Date.now() + CACHE_TTL_MS });
    res.setHeader('Cache-Control', 'public, max-age=300');
    return res.status(200).json(result);
  } catch (error) {
    console.error('payment-limits error:', error);
    return res.status(500).json({ error: 'Failed to fetch limits' });
  }
}
