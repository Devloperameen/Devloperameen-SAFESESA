import express from 'express';
import {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  getInstructorCourses,
  getInstructorCourseStudents,
  getInstructorStats,
  getInstructorRevenue,
  getInstructorMessages,
  getCourseReviews,
  getMyCourseReview,
  upsertCourseReview,
  submitCourseForReview,
  requestCourseUnpublish,
} from '../controllers/courseController';
import { protect, optionalProtect, checkRole } from '../middleware/auth';
import { courseValidator, courseUpdateValidator } from '../middleware/validator';

const router = express.Router();

// Public routes
router.get('/', optionalProtect, getCourses);

// Instructor routes
router.get('/instructor/my-courses', protect, checkRole('instructor'), getInstructorCourses);
router.get('/instructor/:id/students', protect, checkRole('instructor', 'admin'), getInstructorCourseStudents);
router.get('/instructor/stats', protect, checkRole('instructor'), getInstructorStats);
router.get('/instructor/revenue', protect, checkRole('instructor'), getInstructorRevenue);
router.get('/instructor/messages', protect, checkRole('instructor'), getInstructorMessages);
router.post('/', protect, checkRole('instructor', 'admin'), courseValidator, createCourse);
router.put('/:id', protect, checkRole('instructor', 'admin'), courseUpdateValidator, updateCourse);
router.put('/:id/submit', protect, checkRole('instructor', 'admin'), submitCourseForReview);
router.put('/:id/request-unpublish', protect, checkRole('instructor', 'admin'), requestCourseUnpublish);
router.delete('/:id', protect, checkRole('instructor', 'admin'), deleteCourse);
router.get('/:id/reviews', getCourseReviews);
router.get('/:id/reviews/me', protect, checkRole('student'), getMyCourseReview);
router.post('/:id/reviews', protect, checkRole('student'), upsertCourseReview);
router.get('/:id', optionalProtect, getCourse);

export default router;
