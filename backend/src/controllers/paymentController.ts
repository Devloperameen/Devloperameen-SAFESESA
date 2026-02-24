import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Course from '../models/Course';
import Transaction from '../models/Transaction';
import Enrollment from '../models/Enrollment';
import Activity from '../models/Activity';
import mongoose from 'mongoose';

// @desc    Process mock payment
// @route   POST /api/payments/process
// @access  Private (Student)
export const processPayment = async (req: AuthRequest, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { courseId, paymentMethod, paymentReference } = req.body;

        // Find course
        const course = await Course.findById(courseId).session(session);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        // Check if already enrolled (including pending)
        const existingEnrollment = await Enrollment.findOne({
            studentId: req.user?._id,
            courseId
        }).session(session);

        if (existingEnrollment) {
            return res.status(400).json({ success: false, message: 'Enrollment already exists (or pending approval)' });
        }

        // Create transaction record (pending)
        const transaction = await Transaction.create([{
            userId: req.user?._id,
            courseId,
            amount: course.price,
            paymentMethod: paymentMethod || 'check',
            transactionId: `req_${Math.random().toString(36).substr(2, 9)}`,
            status: 'pending',
        }], { session });

        // Create enrollment (pending)
        const enrollment = await Enrollment.create([{
            studentId: req.user?._id,
            courseId,
            status: 'pending',
            paymentReference: paymentReference || '',
            enrolledAt: new Date(),
        }], { session });

        // Log activity as a request
        await Activity.create([{
            type: 'enrollment',
            message: `${req.user?.profile.name} requested enrollment for "${course.title}" (Check ref: ${paymentReference || 'N/A'})`,
            userId: req.user?._id,
            courseId: course._id,
        }], { session });

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({
            success: true,
            data: {
                transaction: transaction[0],
                enrollment: enrollment[0]
            }
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error('Payment Error:', error);
        res.status(500).json({ success: false, message: 'Payment failed' });
    }
};

// @desc    Get user transactions
// @route   GET /api/payments/my-transactions
// @access  Private (Student)
export const getMyTransactions = async (req: AuthRequest, res: Response) => {
    try {
        const transactions = await Transaction.find({ userId: req.user?._id })
            .populate('courseId', 'title thumbnail price')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: transactions.length,
            data: transactions
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
