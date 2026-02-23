import { Response } from 'express';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';
import Course from '../models/Course';
import Enrollment from '../models/Enrollment';
import Category from '../models/Category';
import Activity from '../models/Activity';
import Review from '../models/Review';
import { AuthRequest } from '../middleware/auth';

interface MonthBucket {
  year: number;
  month: number;
  label: string;
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

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
export const getCourses = async (req: AuthRequest, res: Response) => {
  try {
    const { category, search, status, level, featured, free } = req.query;
    
    const query: any = {};
    
    const publicStatuses = ['published', 'pending_unpublish'];

    // Public users only see published content and courses pending unpublish approval.
    if (status) {
      if (req.user?.role === 'admin') {
        query.status = status;
      } else if (publicStatuses.includes(String(status))) {
        query.status = status;
      } else {
        query.status = { $in: publicStatuses };
      }
    } else {
      query.status = { $in: publicStatuses };
    }
    
    if (category) query.category = category;
    if (level) query.level = level;
    if (featured === 'true') query.isFeatured = true;
    if (free === 'true') query.price = 0;
    
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

    const isPubliclyVisible = course.status === 'published' || course.status === 'pending_unpublish';
    const instructorRef: any = course.instructorId as any;
    const ownerId =
      instructorRef && typeof instructorRef === 'object' && instructorRef._id
        ? instructorRef._id.toString()
        : course.instructorId.toString();
    const isOwner =
      req.user &&
      (req.user.role === 'admin' || ownerId === req.user._id.toString());

    if (!isPubliclyVisible && !isOwner) {
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
    
    const payload: any = {
      title: req.body.title,
      shortDescription: req.body.shortDescription,
      description: req.body.description,
      previewVideoUrl: req.body.previewVideoUrl,
      price: req.body.price,
      category: req.body.category,
      level: req.body.level || 'beginner',
      thumbnail: req.body.thumbnail,
      sections: req.body.sections || [],
      instructorId: req.user?._id,
      status: 'draft',
    };

    const course = await Course.create(payload);
    
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

    const updateData: any = {
      title: req.body.title,
      shortDescription: req.body.shortDescription,
      description: req.body.description,
      previewVideoUrl: req.body.previewVideoUrl,
      price: req.body.price,
      category: req.body.category,
      level: req.body.level,
      thumbnail: req.body.thumbnail,
      sections: req.body.sections,
    };

    // Remove undefined fields to avoid overwriting existing values.
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    // Only admins can directly set moderation status.
    if (req.user?.role === 'admin') {
      if (req.body.status !== undefined) updateData.status = req.body.status;
      if (req.body.rejectionReason !== undefined) updateData.rejectionReason = req.body.rejectionReason;
    }
    
    course = await Course.findByIdAndUpdate(req.params.id, updateData, {
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

// @desc    Submit course for publish approval
// @route   PUT /api/courses/:id/submit
// @access  Private (Instructor - own courses)
export const submitCourseForReview = async (req: AuthRequest, res: Response) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    if (course.instructorId.toString() !== req.user?._id.toString() && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to submit this course',
      });
    }

    if (course.status === 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Course is already pending approval',
      });
    }

    if (course.status === 'published') {
      return res.status(400).json({
        success: false,
        message: 'Course is already published',
      });
    }

    if (course.status === 'pending_unpublish') {
      return res.status(400).json({
        success: false,
        message: 'Course already has an unpublish request pending',
      });
    }

    course.status = 'pending';
    course.rejectionReason = undefined;
    await course.save();

    await Activity.create({
      type: 'publish',
      message: `Course "${course.title}" submitted for publishing approval`,
      userId: req.user?._id,
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

// @desc    Request course unpublish approval
// @route   PUT /api/courses/:id/request-unpublish
// @access  Private (Instructor - own courses)
export const requestCourseUnpublish = async (req: AuthRequest, res: Response) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    if (course.instructorId.toString() !== req.user?._id.toString() && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this course',
      });
    }

    if (course.status !== 'published') {
      return res.status(400).json({
        success: false,
        message: 'Only published courses can request unpublish approval',
      });
    }

    course.status = 'pending_unpublish';
    await course.save();

    await Activity.create({
      type: 'publish',
      message: `Course "${course.title}" requested unpublish approval`,
      userId: req.user?._id,
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
    const [courses, revenueTotalRow] = await Promise.all([
      Course.find({ instructorId: req.user?._id }),
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
        { $match: { 'course.instructorId': req.user?._id } },
        {
          $group: {
            _id: null,
            total: { $sum: '$course.price' },
          },
        },
      ]),
    ]);
    
    const totalStudents = courses.reduce((sum, course) => sum + course.students, 0);
    const totalCourses = courses.length;
    const avgRating = courses.length > 0
      ? courses.reduce((sum, course) => sum + course.rating, 0) / courses.length
      : 0;
    const totalEarnings = Number(revenueTotalRow[0]?.total) || 0;
    
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

// @desc    Get instructor revenue analytics
// @route   GET /api/courses/instructor/revenue
// @access  Private (Instructor)
export const getInstructorRevenue = async (req: AuthRequest, res: Response) => {
  try {
    const revenueRows = await Enrollment.aggregate([
      {
        $lookup: {
          from: 'courses',
          localField: 'courseId',
          foreignField: '_id',
          as: 'course',
        },
      },
      { $unwind: '$course' },
      { $match: { 'course.instructorId': req.user?._id } },
      {
        $group: {
          _id: {
            year: { $year: '$enrolledAt' },
            month: { $month: '$enrolledAt' },
          },
          earnings: { $sum: '$course.price' },
          enrollments: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const buckets = buildRecentMonthBuckets(6);
    const revenueMap = new Map<string, { earnings: number; enrollments: number }>();

    revenueRows.forEach((row: any) => {
      const key = `${row._id.year}-${row._id.month}`;
      revenueMap.set(key, {
        earnings: Number(row.earnings) || 0,
        enrollments: Number(row.enrollments) || 0,
      });
    });

    const monthly = buckets.map((bucket) => {
      const key = `${bucket.year}-${bucket.month}`;
      const item = revenueMap.get(key);
      return {
        month: bucket.label,
        earnings: item?.earnings || 0,
        enrollments: item?.enrollments || 0,
      };
    });

    const totalEarnings = revenueRows.reduce(
      (sum: number, row: any) => sum + (Number(row.earnings) || 0),
      0,
    );

    const thisMonth = monthly[monthly.length - 1]?.earnings || 0;
    const lastMonth = monthly[monthly.length - 2]?.earnings || 0;

    res.json({
      success: true,
      data: {
        summary: {
          thisMonth,
          lastMonth,
          lifetime: totalEarnings,
        },
        monthly,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Get course reviews
// @route   GET /api/courses/:id/reviews
// @access  Public
export const getCourseReviews = async (req: AuthRequest, res: Response) => {
  try {
    const reviews = await Review.find({ courseId: req.params.id })
      .sort({ createdAt: -1 })
      .populate('studentId', 'profile.name profile.avatar');

    res.json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Get current student's review for a course
// @route   GET /api/courses/:id/reviews/me
// @access  Private (Student)
export const getMyCourseReview = async (req: AuthRequest, res: Response) => {
  try {
    const review = await Review.findOne({
      courseId: req.params.id,
      studentId: req.user?._id,
    }).populate('studentId', 'profile.name profile.avatar');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    res.json({
      success: true,
      data: review,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Create or update course review
// @route   POST /api/courses/:id/reviews
// @access  Private (Student)
export const upsertCourseReview = async (req: AuthRequest, res: Response) => {
  try {
    const ratingValue = Number(req.body.rating);
    const commentValue = String(req.body.comment || '').trim();

    if (!Number.isFinite(ratingValue) || ratingValue < 1 || ratingValue > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be a number between 1 and 5',
      });
    }

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    const enrollment = await Enrollment.findOne({
      courseId: req.params.id,
      studentId: req.user?._id,
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'You must enroll in this course before reviewing',
      });
    }

    if (enrollment.progress < 100) {
      return res.status(400).json({
        success: false,
        message: 'Complete the full course before submitting a review',
      });
    }

    const review = await Review.findOneAndUpdate(
      {
        courseId: req.params.id,
        studentId: req.user?._id,
      },
      {
        rating: ratingValue,
        comment: commentValue,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    ).populate('studentId', 'profile.name profile.avatar');

    const reviewStats = await Review.aggregate([
      {
        $match: {
          courseId: new mongoose.Types.ObjectId(req.params.id),
        },
      },
      {
        $group: {
          _id: '$courseId',
          avgRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 },
        },
      },
    ]);

    const nextAvgRating = Math.round(((Number(reviewStats[0]?.avgRating) || 0) * 10)) / 10;
    const nextReviewCount = Number(reviewStats[0]?.reviewCount) || 0;

    await Course.findByIdAndUpdate(req.params.id, {
      rating: nextAvgRating,
      reviewCount: nextReviewCount,
    });

    await Activity.create({
      type: 'review',
      message: `${req.user?.profile.name} reviewed "${course.title}"`,
      userId: req.user?._id,
      courseId: course._id,
      metadata: {
        rating: ratingValue,
      },
    });

    res.json({
      success: true,
      data: review,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};
