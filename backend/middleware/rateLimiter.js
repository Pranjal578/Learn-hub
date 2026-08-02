// ─────────────────────────────────────────────────────────────
//  Rate Limiter Middleware — LearnHub
//  All thresholds are configurable via environment variables.
//  See .env.example for the full list of variables.
// ─────────────────────────────────────────────────────────────

const rateLimit = require('express-rate-limit');

// ── helpers ──────────────────────────────────────────────────
const mins = (n) => n * 60 * 1000;

const limiterResponse = (req, res) =>
  res.status(429).json({
    success: false,
    message: 'Too many requests. Please wait before trying again.',
  });

const isDev = () => process.env.NODE_ENV === 'development' || process.env.DISABLE_RATE_LIMIT === 'true';

// ── 1. Auth limiter — login / signup / sendOTP / admin-login ─
const authLimiter = rateLimit({
  windowMs: mins(Number(process.env.RATE_LIMIT_AUTH_WINDOW_MIN) || 15),
  max: Number(process.env.RATE_LIMIT_AUTH_MAX) || 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: limiterResponse,
  skip: isDev,
});

// ── 2. OTP / send-code limiter ─────────────────────────────
const otpLimiter = rateLimit({
  windowMs: mins(Number(process.env.RATE_LIMIT_AUTH_WINDOW_MIN) || 15),
  max: Number(process.env.RATE_LIMIT_OTP_MAX) || 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: limiterResponse,
  skip: isDev,
});

// ── 3. Password-reset limiter ─────────────────────────────────
const resetLimiter = rateLimit({
  windowMs: mins(Number(process.env.RATE_LIMIT_AUTH_WINDOW_MIN) || 15),
  max: Number(process.env.RATE_LIMIT_RESET_MAX) || 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: limiterResponse,
  skip: isDev,
});

// ── 4. Public endpoint limiter ────────────────────────────────
const publicLimiter = rateLimit({
  windowMs: mins(15),
  max: Number(process.env.RATE_LIMIT_PUBLIC_MAX) || 1000,
  standardHeaders: true,
  legacyHeaders: false,
  handler: limiterResponse,
  skip: isDev,
});

// ── 5. Authenticated user limiter ────────────────────────────
const authenticatedLimiter = rateLimit({
  windowMs: mins(15),
  max: Number(process.env.RATE_LIMIT_AUTHED_MAX) || 2000,
  standardHeaders: true,
  legacyHeaders: false,
  handler: limiterResponse,
  skip: (req) => isDev() || (!req.headers.authorization && !req.cookies?.token),
});

module.exports = {
  authLimiter,
  otpLimiter,
  resetLimiter,
  publicLimiter,
  authenticatedLimiter,
};

