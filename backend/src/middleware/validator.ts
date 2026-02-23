import { body, param, query, ValidationChain } from 'express-validator';

export const registerValidator: ValidationChain[] = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').notEmpty().withMessage('Name is required'),
  body('role').optional().isIn(['student', 'instructor', 'admin']).withMessage('Invalid role'),
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
