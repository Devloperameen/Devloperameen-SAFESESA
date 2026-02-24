import { Response } from 'express';
import mongoose from 'mongoose';
import User from '../models/User';
import Course from '../models/Course';
import Activity from '../models/Activity';
import Enrollment from '../models/Enrollment';
import Transaction from '../models/Transaction';
import { AuthRequest } from '../middleware/auth';

interface MonthBucket {
  year: number;
  month: number;
  label: string;
}

interface ParsedPagination {
  page: number;
  limit: number;
  skip: number;
}

const buildRecentMonthBuckets = (monthCount: number): MonthBucket[] => {
  const now = new Date();
  const buckets: MonthBucket[] = [];

  for (let offset = monthCount - 1; offset >= 0; offset -= 1) {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - offset, 1));
    buckets.push({
      year: date.getUTCFullYear(),
      month: date.getUTCMonth() + 1,
      label: date.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' }),
    });
  }

  return buckets;
};

const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const parsePagination = (pageValue: unknown, limitValue: unknown, defaults?: { limit?: number; maxLimit?: number }): ParsedPagination => {
  const defaultLimit = defaults?.limit || 20;
  const maxLimit = defaults?.maxLimit || 100;

  const parsedPage = Number.parseInt(String(pageValue || '1'), 10);
  const parsedLimit = Number.parseInt(String(limitValue || String(defaultLimit)), 10);

  const page = Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
  const limit = Number.isNaN(parsedLimit) || parsedLimit < 1
    ? defaultLimit
    : Math.min(parsedLimit, maxLimit);

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { search, role, status, page, limit } = req.query;

    const query: any = {};
    if (role) query.role = role;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { 'profile.name': { $regex: search, $options: 'i' } },
      ];
    }

    const pagination = parsePagination(page, limit, { limit: 20, maxLimit: 100 });
    const total = await User.countDocuments(query);

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit);

    res.json({
      success: true,
      count: users.length,
      total,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / pagination.limit)),
        hasNext: pagination.page * pagination.limit < total,
        hasPrev: pagination.page > 1,
      },
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

// @desc    Get all courses for moderation
// @route   GET /api/admin/courses
// @access  Private (Admin)
export const getCoursesForModeration = async (req: AuthRequest, res: Response) => {
  try {
    const { search, status, category, featured, instructorId, page, limit } = req.query;

    const query: any = {};

    if (status) {
      const statuses = String(status)
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
      if (statuses.length === 1) {
        query.status = statuses[0];
      } else if (statuses.length > 1) {
        query.status = { $in: statuses };
      }
    }

    if (category) {
      query.category = category;
    }

    if (featured === 'true') {
      query.isFeatured = true;
    } else if (featured === 'false') {
      query.isFeatured = false;
    }

    if (instructorId) {
      query.instructorId = instructorId;
    }

    if (search) {
      const regex = new RegExp(escapeRegex(String(search)), 'i');
      query.$or = [
        { title: regex },
        { shortDescription: regex },
        { description: regex },
        { category: regex },
      ];
    }

    const pagination = parsePagination(page, limit, { limit: 20, maxLimit: 100 });
    const total = await Course.countDocuments(query);

    const courses = await Course.find(query)
      .populate('instructorId', 'profile.name profile.avatar email')
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit);

    res.json({
      success: true,
      count: courses.length,
      total,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / pagination.limit)),
        hasNext: pagination.page * pagination.limit < total,
        hasPrev: pagination.page > 1,
      },
      data: courses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

