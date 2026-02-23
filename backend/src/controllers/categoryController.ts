import { Response } from 'express';
import { validationResult } from 'express-validator';
import Category from '../models/Category';
import Course from '../models/Course';
import { AuthRequest } from '../middleware/auth';

const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req: AuthRequest, res: Response) => {
  try {
    const statusParam = (req.query.status as string | undefined) || 'public';

    let statusQuery: any = {};
    if (statusParam === 'public') {
      statusQuery = { status: { $in: ['published', 'pending_unpublish'] } };
    } else if (statusParam !== 'all') {
      const statuses = statusParam.split(',').map((s) => s.trim()).filter(Boolean);
      if (statuses.length > 0) {
        statusQuery = { status: { $in: statuses } };
      }
    }

    const [categories, counts] = await Promise.all([
      Category.find().sort({ name: 1 }).lean(),
      Course.aggregate([
        { $match: statusQuery },
        { $group: { _id: '$category', courseCount: { $sum: 1 } } },
      ]),
    ]);

    const countMap = new Map<string, number>();
    counts.forEach((item) => countMap.set(item._id, item.courseCount));

    const categoriesWithExactCounts = categories.map((category) => ({
      ...category,
      courseCount: countMap.get(category.name) || 0,
    }));
    
    res.json({
      success: true,
      count: categoriesWithExactCounts.length,
      data: categoriesWithExactCounts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Create category
// @route   POST /api/categories
// @access  Private (Admin)
export const createCategory = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const name = String(req.body.name || '').trim();
    const description = req.body.description ? String(req.body.description).trim() : undefined;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required',
      });
    }

    const existingCategory = await Category.findOne({
      name: { $regex: `^${escapeRegex(name)}$`, $options: 'i' },
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category already exists',
      });
    }

    const category = await Category.create({
      name,
      description,
    });
    
    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private (Admin)
export const updateCategory = async (req: AuthRequest, res: Response) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    const previousName = category.name;

    if (req.body.name !== undefined) {
      const nextName = String(req.body.name).trim();
      if (!nextName) {
        return res.status(400).json({
          success: false,
          message: 'Category name is required',
        });
      }
      const existingCategory = await Category.findOne({
        _id: { $ne: category._id },
        name: { $regex: `^${escapeRegex(nextName)}$`, $options: 'i' },
      });

      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Category already exists',
        });
      }

      category.name = nextName;
    }

    if (req.body.description !== undefined) {
      category.description = String(req.body.description || '').trim();
    }

    await category.save();

    if (previousName !== category.name) {
      await Course.updateMany({ category: previousName }, { category: category.name });
    }
    
    res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private (Admin)
export const deleteCategory = async (req: AuthRequest, res: Response) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }
    
    const courseCount = await Course.countDocuments({ category: category.name });
    if (courseCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category with existing courses',
      });
    }
    
    await category.deleteOne();
    
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
