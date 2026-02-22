import express from 'express';
import {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  getInstructorCourses,
  getInstructorStats,
} from '../controllers/courseController';
import { protect, checkRole } from '../middleware/auth';
import { courseValidator, idValidator } from '../middleware/validator';

const router = express.Router();

// Public routes
router.get('/', getCourses);
router.get('/:id', getCourse);

// Instructor routes
router.get('/instructor/my-courses', protect, checkRole('instructor'), getInstructorCourses);
router.get('/instructor/stats', protect, checkRole('instructor'), getInstructorStats);
router.post('/', protect, checkRole('instructor', 'admin'), courseValidator, createCourse);
router.put('/:id', protect, checkRole('instructor', 'admin'), updateCourse);
router.delete('/:id', protect, checkRole('instructor', 'admin'), deleteCourse);

export default router;
