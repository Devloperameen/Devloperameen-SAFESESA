import express from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController';
import { protect, checkRole } from '../middleware/auth';
import { categoryValidator } from '../middleware/validator';

const router = express.Router();

router.get('/', getCategories);
router.post('/', protect, checkRole('admin'), categoryValidator, createCategory);
router.put('/:id', protect, checkRole('admin'), updateCategory);
router.delete('/:id', protect, checkRole('admin'), deleteCategory);

export default router;
