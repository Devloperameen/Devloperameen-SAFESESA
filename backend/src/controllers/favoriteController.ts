import { Response } from 'express';
import Favorite from '../models/Favorite';
import Course from '../models/Course';
import { AuthRequest } from '../middleware/auth';

// @desc    Get user favorites
// @route   GET /api/favorites
// @access  Private
export const getFavorites = async (req: AuthRequest, res: Response) => {
  try {
    const favorites = await Favorite.find({ userId: req.user?._id })
      .populate({
        path: 'courseId',
        populate: {
          path: 'instructorId',
          select: 'profile.name profile.avatar',
        },
      })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: favorites.length,
      data: favorites,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Add to favorites
// @route   POST /api/favorites/:courseId
// @access  Private
export const addFavorite = async (req: AuthRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }
    
    // Check if already favorited
    const existingFavorite = await Favorite.findOne({
      userId: req.user?._id,
      courseId,
    });
    
    if (existingFavorite) {
      return res.status(400).json({
        success: false,
        message: 'Course already in favorites',
      });
    }
    
    const favorite = await Favorite.create({
      userId: req.user?._id,
      courseId,
    });
    
    res.status(201).json({
      success: true,
      data: favorite,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Remove from favorites
// @route   DELETE /api/favorites/:courseId
// @access  Private
export const removeFavorite = async (req: AuthRequest, res: Response) => {
  try {
    const favorite = await Favorite.findOneAndDelete({
      userId: req.user?._id,
      courseId: req.params.courseId,
    });
    
    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: 'Favorite not found',
      });
    }
    
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
