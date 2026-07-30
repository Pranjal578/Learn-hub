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

// ── 1. Auth limiter — login / signup / sendOTP / admin-login ─
//   Stricter: 10 attempts per 15 min per IP by default.
const authLimiter = rateLimit({
  windowMs: mins(Number(process.env.RATE_LIMIT_AUTH_WINDOW_MIN) || 15),
  max: Number(process.env.RATE_LIMIT_AUTH_MAX) || 10,
  standardHeaders: true,   // Return rate-limit info in RateLimit-* headers
  legacyHeaders: false,
  handler: limiterResponse,
  skipSuccessfulRequests: false,
});

// ── 2. OTP / send-code limiter — extra strict ─────────────────
//   Default: 5 OTP sends per 15 min per IP.
const otpLimiter = rateLimit({
  windowMs: mins(Number(process.env.RATE_LIMIT_AUTH_WINDOW_MIN) || 15),
  max: Number(process.env.RATE_LIMIT_OTP_MAX) || 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: limiterResponse,
});

// ── 3. Password-reset limiter ─────────────────────────────────
//   Default: 5 reset requests per 15 min per IP.
const resetLimiter = rateLimit({
  windowMs: mins(Number(process.env.RATE_LIMIT_AUTH_WINDOW_MIN) || 15),
  max: Number(process.env.RATE_LIMIT_RESET_MAX) || 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: limiterResponse,
});

// ── 4. Public endpoint limiter ────────────────────────────────
//   Default: 100 req / 15 min per IP for unauthenticated public routes.
const publicLimiter = rateLimit({
  windowMs: mins(15),
  max: Number(process.env.RATE_LIMIT_PUBLIC_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: limiterResponse,
});

// ── 5. Authenticated user limiter ────────────────────────────
//   Default: 300 req / 15 min per IP for logged-in actions.
const authenticatedLimiter = rateLimit({
  windowMs: mins(15),
  max: Number(process.env.RATE_LIMIT_AUTHED_MAX) || 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: limiterResponse,
  skip: (req) => !req.headers.authorization && !req.cookies?.token,
});

module.exports = {
  authLimiter,
  otpLimiter,
  resetLimiter,
  publicLimiter,
  authenticatedLimiter,
};
