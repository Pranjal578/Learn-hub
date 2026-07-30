// ─────────────────────────────────────────────────────────────
//  Validation Runner Middleware — LearnHub
//  Reads express-validator results and rejects invalid requests.
//  Strict rejection: no sanitization, schema mismatch = 400.
// ─────────────────────────────────────────────────────────────

const { validationResult } = require('express-validator');

/**
 * Run after a chain of express-validator checks.
 * Responds with 400 + structured errors if validation fails.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed. Please check your input.',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

module.exports = validate;
