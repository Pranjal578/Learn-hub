const express = require('express');
const router = express.Router();

// Controllers
const {
  signup,
  login,
  sendOTP,
  changePassword,
  adminLogin,
} = require('../controllers/auth');

// Reset password controllers
const {
  resetPasswordToken,
  resetPassword,
} = require('../controllers/resetPassword');

// Middleware
const { auth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  authLimiter,
  otpLimiter,
  resetLimiter,
} = require('../middleware/rateLimiter');
const {
  signupValidators,
  loginValidators,
  adminLoginValidators,
  sendOTPValidators,
  changePasswordValidators,
  resetPasswordTokenValidators,
  resetPasswordValidators,
} = require('../middleware/validators/authValidators');


// ── Authentication Routes ─────────────────────────────────────

// Signup — rate limited + strict validation
router.post('/signup',    authLimiter, signupValidators,   validate, signup);

// Login — rate limited + strict validation
router.post('/login',     authLimiter, loginValidators,    validate, login);

// Send OTP — extra-strict limiter (5 per 15 min)
router.post('/sendotp',   otpLimiter,  sendOTPValidators,  validate, sendOTP);

// Change password — authenticated; moderate validation
router.post('/changepassword', auth, changePasswordValidators, validate, changePassword);


// ── Reset Password ────────────────────────────────────────────

// Generate reset token — strict limiter (5 per 15 min)
router.post('/reset-password-token', resetLimiter, resetPasswordTokenValidators, validate, resetPasswordToken);

// Apply new password — strict limiter + validation
router.post('/reset-password',       resetLimiter, resetPasswordValidators,      validate, resetPassword);


// ── Admin Portal Login (isolated) ────────────────────────────
router.post('/admin-login', authLimiter, adminLoginValidators, validate, adminLogin);


module.exports = router;
