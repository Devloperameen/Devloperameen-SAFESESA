import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IReview extends Document {
  courseId: Types.ObjectId;
  studentId: Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      default: '',
      maxlength: [1000, 'Review cannot exceed 1000 characters'],
    },
  },
  {
    timestamps: true,
  },
);

reviewSchema.index({ courseId: 1, studentId: 1 }, { unique: true });

export default mongoose.model<IReview>('Review', reviewSchema);
