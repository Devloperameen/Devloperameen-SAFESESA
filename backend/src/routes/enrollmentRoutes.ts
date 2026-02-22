import express from 'express';
import {
  enrollCourse,
  getEnrollments,
  getProgress,
  updateProgress,
} from '../controllers/enrollmentController';
import { protect, checkRole } from '../middleware/auth';

const router = express.Router();

router.post('/:courseId', protect, checkRole('student'), enrollCourse);
router.get('/', protect, checkRole('student'), getEnrollments);
router.get('/:courseId/progress', protect, checkRole('student'), getProgress);
router.put('/:courseId/progress', protect, checkRole('student'), updateProgress);

export default router;
