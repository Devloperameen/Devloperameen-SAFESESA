import express from 'express';
import { getFavorites, addFavorite, removeFavorite } from '../controllers/favoriteController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.get('/', protect, getFavorites);
router.post('/:courseId', protect, addFavorite);
router.delete('/:courseId', protect, removeFavorite);

export default router;
