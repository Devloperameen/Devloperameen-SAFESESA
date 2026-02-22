import express from 'express';
import { register, login, getMe, updateProfile } from '../controllers/authController';
import { protect } from '../middleware/auth';
import { registerValidator, loginValidator } from '../middleware/validator';

const router = express.Router();

router.post('/register', registerValidator, register);
router.post('/login', loginValidator, login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

export default router;
