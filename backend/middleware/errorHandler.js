// ─────────────────────────────────────────────────────────────
//  Global Error Handler Middleware — LearnHub
//
//  - In PRODUCTION: return a generic message. Never leak stack
//    traces, file paths, or raw database/library errors.
//  - In DEVELOPMENT: include full error detail for debugging.
//  - Always log the full error server-side.
// ─────────────────────────────────────────────────────────────

const isProd = process.env.NODE_ENV === 'production';

const errorHandler = (err, req, res, next) => {
  // Always log the full error internally
  console.error(`[ERROR] ${req.method} ${req.path}`, {
    message: err.message,
    stack: err.stack,
    ...(err.code ? { code: err.code } : {}),
  });

  // Determine HTTP status code
  const status = err.status || err.statusCode || 500;

  // Response body — never expose internals in production
  const body = {
    success: false,
    message: isProd
      ? 'An internal server error occurred. Please try again later.'
      : err.message || 'Internal server error',
    ...(isProd ? {} : { stack: err.stack }),
  };

  res.status(status).json(body);
};

module.exports = errorHandler;
