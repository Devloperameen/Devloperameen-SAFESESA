import express from 'express';
import { processPayment, getMyTransactions } from '../controllers/paymentController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/process', protect, processPayment);
router.get('/my-transactions', protect, getMyTransactions);

export default router;
