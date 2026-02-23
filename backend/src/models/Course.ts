import mongoose, { Document, Schema, Types } from 'mongoose';
import slugify from 'slugify';

export interface ICourseLesson {
  _id?: Types.ObjectId;
  title: string;
  description?: string;
  videoUrl: string;
  duration: number;
  order: number;
}

export interface ICourseSection {
  _id?: Types.ObjectId;
  title: string;
  lessons: ICourseLesson[];
}

export interface ICourse extends Document {
  title: string;
  shortDescription: string;
  slug: string;
  description: string;
  instructorId: Types.ObjectId;
  previewVideoUrl?: string;
  price: number;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  thumbnail: string;
  status: 'draft' | 'pending' | 'published' | 'pending_unpublish' | 'rejected';
  rejectionReason?: string;
  isFeatured: boolean;
  sections: ICourseSection[];
  rating: number;
  reviewCount: number;
  students: number;
  createdAt: Date;
  updatedAt: Date;
}

const courseLessonSchema = new Schema<ICourseLesson>({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  videoUrl: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  order: {
    type: Number,
    required: true,
  },
});

const courseSectionSchema = new Schema<ICourseSection>({
  title: {
    type: String,
    required: true,
  },
  lessons: [courseLessonSchema],
});

const courseSchema = new Schema<ICourse>(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
    },
    shortDescription: {
      type: String,
      required: [true, 'Course short description is required'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Course description is required'],
    },
    previewVideoUrl: {
      type: String,
      trim: true,
      default: '',
    },
    instructorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    price: {
      type: Number,
      required: [true, 'Course price is required'],
      min: [0, 'Price cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    thumbnail: {
      type: String,
      default: '/placeholder.svg',
    },
    status: {
      type: String,
      enum: ['draft', 'pending', 'published', 'pending_unpublish', 'rejected'],
      default: 'draft',
    },
    rejectionReason: {
      type: String,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    sections: [courseSectionSchema],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    students: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Generate slug before saving
courseSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

// Index for search and filtering
courseSchema.index({ title: 'text', description: 'text' });
courseSchema.index({ category: 1, status: 1 });
courseSchema.index({ instructorId: 1 });

export default mongoose.model<ICourse>('Course', courseSchema);
