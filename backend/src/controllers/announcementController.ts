import { Response } from 'express';
import { validationResult } from 'express-validator';
import Announcement from '../models/Announcement';
import { AuthRequest } from '../middleware/auth';

// @desc    Get all announcements
// @route   GET /api/announcements
// @access  Public
export const getAnnouncements = async (req: AuthRequest, res: Response) => {
  try {
    const { active } = req.query;
    
    const query: any = {};
    if (active === 'true') {
      query.active = true;
    }
    
    const announcements = await Announcement.find(query).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: announcements.length,
      data: announcements,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Create announcement
// @route   POST /api/announcements
// @access  Private (Admin)
export const createAnnouncement = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    const announcement = await Announcement.create(req.body);
    
    res.status(201).json({
      success: true,
      data: announcement,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Update announcement
// @route   PUT /api/announcements/:id
// @access  Private (Admin)
export const updateAnnouncement = async (req: AuthRequest, res: Response) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found',
      });
    }
    
    res.json({
      success: true,
      data: announcement,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Private (Admin)
export const deleteAnnouncement = async (req: AuthRequest, res: Response) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found',
      });
    }
    
    await announcement.deleteOne();
    
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

// @desc    Toggle announcement active status
// @route   PUT /api/announcements/:id/active
// @access  Private (Admin)
export const toggleActive = async (req: AuthRequest, res: Response) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found',
      });
    }
    
    announcement.active = !announcement.active;
    await announcement.save();
    
    res.json({
      success: true,
      data: announcement,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};
