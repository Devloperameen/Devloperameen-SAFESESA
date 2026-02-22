import { Response } from 'express';
import Enrollment from '../models/Enrollment';
import Course from '../models/Course';
import Activity from '../models/Activity';
import { AuthRequest } from '../middleware/auth';

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
    
    if (course.status !== 'published') {
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
    
    // Update completed lessons
    if (completed && !enrollment.completedLessons.includes(lessonId)) {
      enrollment.completedLessons.push(lessonId);
    } else if (!completed) {
      enrollment.completedLessons = enrollment.completedLessons.filter(
        (id) => id.toString() !== lessonId
      );
    }
    
    // Calculate progress
    const course = enrollment.courseId as any;
    const totalLessons = course.sections.reduce(
      (acc: number, section: any) => acc + section.lessons.length,
      0
    );
    enrollment.progress = totalLessons > 0 
      ? Math.round((enrollment.completedLessons.length / totalLessons) * 100)
      : 0;
    
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
