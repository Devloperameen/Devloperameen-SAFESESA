import { Response } from 'express';
import User from '../models/User';
import Course from '../models/Course';
import Category from '../models/Category';
import Activity from '../models/Activity';
import Enrollment from '../models/Enrollment';
import { AuthRequest } from '../middleware/auth';

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { search, role, status } = req.query;
    
    const query: any = {};
    if (role) query.role = role;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { 'profile.name': { $regex: search, $options: 'i' } },
      ];
    }
    
    const users = await User.find(query).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin)
export const updateUserRole = async (req: AuthRequest, res: Response) => {
  try {
    const { role } = req.body;
    
    if (!['student', 'instructor', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role',
      });
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Update user status
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin)
export const updateUserStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    
    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Approve/Reject course
// @route   PUT /api/admin/courses/:id/status
// @access  Private (Admin)
export const updateCourseStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { status, rejectionReason } = req.body;
    
    if (!['published', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }
    
    const updateData: any = { status };
    if (status === 'rejected' && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }
    
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('instructorId', 'profile.name');
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }
    
    // Create activity
    const activityType = status === 'published' ? 'course_approved' : 'course_rejected';
    await Activity.create({
      type: activityType,
      message: `Course "${course.title}" ${status === 'published' ? 'approved' : 'rejected'}`,
      courseId: course._id,
    });
    
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

// @desc    Toggle course featured status
// @route   PUT /api/admin/courses/:id/featured
// @access  Private (Admin)
export const toggleFeatured = async (req: AuthRequest, res: Response) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }
    
    course.isFeatured = !course.isFeatured;
    await course.save();
    
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

// @desc    Get platform analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin)
export const getAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCourses = await Course.countDocuments();
    const totalEnrollments = await Enrollment.countDocuments();
    const publishedCourses = await Course.countDocuments({ status: 'published' });
    
    // Revenue by month (mock data - implement actual payment tracking)
    const revenueData = [
      { month: 'Jan', revenue: 12000 },
      { month: 'Feb', revenue: 15000 },
      { month: 'Mar', revenue: 18000 },
      { month: 'Apr', revenue: 22000 },
      { month: 'May', revenue: 25000 },
      { month: 'Jun', revenue: 28000 },
    ];
    
    // Category performance
    const categories = await Category.find().sort({ courseCount: -1 });
    
    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalCourses,
          totalEnrollments,
          publishedCourses,
        },
        revenueData,
        categories,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Get recent activities
// @route   GET /api/admin/activities
// @access  Private (Admin)
export const getActivities = async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    
    const activities = await Activity.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('userId', 'profile.name')
      .populate('courseId', 'title');
    
    res.json({
      success: true,
      count: activities.length,
      data: activities,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};
