import express from 'express';
import {
  getUsers,
  updateUserRole,
  updateUserStatus,
  updateCourseStatus,
  toggleFeatured,
  getAnalytics,
  getActivities,
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
router.put('/courses/:id/status', updateCourseStatus);
router.put('/courses/:id/featured', toggleFeatured);

// Analytics
router.get('/analytics', getAnalytics);
router.get('/activities', getActivities);

export default router;
