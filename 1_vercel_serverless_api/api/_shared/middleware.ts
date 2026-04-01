import type { VercelRequest, VercelResponse } from '@vercel/node';

// ============================================================
// CONFIGURATION — Customize these for your project
// ============================================================

const APP_NAME = 'your-app';

const ALLOWED_ORIGINS = [
  'https://your-app.com',
  'https://www.your-app.com',
  'https://your-app.vercel.app',
];

const DEV_ORIGINS = [
  'http://localhost:8080',
  'http://localhost:5173',
  'http://127.0.0.1:8080',
  'http://127.0.0.1:5173',
];

const CLIENT_HEADER_NAME = `x-${APP_NAME}-client`;
const CLIENT_HEADER_VALUE = `${APP_NAME}-web/1`;

// ============================================================
// CORS
// ============================================================

export function setCorsHeaders(req: VercelRequest, res: VercelResponse, methods = 'POST, OPTIONS'): boolean {
  const origin = req.headers.origin;
  if (!origin) return true;

  const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';
  const allowedList = isProduction ? ALLOWED_ORIGINS : [...ALLOWED_ORIGINS, ...DEV_ORIGINS];

  if (!allowedList.includes(origin)) return false;

  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', methods);
  res.setHeader('Access-Control-Allow-Headers', `Content-Type, ${CLIENT_HEADER_NAME}`);
  return true;
}

// ============================================================
// Client Header Validation
// ============================================================

export function hasValidClientHeader(req: VercelRequest): boolean {
  return req.headers[CLIENT_HEADER_NAME] === CLIENT_HEADER_VALUE;
}

// ============================================================
// IP Extraction
// ============================================================

export function getClientIP(req: VercelRequest): string {
  const realIp = req.headers['x-real-ip'];
  if (typeof realIp === 'string' && realIp.trim()) return realIp.trim();
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    const firstIp = forwarded.split(',')[0]?.trim();
    if (firstIp) return firstIp;
  }
  return 'unknown';
}

// ============================================================
// Rate Limiting (in-memory, per-IP)
// ============================================================

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function isRateLimited(clientIP: string, windowMs: number, maxRequests: number): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(clientIP);

  // Probabilistic cleanup (1% chance per request)
  if (Math.random() < 0.01) {
    for (const [k, v] of rateLimitMap.entries()) {
      if (now > v.resetTime) rateLimitMap.delete(k);
    }
  }

  if (!record || now > record.resetTime) {
    rateLimitMap.set(clientIP, { count: 1, resetTime: now + windowMs });
    return false;
  }
  if (record.count >= maxRequests) return true;
  record.count++;
  return false;
}

// ============================================================
// Structured Error Logging
// ============================================================

export function logServerError(context: string, error: unknown): void {
  const timestamp = new Date().toISOString();
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;
  console.error(JSON.stringify({ timestamp, context, error: errorMessage, stack: errorStack }));
}

// ============================================================
// Input Validation Helpers
// ============================================================

export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string' || email.length > 254) return false;
  return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/.test(email);
}

// ============================================================
// Guard — Standard request validation pipeline
// ============================================================

interface GuardOptions {
  method?: 'GET' | 'POST';
  rateLimitWindow?: number;
  rateLimitMax?: number;
}

export function guard(
  req: VercelRequest,
  res: VercelResponse,
  options: GuardOptions = {}
): { ok: boolean; clientIP: string } {
  const { method = 'POST', rateLimitWindow = 60000, rateLimitMax = 100 } = options;
  const allowedMethods = method === 'GET' ? 'GET, OPTIONS' : 'POST, OPTIONS';

  const corsOk = setCorsHeaders(req, res, allowedMethods);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return { ok: false, clientIP: '' };
  }
  if (!corsOk) {
    res.status(403).json({ error: 'Origin not allowed' });
    return { ok: false, clientIP: '' };
  }
  if (req.method !== method) {
    res.status(405).json({ error: 'Method not allowed' });
    return { ok: false, clientIP: '' };
  }
  if (!hasValidClientHeader(req)) {
    res.status(403).json({ error: 'Missing or invalid client identifier' });
    return { ok: false, clientIP: '' };
  }

  const clientIP = getClientIP(req);
  if (isRateLimited(clientIP, rateLimitWindow, rateLimitMax)) {
    res.status(429).json({ error: 'Too many requests. Please try again later.' });
    return { ok: false, clientIP };
  }

  return { ok: true, clientIP };
}
