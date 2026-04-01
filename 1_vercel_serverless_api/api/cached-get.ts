import type { VercelRequest, VercelResponse } from '@vercel/node';
import { guard, logServerError } from './_shared/middleware';

// ============================================================
// Cached GET Endpoint
// Fetches data from an upstream API with in-memory TTL cache
// ============================================================

const RATE_LIMIT_WINDOW_MS = 60000;
const RATE_LIMIT_MAX_REQUESTS = 30;

const cache = new Map<string, { data: unknown; expiresAt: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

const ALLOWED_CATEGORIES = ['basic', 'premium', 'enterprise'];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { ok } = guard(req, res, {
    method: 'GET',
    rateLimitWindow: RATE_LIMIT_WINDOW_MS,
    rateLimitMax: RATE_LIMIT_MAX_REQUESTS,
  });
  if (!ok) return;

  try {
    const apiKey = process.env.UPSTREAM_API_KEY;
    if (!apiKey) {
      logServerError('cached-get', new Error('UPSTREAM_API_KEY not configured'));
      return res.status(500).json({ error: 'Service configuration error' });
    }

    // --- Validate query params ---
    const category = String(req.query.category || 'basic').toLowerCase();
    if (!ALLOWED_CATEGORIES.includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    // --- Check cache ---
    const cacheKey = `category:${category}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt) {
      res.setHeader('Cache-Control', 'public, max-age=300');
      return res.status(200).json(cached.data);
    }

    // --- Fetch upstream ---
    const url = `https://api.example.com/v1/data?apiKey=${apiKey}&category=${category}`;
    const response = await fetch(url);

    if (!response.ok) {
      logServerError('cached-get', new Error(`Upstream API returned ${response.status}`));
      return res.status(502).json({ error: 'Failed to fetch from upstream' });
    }

    const data = await response.json();

    // --- Normalize response (adapt to your upstream API shape) ---
    const result = {
      items: data?.items ?? data?.results ?? [],
      total: data?.total ?? data?.count ?? 0,
      category,
    };

    // --- Store in cache ---
    cache.set(cacheKey, { data: result, expiresAt: Date.now() + CACHE_TTL_MS });

    res.setHeader('Cache-Control', 'public, max-age=300');
    return res.status(200).json(result);
  } catch (error: unknown) {
    logServerError('cached-get', error);
    return res.status(500).json({ error: 'Failed to fetch data' });
  }
}
