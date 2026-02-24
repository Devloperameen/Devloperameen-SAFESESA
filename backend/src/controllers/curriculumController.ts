import { Response } from 'express';
import mongoose from 'mongoose';
import Curriculum from '../models/Curriculum';
import Course from '../models/Course';
import Enrollment from '../models/Enrollment';
import { AuthRequest } from '../middleware/auth';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Verify that the requesting user owns the course (or is an admin).
 */
async function assertCourseOwnership(
    courseId: string,
    req: AuthRequest,
    res: Response,
): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
        res.status(400).json({ success: false, message: 'Invalid course ID' });
        return false;
    }

    const course = await Course.findById(courseId);
    if (!course) {
        res.status(404).json({ success: false, message: 'Course not found' });
        return false;
    }

    const isOwner =
        req.user?.role === 'admin' ||
        course.instructorId.toString() === req.user?._id.toString();

    if (!isOwner) {
        res.status(403).json({
            success: false,
            message: 'Not authorized to manage this course curriculum',
        });
        return false;
    }

    return true;
}

// ─── GET /api/curriculum/:courseId ───────────────────────────────────────────

/**
 * @desc    Get curriculum for a course
 * @route   GET /api/curriculum/:courseId
 * @access  Public (full detail only for enrolled students / instructor / admin)
 */
export const getCurriculum = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { courseId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            res.status(400).json({ success: false, message: 'Invalid course ID' });
            return;
        }

        const course = await Course.findById(courseId);
        if (!course) {
            res.status(404).json({ success: false, message: 'Course not found' });
            return;
        }

        const curriculum = await Curriculum.findOne({ courseId });

        // Determine access level
        const userId = req.user?._id?.toString();
        const isInstructor =
            req.user?.role === 'admin' ||
            course.instructorId.toString() === userId;

        let isEnrolled = false;
        if (userId && !isInstructor) {
            const enrollment = await Enrollment.findOne({
                studentId: req.user?._id,
                courseId,
                status: 'active',
            });
            isEnrolled = !!enrollment;
        }

        const hasFullAccess = isInstructor || isEnrolled;

        if (!curriculum) {
            res.json({
                success: true,
                data: { courseId, sections: [], totalLessons: 0, totalDuration: 0 },
            });
            return;
        }

        // For public users strip videoUrl from non-preview lessons
        const sectionsData = curriculum.sections.map((section) => ({
            id: section._id,
            title: section.title,
            order: section.order,
            lessons: section.lessons.map((lesson) => ({
                id: lesson._id,
                title: lesson.title,
                description: lesson.description,
                duration: lesson.duration,
                order: lesson.order,
                contentType: lesson.contentType,
                isPreview: lesson.isPreview,
                // Only expose videoUrl if user has access, or lesson is a preview
                videoUrl: hasFullAccess || lesson.isPreview ? lesson.videoUrl : undefined,
            })),
        }));

        res.json({
            success: true,
            data: {
                id: curriculum._id,
                courseId: curriculum.courseId,
                sections: sectionsData,
                totalLessons: curriculum.totalLessons,
                totalDuration: curriculum.totalDuration,
                updatedAt: curriculum.updatedAt,
            },
        });
    } catch (error) {
        console.error('getCurriculum error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ─── POST /api/curriculum/:courseId ──────────────────────────────────────────

/**
 * @desc    Create or fully replace the curriculum for a course
 * @route   POST /api/curriculum/:courseId
 * @access  Private (Instructor - own courses, Admin)
 */
export const upsertCurriculum = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { courseId } = req.params;

        const isOwner = await assertCourseOwnership(courseId, req, res);
        if (!isOwner) return;

        const { sections = [] } = req.body;

        const curriculum = await Curriculum.findOneAndUpdate(
            { courseId },
            { courseId, sections },
            { new: true, upsert: true, runValidators: true },
        );

        // Mirror sections back into the Course document as well (backwards-compat)
        await Course.findByIdAndUpdate(courseId, { sections });

        res.status(201).json({ success: true, data: curriculum });
    } catch (error) {
        console.error('upsertCurriculum error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ─── PATCH /api/curriculum/:courseId ─────────────────────────────────────────

/**
 * @desc    Partially update (merge) curriculum sections
 * @route   PATCH /api/curriculum/:courseId
 * @access  Private (Instructor - own courses, Admin)
 */
export const patchCurriculum = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { courseId } = req.params;

        const isOwner = await assertCourseOwnership(courseId, req, res);
        if (!isOwner) return;

        const { sections } = req.body;
        if (!Array.isArray(sections)) {
            res.status(400).json({ success: false, message: '`sections` array is required' });
            return;
        }

        const curriculum = await Curriculum.findOneAndUpdate(
            { courseId },
            { $set: { sections } },
            { new: true, upsert: true, runValidators: true },
        );

        // Keep Course.sections in sync
        await Course.findByIdAndUpdate(courseId, { sections });

        res.json({ success: true, data: curriculum });
    } catch (error) {
        console.error('patchCurriculum error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ─── DELETE /api/curriculum/:courseId ────────────────────────────────────────

/**
 * @desc    Delete curriculum for a course
 * @route   DELETE /api/curriculum/:courseId
 * @access  Private (Instructor - own courses, Admin)
 */
export const deleteCurriculum = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { courseId } = req.params;

        const isOwner = await assertCourseOwnership(courseId, req, res);
        if (!isOwner) return;

        await Curriculum.findOneAndDelete({ courseId });
        // Clear sections from Course too
        await Course.findByIdAndUpdate(courseId, { sections: [] });

        res.json({ success: true, message: 'Curriculum deleted' });
    } catch (error) {
        console.error('deleteCurriculum error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
