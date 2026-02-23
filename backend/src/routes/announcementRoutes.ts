import express from 'express';
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  toggleActive,
} from '../controllers/announcementController';
import { protect, optionalProtect, checkRole } from '../middleware/auth';
import { announcementValidator } from '../middleware/validator';

const router = express.Router();

router.get('/', optionalProtect, getAnnouncements);
router.post('/', protect, checkRole('admin'), announcementValidator, createAnnouncement);
router.put('/:id', protect, checkRole('admin'), updateAnnouncement);
router.delete('/:id', protect, checkRole('admin'), deleteAnnouncement);
router.put('/:id/active', protect, checkRole('admin'), toggleActive);

export default router;
