import type { VercelRequest, VercelResponse } from '@vercel/node';
import { guard, logServerError } from './_shared/middleware';

// ============================================================
// Secure Proxy — Forwards requests to an upstream API
// with method whitelisting and input validation
// ============================================================

const RATE_LIMIT_WINDOW_MS = 60000;
const RATE_LIMIT_MAX_REQUESTS = 100;

// Only allow safe, read-only methods through the proxy
const ALLOWED_METHODS = [
  'getData',
  'getStatus',
  'getAccount',
  'getBalance',
  'getList',
  // Add your allowed upstream methods here
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { ok } = guard(req, res, {
    method: 'POST',
    rateLimitWindow: RATE_LIMIT_WINDOW_MS,
    rateLimitMax: RATE_LIMIT_MAX_REQUESTS,
  });
  if (!ok) return;

  try {
    const apiKey = process.env.UPSTREAM_API_KEY;
    if (!apiKey) {
      logServerError('proxy', new Error('UPSTREAM_API_KEY not configured'));
      return res.status(500).json({ error: 'Service configuration error' });
    }

    const upstreamUrl = `https://api.example.com/v1?key=${apiKey}`;
    const body = req.body;

    if (!body || typeof body !== 'object') {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    // Validate the method being called
    const requests = Array.isArray(body) ? body : [body];
    for (const request of requests) {
      if (!request.method || typeof request.method !== 'string') {
        return res.status(400).json({ error: 'Missing or invalid method' });
      }
      if (!ALLOWED_METHODS.includes(request.method)) {
        return res.status(403).json({ error: `Method not allowed: ${request.method}` });
      }
    }

    const upstream = await fetch(upstreamUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const result = await upstream.json();
    return res.status(upstream.status).json(result);
  } catch (error: unknown) {
    logServerError('proxy', error);
    return res.status(500).json({ error: 'Proxy request failed' });
  }
}
