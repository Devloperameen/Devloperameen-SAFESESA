import { Response } from 'express';
import mongoose from 'mongoose';
import Enrollment from '../models/Enrollment';
import Course from '../models/Course';
import Activity from '../models/Activity';
import { AuthRequest } from '../middleware/auth';
import {
  calculateProgressPercentage,
  canEnrollInCourseStatus,
  getCourseLessonIds,
  toggleCompletedLesson,
} from '../utils/enrollmentProgress';

// @desc    Enroll in course
// @route   POST /api/enrollments/:courseId
// @access  Private (Student)
export const enrollCourse = async (req: AuthRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }
    
    if (!canEnrollInCourseStatus(course.status)) {
      return res.status(400).json({
        success: false,
        message: 'Course is not available for enrollment',
      });
    }
    
    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      studentId: req.user?._id,
      courseId,
    });
    
    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled in this course',
      });
    }
    
    const enrollment = await Enrollment.create({
      studentId: req.user?._id,
      courseId,
    });
    
    // Update course student count
    await Course.findByIdAndUpdate(courseId, { $inc: { students: 1 } });
    
    // Create activity
    await Activity.create({
      type: 'enrollment',
      message: `${req.user?.profile.name} enrolled in "${course.title}"`,
      userId: req.user?._id,
      courseId: course._id,
    });
    
    res.status(201).json({
      success: true,
      data: enrollment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Get user enrollments
// @route   GET /api/enrollments
// @access  Private (Student)
export const getEnrollments = async (req: AuthRequest, res: Response) => {
  try {
    const enrollments = await Enrollment.find({ studentId: req.user?._id })
      .populate({
        path: 'courseId',
        populate: {
          path: 'instructorId',
          select: 'profile.name profile.avatar',
        },
      })
      .sort({ lastAccessed: -1 });
    
    res.json({
      success: true,
      count: enrollments.length,
      data: enrollments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Get enrollment progress
// @route   GET /api/enrollments/:courseId/progress
// @access  Private (Student)
export const getProgress = async (req: AuthRequest, res: Response) => {
  try {
    const enrollment = await Enrollment.findOne({
      studentId: req.user?._id,
      courseId: req.params.courseId,
    }).populate('courseId');
    
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found',
      });
    }
    
    res.json({
      success: true,
      data: enrollment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Update lesson completion
// @route   PUT /api/enrollments/:courseId/progress
// @access  Private (Student)
export const updateProgress = async (req: AuthRequest, res: Response) => {
  try {
    const { lessonId, completed } = req.body;

    if (!lessonId) {
      return res.status(400).json({
        success: false,
        message: 'lessonId is required',
      });
    }
    
    const enrollment = await Enrollment.findOne({
      studentId: req.user?._id,
      courseId: req.params.courseId,
    }).populate('courseId');
    
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found',
      });
    }
    
    const course = enrollment.courseId as any;
    const allLessonIds = getCourseLessonIds(course.sections || []);
    const totalLessons = allLessonIds.length;

    const normalizedLessonId = String(lessonId);
    if (!allLessonIds.includes(normalizedLessonId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid lessonId for this course',
      });
    }

    const nextCompletedIds = toggleCompletedLesson(
      enrollment.completedLessons.map((id) => id.toString()),
      normalizedLessonId,
      Boolean(completed),
    );
    enrollment.completedLessons = nextCompletedIds.map((id) => new mongoose.Types.ObjectId(id));
    
    // Calculate progress
    enrollment.progress = calculateProgressPercentage(nextCompletedIds.length, totalLessons);
    
    enrollment.lastAccessed = new Date();
    await enrollment.save();
    
    res.json({
      success: true,
      data: enrollment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};
