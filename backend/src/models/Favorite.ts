import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IFavorite extends Document {
  userId: Types.ObjectId;
  courseId: Types.ObjectId;
  createdAt: Date;
}

const favoriteSchema = new Schema<IFavorite>(
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
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure a user can only favorite a course once
favoriteSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export default mongoose.model<IFavorite>('Favorite', favoriteSchema);
