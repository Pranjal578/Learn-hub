// ─────────────────────────────────────────────────────────────
//  Auth Input Validators — LearnHub
//  Strict schema validation using express-validator.
//  All rules enforce type, length, and format — no silent
//  sanitization; non-conforming input is rejected outright.
// ─────────────────────────────────────────────────────────────

const { body } = require('express-validator');

// ── Reusable field rules ──────────────────────────────────────

/** Strong password: 8–128 chars, upper, lower, digit, special */
const strongPassword = (field = 'password') =>
  body(field)
    .isString().withMessage(`${field} must be a string`)
    .isLength({ min: 8, max: 128 }).withMessage(`${field} must be 8–128 characters`)
    .matches(/[A-Z]/).withMessage(`${field} must contain at least one uppercase letter`)
    .matches(/[a-z]/).withMessage(`${field} must contain at least one lowercase letter`)
    .matches(/[0-9]/).withMessage(`${field} must contain at least one digit`)
    .matches(/[^A-Za-z0-9]/).withMessage(`${field} must contain at least one special character`);

/** Basic name field: 1–50 chars, letters / spaces / hyphens only */
const nameField = (field) =>
  body(field)
    .isString().withMessage(`${field} must be a string`)
    .trim()
    .isLength({ min: 1, max: 50 }).withMessage(`${field} must be 1–50 characters`)
    .matches(/^[A-Za-z\s'-]+$/).withMessage(`${field} may only contain letters, spaces, hyphens, and apostrophes`);

/** Email field */
const emailField = (field = 'email') =>
  body(field)
    .isEmail().withMessage('A valid email address is required')
    .isLength({ max: 254 }).withMessage('Email must not exceed 254 characters')
    .normalizeEmail();

// ── Signup ────────────────────────────────────────────────────
const signupValidators = [
  nameField('firstName'),
  nameField('lastName'),
  emailField(),
  strongPassword('password'),
  strongPassword('confirmPassword'),
  body('accountType')
    .isIn(['Student', 'Instructor'])
    .withMessage('accountType must be Student or Instructor'),
  body('contactNumber')
    .optional({ nullable: true, checkFalsy: true })
    .isMobilePhone().withMessage('contactNumber must be a valid phone number'),
];

// ── Login ─────────────────────────────────────────────────────
const loginValidators = [
  emailField(),
  body('password')
    .isString().withMessage('password must be a string')
    .isLength({ min: 1, max: 128 }).withMessage('password must not be empty or exceed 128 characters'),
];

// ── Admin Login ───────────────────────────────────────────────
const adminLoginValidators = loginValidators;

// ── Send OTP ──────────────────────────────────────────────────
const sendOTPValidators = [
  emailField(),
];

// ── Change Password ───────────────────────────────────────────
const changePasswordValidators = [
  body('oldPassword')
    .isString().withMessage('oldPassword must be a string')
    .isLength({ min: 1, max: 128 }).withMessage('oldPassword must not be empty'),
  strongPassword('newPassword'),
  strongPassword('confirmNewPassword'),
];

// ── Reset Password Token (send reset email) ───────────────────
const resetPasswordTokenValidators = [
  emailField(),
];

// ── Reset Password (set new password) ────────────────────────
const resetPasswordValidators = [
  body('token')
    .isString().withMessage('token must be a string')
    .isLength({ min: 10, max: 200 }).withMessage('Invalid reset token'),
  strongPassword('password'),
  strongPassword('confirmPassword'),
];

module.exports = {
  signupValidators,
  loginValidators,
  adminLoginValidators,
  sendOTPValidators,
  changePasswordValidators,
  resetPasswordTokenValidators,
  resetPasswordValidators,
};
