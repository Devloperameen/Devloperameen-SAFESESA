import express from 'express';
import {
  getUsers,
  updateUserRole,
  updateUserStatus,
  getCoursesForModeration,
  updateCourseStatus,
  toggleFeatured,
  getAnalytics,
  getActivities,
  getEnrollments,
  manualEnroll,
  unenroll,
  updateEnrollmentStatus,
} from '../controllers/adminController';
import { protect, checkRole } from '../middleware/auth';

const router = express.Router();

// All routes require admin role
router.use(protect, checkRole('admin'));

// User management
router.get('/users', getUsers);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/status', updateUserStatus);

// Course moderation
router.get('/courses', getCoursesForModeration);
router.put('/courses/:id/status', updateCourseStatus);
router.put('/courses/:id/featured', toggleFeatured);

// Analytics
router.get('/analytics', getAnalytics);
router.get('/activities', getActivities);

// Enrollments
router.get('/enrollments', getEnrollments);
router.post('/enrollments', manualEnroll);
router.put('/enrollments/:id/status', updateEnrollmentStatus);
router.delete('/enrollments/:id', unenroll);

export default router;
