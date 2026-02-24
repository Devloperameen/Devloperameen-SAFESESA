import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ITransaction extends Document {
    id: string;
    userId: Types.ObjectId;
    courseId: Types.ObjectId;
    amount: number;
    currency: string;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    paymentMethod: string;
    transactionId: string; // The ID from payment processor
    receiptUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        courseId: {
            type: Schema.Types.ObjectId,
            ref: 'Course',
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        currency: {
            type: String,
            default: 'USD',
        },
        status: {
            type: String,
            enum: ['pending', 'completed', 'failed', 'refunded'],
            default: 'pending',
        },
        paymentMethod: {
            type: String,
            required: true,
        },
        transactionId: {
            type: String,
            required: true,
            unique: true,
        },
        receiptUrl: String,
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<ITransaction>('Transaction', transactionSchema);
