import mongoose, { Document, Schema } from 'mongoose';

export interface IAnnouncement extends Document {
  title: string;
  content: string;
  active: boolean;
  audience: 'students' | 'instructors' | 'both';
  createdAt: Date;
  updatedAt: Date;
}

const announcementSchema = new Schema<IAnnouncement>(
  {
    title: {
      type: String,
      required: [true, 'Announcement title is required'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Announcement content is required'],
    },
    active: {
      type: Boolean,
      default: true,
    },
    audience: {
      type: String,
      enum: ['students', 'instructors', 'both'],
      default: 'both',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IAnnouncement>('Announcement', announcementSchema);