export const manualEnroll = async (req: AuthRequest, res: Response) => {
  try {
    const { userId, courseId } = req.body;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const existing = await Enrollment.findOne({ studentId: userId, courseId });
    if (existing) return res.status(400).json({ success: false, message: 'User already enrolled' });
    const enrollment = await Enrollment.create({ studentId: userId, courseId });
    await Course.findByIdAndUpdate(courseId, { $inc: { students: 1 } });
    await Activity.create({ type: 'enrollment', message: `Admin enrolled ${user.profile.name} in ${course.title}`, userId, courseId });
    res.status(201).json({ success: true, data: enrollment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const unenroll = async (req: AuthRequest, res: Response) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id);
    if (!enrollment) return res.status(404).json({ success: false, message: 'Enrollment not found' });
    const courseId = enrollment.courseId;
    await Enrollment.findByIdAndDelete(req.params.id);
    await Course.findByIdAndUpdate(courseId, { $inc: { students: -1 } });
    res.json({ success: true, message: 'Unenrolled' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
// @desc    Update enrollment status (Approve/Reject)
// @route   PUT /api/admin/enrollments/:id/status
// @access  Private (Admin)
export const updateEnrollmentStatus = async (req: AuthRequest, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { status } = req.body;
    if (!['active', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const enrollment = await Enrollment.findById(req.params.id).session(session);
    if (!enrollment) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }
    if (enrollment.status !== 'pending') {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: 'Enrollment is already processed' });
    }
    const user = await User.findById(enrollment.studentId).session(session);
    const course = await Course.findById(enrollment.courseId).session(session);
    // Update enrollment
    enrollment.status = status;
    await enrollment.save({ session });
    // Find associated transaction and update it
    const transaction = await Transaction.findOne({
      userId: enrollment.studentId,
      courseId: enrollment.courseId,
      status: 'pending'
    }).session(session);
    if (transaction) {
      transaction.status = status === 'active' ? 'completed' : 'failed';
      await transaction.save({ session });
    }
    if (status === 'active') {
      // Increment students count
      await Course.findByIdAndUpdate(enrollment.courseId, { $inc: { students: 1 } }).session(session);
      // Log activity
      await Activity.create([{
        type: 'enrollment',
        message: `Admin approved enrollment for ${user?.profile.name} in "${course?.title}"`,
        userId: user?._id,
        courseId: course?._id,
      }], { session });
    } else {
      await Activity.create([{
        type: 'enrollment',
        message: `Admin rejected enrollment for ${user?.profile.name} in "${course?.title}"`,
        userId: user?._id,
        courseId: course?._id,
      }], { session });
    }
    await session.commitTransaction();
    session.endSession();
    res.json({ success: true, data: enrollment });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Update Enrollment Status Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getEnrollments = async (req: AuthRequest, res: Response) => {
  try {
    const enrollments = await Enrollment.find()
      .populate('studentId', 'profile.name email role')
      .populate('courseId', 'title')
      .sort({ enrolledAt: -1 });
    res.json({ success: true, data: enrollments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Approve/Reject course
// @route   PUT /api/admin/courses/:id/status
// @access  Private (Admin)
export const updateCourseStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { status, rejectionReason } = req.body;

    if (!['published', 'rejected', 'pending', 'draft'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }

    const existingCourse = await Course.findById(req.params.id);
    if (!existingCourse) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    const previousStatus = existingCourse.status;

    // Validate publish/unpublish moderation transitions.
    if (previousStatus === 'pending' && !['published', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Pending publish requests can only be approved (published) or rejected',
      });
    }

    if (previousStatus === 'pending_unpublish' && !['draft', 'published'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Pending unpublish requests can only be approved (draft) or rejected (published)',
      });
    }

    if (status === 'rejected' && !String(rejectionReason || '').trim()) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required when rejecting a publish request',
      });
    }

    const updateData: any = { status };
    if (status === 'rejected') {
      updateData.rejectionReason = String(rejectionReason).trim();
    } else if (status !== 'rejected') {
      updateData.rejectionReason = undefined;
    }

    const course = await Course.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('instructorId', 'profile.name');

    // Create activity
    let activityType: 'course_approved' | 'course_rejected' = 'course_approved';
    let message = `Course "${course.title}" status updated to ${status}`;

    if (previousStatus === 'pending' && status === 'published') {
      activityType = 'course_approved';
      message = `Course "${course.title}" approved for publishing`;
    } else if (previousStatus === 'pending' && status === 'rejected') {
      activityType = 'course_rejected';
      message = `Course "${course.title}" publish request rejected`;
    } else if (previousStatus === 'pending_unpublish' && status === 'draft') {
      activityType = 'course_approved';
      message = `Course "${course.title}" approved for unpublish`;
    } else if (previousStatus === 'pending_unpublish' && status === 'published') {
      activityType = 'course_rejected';
      message = `Course "${course.title}" unpublish request rejected`;
    } else if (previousStatus === 'published' && status === 'draft') {
      activityType = 'course_approved';
      message = `Course "${course.title}" unpublished by admin`;
    } else if (status === 'rejected') {
      activityType = 'course_rejected';
      message = `Course "${course.title}" rejected`;
    }

    await Activity.create({
      type: activityType,
      message,
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
    const [
      totalUsers,
      activeUsers,
      totalCourses,
      totalEnrollments,
      publishedCourses,
      revenueRows,
      categoryRows,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: 'active' }),
      Course.countDocuments(),
      Enrollment.countDocuments(),
      Course.countDocuments({ status: 'published' }),
      Enrollment.aggregate([
        {
          $lookup: {
            from: 'courses',
            localField: 'courseId',
            foreignField: '_id',
            as: 'course',
          },
        },
        { $unwind: '$course' },
        {
          $group: {
            _id: {
              year: { $year: '$enrolledAt' },
              month: { $month: '$enrolledAt' },
            },
            revenue: { $sum: '$course.price' },
            enrollments: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
      Course.aggregate([
        {
          $group: {
            _id: '$category',
            courses: { $sum: 1 },
            students: { $sum: '$students' },
          },
        },
        { $sort: { students: -1, courses: -1 } },
      ]),
    ]);

    const monthBuckets = buildRecentMonthBuckets(6);
    const revenueMap = new Map<string, { revenue: number; enrollments: number }>();

    revenueRows.forEach((row: any) => {
      const key = `${row._id.year}-${row._id.month}`;
      revenueMap.set(key, {
        revenue: Number(row.revenue) || 0,
        enrollments: Number(row.enrollments) || 0,
      });
    });

    const revenueData = monthBuckets.map((bucket) => {
      const key = `${bucket.year}-${bucket.month}`;
      const item = revenueMap.get(key);
      return {
        month: bucket.label,
        revenue: item?.revenue || 0,
        enrollments: item?.enrollments || 0,
      };
    });

    const totalRevenue = revenueRows.reduce(
      (sum: number, row: any) => sum + (Number(row.revenue) || 0),
      0,
    );

    const categories = categoryRows.map((row: any) => ({
      name: row._id || 'Uncategorized',
      courses: Number(row.courses) || 0,
      students: Number(row.students) || 0,
    }));

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          activeUsers,
          totalCourses,
          totalEnrollments,
          publishedCourses,
          totalRevenue,
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
