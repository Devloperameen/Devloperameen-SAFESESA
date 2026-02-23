import { body, param, query, ValidationChain } from 'express-validator';

export const registerValidator: ValidationChain[] = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').notEmpty().withMessage('Name is required'),
  body('role').optional().isIn(['student', 'instructor']).withMessage('Invalid role'),
];

export const loginValidator: ValidationChain[] = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const courseValidator: ValidationChain[] = [
  body('title').notEmpty().withMessage('Course title is required'),
  body('shortDescription').notEmpty().withMessage('Course short description is required'),
  body('description').notEmpty().withMessage('Course description is required'),
  body('previewVideoUrl')
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage('Preview video URL must be a valid URL'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('category').notEmpty().withMessage('Category is required'),
  body('level').optional().isIn(['beginner', 'intermediate', 'advanced']).withMessage('Invalid level'),
  body('sections').optional().isArray().withMessage('Sections must be an array'),
  body('sections.*.title').optional().notEmpty().withMessage('Section title is required'),
  body('sections.*.lessons').optional().isArray().withMessage('Section lessons must be an array'),
  body('sections.*.lessons.*.title').optional().notEmpty().withMessage('Lesson title is required'),
  body('sections.*.lessons.*.videoUrl')
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage('Lesson video URL must be a valid URL'),
  body('sections.*.lessons.*.duration')
    .optional()
    .isNumeric()
    .withMessage('Lesson duration must be numeric'),
];

export const courseUpdateValidator: ValidationChain[] = [
  body('title').optional().notEmpty().withMessage('Course title cannot be empty'),
  body('shortDescription').optional().notEmpty().withMessage('Course short description cannot be empty'),
  body('description').optional().notEmpty().withMessage('Course description cannot be empty'),
  body('previewVideoUrl')
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage('Preview video URL must be a valid URL'),
  body('price').optional().isNumeric().withMessage('Price must be a number'),
  body('category').optional().notEmpty().withMessage('Category cannot be empty'),
  body('level').optional().isIn(['beginner', 'intermediate', 'advanced']).withMessage('Invalid level'),
  body('thumbnail').optional().isString().withMessage('Thumbnail must be a string'),
  body('sections').optional().isArray().withMessage('Sections must be an array'),
  body('sections.*.title').optional().notEmpty().withMessage('Section title is required'),
  body('sections.*.lessons').optional().isArray().withMessage('Section lessons must be an array'),
  body('sections.*.lessons.*.title').optional().notEmpty().withMessage('Lesson title is required'),
  body('sections.*.lessons.*.description').optional().isString().withMessage('Lesson description must be text'),
  body('sections.*.lessons.*.videoUrl')
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage('Lesson video URL must be a valid URL'),
  body('sections.*.lessons.*.duration')
    .optional()
    .isNumeric()
    .withMessage('Lesson duration must be numeric'),
  body('sections.*.lessons.*.order')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Lesson order must be a positive integer'),
];

export const categoryValidator: ValidationChain[] = [
  body('name').notEmpty().withMessage('Category name is required'),
  body('description').optional().isString(),
];

export const announcementValidator: ValidationChain[] = [
  body('title').notEmpty().withMessage('Announcement title is required'),
  body('content').notEmpty().withMessage('Announcement content is required'),
  body('active').optional().isBoolean(),
  body('audience').optional().isIn(['students', 'instructors', 'both']).withMessage('Invalid announcement audience'),
];

export const idValidator: ValidationChain[] = [
  param('id').isMongoId().withMessage('Invalid ID format'),
];
