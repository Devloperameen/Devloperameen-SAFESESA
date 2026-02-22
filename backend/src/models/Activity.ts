import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IActivity extends Document {
  type: 'enrollment' | 'publish' | 'signup' | 'review' | 'course_created' | 'course_approved' | 'course_rejected';
  message: string;
  userId?: Types.ObjectId;
  courseId?: Types.ObjectId;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const activitySchema = new Schema<IActivity>(
  {
    type: {
      type: String,
      enum: ['enrollment', 'publish', 'signup', 'review', 'course_created', 'course_approved', 'course_rejected'],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
activitySchema.index({ createdAt: -1 });

export default mongoose.model<IActivity>('Activity', activitySchema);
