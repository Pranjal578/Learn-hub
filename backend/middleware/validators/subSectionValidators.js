// ─────────────────────────────────────────────────────────────
//  SubSection Input Validators — LearnHub
// ─────────────────────────────────────────────────────────────

const { body } = require('express-validator');

const mongoIdField = (field) =>
  body(field).isMongoId().withMessage(`${field} must be a valid ID`);

// ── Create SubSection ─────────────────────────────────────────
const createSubSectionValidators = [
  mongoIdField('sectionId'),
  body('title')
    .isString().withMessage('title must be a string')
    .trim()
    .isLength({ min: 1, max: 100 }).withMessage('title must be 1–100 characters'),
  body('description')
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .isLength({ max: 1000 }).withMessage('description must be ≤ 1000 characters'),
  body('isQuiz')
    .optional()
    .isBoolean().withMessage('isQuiz must be a boolean'),
  body('quizUrl')
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .isLength({ max: 500 }).withMessage('quizUrl must be ≤ 500 characters'),
];

// ── Update SubSection ─────────────────────────────────────────
const updateSubSectionValidators = [
  mongoIdField('subSectionId'),
  body('title').optional()
    .isString().trim().isLength({ min: 1, max: 100 }),
  body('description').optional()
    .isString().isLength({ max: 1000 }),
];

module.exports = {
  createSubSectionValidators,
  updateSubSectionValidators,
};
