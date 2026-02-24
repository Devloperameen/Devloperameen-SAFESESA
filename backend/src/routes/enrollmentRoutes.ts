import express from 'express';
import {
  enrollCourse,
  getEnrollments,
  getProgress,
  updateProgress,
} from '../controllers/enrollmentController';
import { protect, checkRole } from '../middleware/auth';

const router = express.Router();

// Enroll in a course
router.post('/:courseId', protect, checkRole('student'), enrollCourse);

// Get all enrollments for the logged-in student
router.get('/', protect, checkRole('student'), getEnrollments);

// Get progress for a specific course
router.get('/:courseId/progress', protect, checkRole('student'), getProgress);

/**
 * Update lesson completion progress.
 *
 * Both PUT and PATCH are supported:
 *   PUT   /api/enrollments/:courseId/progress  – full update (legacy, keeps backwards compat)
 *   PATCH /api/enrollments/:courseId/progress  – partial update (new spec requirement)
 *
 * Body: { lessonId: string, completed: boolean }
 * Returns the updated enrollment including new progress percentage.
 */
router.put('/:courseId/progress', protect, checkRole('student'), updateProgress);
router.patch('/:courseId/progress', protect, checkRole('student'), updateProgress);

export default router;
