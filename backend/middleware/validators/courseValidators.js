// ─────────────────────────────────────────────────────────────
//  Course Input Validators — LearnHub
// ─────────────────────────────────────────────────────────────

const { body, param } = require('express-validator');

const mongoIdField = (field) =>
  body(field)
    .isMongoId().withMessage(`${field} must be a valid ID`);

// ── Create Course ─────────────────────────────────────────────
const createCourseValidators = [
  body('courseName')
    .isString().withMessage('courseName must be a string')
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage('courseName must be 3–100 characters'),
  body('courseDescription')
    .isString().withMessage('courseDescription must be a string')
    .trim()
    .isLength({ min: 3, max: 2000 }).withMessage('courseDescription must be 3–2000 characters'),
  body('price')
    .customSanitizer((v) => parseFloat(v))
    .isFloat({ min: 0 }).withMessage('price must be a non-negative number'),
  mongoIdField('category'),
  body('tag')
    .optional()
    .custom((v) => {
      try {
        const arr = typeof v === 'string' ? JSON.parse(v) : v;
        if (!Array.isArray(arr)) throw new Error('tag must be an array');
        if (arr.some((t) => typeof t !== 'string' || t.length > 50))
          throw new Error('Each tag must be a string ≤ 50 characters');
      } catch (e) {
        if (e.message.includes('tag')) throw e;
        // If JSON.parse fails, treat as single tag string — that's fine
      }
      return true;
    }),
  body('whatYouWillLearn')
    .optional()
    .isString().isLength({ max: 1000 }).withMessage('whatYouWillLearn must be ≤ 1000 characters'),
];

// ── Edit Course ───────────────────────────────────────────────
const editCourseValidators = [
  mongoIdField('courseId'),
  body('courseName').optional()
    .isString().trim().isLength({ min: 3, max: 100 }),
  body('courseDescription').optional()
    .isString().trim().isLength({ min: 10, max: 2000 }),
  body('price').optional()
    .isFloat({ min: 0 }).withMessage('price must be a non-negative number'),
];

// ── Create Section ────────────────────────────────────────────
const createSectionValidators = [
  mongoIdField('courseId'),
  body('sectionName')
    .isString().trim()
    .isLength({ min: 1, max: 100 }).withMessage('sectionName must be 1–100 characters'),
];

// ── Update Section ────────────────────────────────────────────
const updateSectionValidators = [
  mongoIdField('courseId'),
  mongoIdField('sectionId'),
  body('sectionName').optional()
    .isString().trim().isLength({ min: 1, max: 100 }),
];

module.exports = {
  createCourseValidators,
  editCourseValidators,
  createSectionValidators,
  updateSectionValidators,
};
