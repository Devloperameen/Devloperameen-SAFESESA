import { Response } from 'express';
import { validationResult } from 'express-validator';
import Course from '../models/Course';
import Enrollment from '../models/Enrollment';
import Category from '../models/Category';
import Activity from '../models/Activity';
import { AuthRequest } from '../middleware/auth';

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
export const getCourses = async (req: AuthRequest, res: Response) => {
  try {
    const { category, search, status, level, featured } = req.query;
    
    const query: any = {};
    
    // Filter by status (default to published for public access)
    if (status) {
      query.status = status;
    } else if (!req.user || req.user.role === 'student') {
      query.status = 'published';
    }
    
    if (category) query.category = category;
    if (level) query.level = level;
    if (featured === 'true') query.isFeatured = true;
    
    // Text search
    if (search) {
      query.$text = { $search: search as string };
    }
    
    const courses = await Course.find(query)
      .populate('instructorId', 'profile.name profile.avatar email')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
export const getCourse = async (req: AuthRequest, res: Response) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructorId', 'profile.name profile.avatar profile.bio email');
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }
    
    res.json({
      success: true,
      data: course,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Create course
// @route   POST /api/courses
// @access  Private (Instructor)
export const createCourse = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    const course = await Course.create({
      ...req.body,
      instructorId: req.user?._id,
      status: 'draft',
    });
    
    // Update category count
    await Category.findOneAndUpdate(
      { name: course.category },
      { $inc: { courseCount: 1 } }
    );
    
    // Create activity
    await Activity.create({
      type: 'course_created',
      message: `New course "${course.title}" created`,
      userId: req.user?._id,
      courseId: course._id,
    });
    
    res.status(201).json({
      success: true,
      data: course,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Instructor - own courses)
export const updateCourse = async (req: AuthRequest, res: Response) => {
  try {
    let course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }
    
    // Check ownership
    if (course.instructorId.toString() !== req.user?._id.toString() && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this course',
      });
    }
    
    const oldCategory = course.category;
    
    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    
    // Update category counts if category changed
    if (req.body.category && oldCategory !== req.body.category) {
      await Category.findOneAndUpdate({ name: oldCategory }, { $inc: { courseCount: -1 } });
      await Category.findOneAndUpdate({ name: req.body.category }, { $inc: { courseCount: 1 } });
    }
    
    res.json({
      success: true,
      data: course,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (Instructor - own courses)
export const deleteCourse = async (req: AuthRequest, res: Response) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }
    
    // Check ownership
    if (course.instructorId.toString() !== req.user?._id.toString() && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this course',
      });
    }
    
    await course.deleteOne();
    
    // Update category count
    await Category.findOneAndUpdate(
      { name: course.category },
      { $inc: { courseCount: -1 } }
    );
    
    // Delete enrollments
    await Enrollment.deleteMany({ courseId: course._id });
    
    res.json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Get instructor courses
// @route   GET /api/courses/instructor/my-courses
// @access  Private (Instructor)
export const getInstructorCourses = async (req: AuthRequest, res: Response) => {
  try {
    const courses = await Course.find({ instructorId: req.user?._id })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Get instructor dashboard stats
// @route   GET /api/courses/instructor/stats
// @access  Private (Instructor)
export const getInstructorStats = async (req: AuthRequest, res: Response) => {
  try {
    const courses = await Course.find({ instructorId: req.user?._id });
    
    const totalStudents = courses.reduce((sum, course) => sum + course.students, 0);
    const totalCourses = courses.length;
    const avgRating = courses.length > 0
      ? courses.reduce((sum, course) => sum + course.rating, 0) / courses.length
      : 0;
    
    // Mock revenue data - implement actual payment tracking
    const totalEarnings = courses.reduce((sum, course) => sum + (course.price * course.students), 0);
    
    res.json({
      success: true,
      data: {
        totalStudents,
        totalCourses,
        avgRating: avgRating.toFixed(1),
        totalEarnings,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};
