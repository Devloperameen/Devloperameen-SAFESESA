import mongoose, { Document, Schema, Types } from 'mongoose';

// ─── Sub-document interfaces ──────────────────────────────────────────────────

export interface ICurriculumLesson {
    _id?: Types.ObjectId;
    title: string;
    description?: string;
    videoUrl: string;
    /** Duration in minutes */
    duration: number;
    order: number;
    contentType: 'video' | 'quiz' | 'resource' | 'text';
    isPreview: boolean;
}

export interface ICurriculumSection {
    _id?: Types.ObjectId;
    title: string;
    order: number;
    lessons: ICurriculumLesson[];
}

// ─── Main document interface ──────────────────────────────────────────────────

export interface ICurriculum extends Document {
    /** Reference to the parent Course */
    courseId: Types.ObjectId;
    sections: ICurriculumSection[];
    createdAt: Date;
    updatedAt: Date;
    /** Virtual: total number of lessons across all sections */
    totalLessons: number;
    /** Virtual: total duration in minutes across all lessons */
    totalDuration: number;
}

// ─── Schemas ──────────────────────────────────────────────────────────────────

const curriculumLessonSchema = new Schema<ICurriculumLesson>(
    {
        title: {
            type: String,
            required: [true, 'Lesson title is required'],
            trim: true,
        },
        description: {
            type: String,
            default: '',
        },
        videoUrl: {
            type: String,
            required: [true, 'Lesson video URL is required'],
            trim: true,
        },
        duration: {
            type: Number,
            required: [true, 'Lesson duration is required'],
            min: [0, 'Duration cannot be negative'],
            default: 0,
        },
        order: {
            type: Number,
            required: true,
            default: 1,
        },
        contentType: {
            type: String,
            enum: ['video', 'quiz', 'resource', 'text'],
            default: 'video',
        },
        isPreview: {
            type: Boolean,
            default: false,
        },
    },
    { _id: true },
);

const curriculumSectionSchema = new Schema<ICurriculumSection>(
    {
        title: {
            type: String,
            required: [true, 'Section title is required'],
            trim: true,
        },
        order: {
            type: Number,
            required: true,
            default: 1,
        },
        lessons: [curriculumLessonSchema],
    },
    { _id: true },
);

const curriculumSchema = new Schema<ICurriculum>(
    {
        courseId: {
            type: Schema.Types.ObjectId,
            ref: 'Course',
            required: [true, 'Course reference is required'],
            unique: true, // One curriculum document per course
            index: true,
        },
        sections: [curriculumSectionSchema],
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
);

// ─── Virtuals ─────────────────────────────────────────────────────────────────

curriculumSchema.virtual('totalLessons').get(function (this: ICurriculum) {
    return this.sections.reduce((total, section) => total + (section.lessons?.length ?? 0), 0);
});

curriculumSchema.virtual('totalDuration').get(function (this: ICurriculum) {
    return this.sections.reduce(
        (total, section) =>
            total + section.lessons.reduce((secTotal, lesson) => secTotal + (lesson.duration ?? 0), 0),
        0,
    );
});

// Note: courseId already has a unique index declared inline via `unique: true`.
// No additional schema.index() call is needed — adding one would create a
// duplicate and trigger a Mongoose warning.

export default mongoose.model<ICurriculum>('Curriculum', curriculumSchema);
