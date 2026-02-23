import { Response } from 'express';
import { validationResult } from 'express-validator';
import Announcement from '../models/Announcement';
import { AuthRequest } from '../middleware/auth';

// @desc    Get all announcements
// @route   GET /api/announcements
// @access  Public
export const getAnnouncements = async (req: AuthRequest, res: Response) => {
  try {
    const { active, audience } = req.query;
    
    const query: any = {};
    if (active === 'true') {
      query.active = true;
    }

    if (audience && ['students', 'instructors', 'both'].includes(String(audience))) {
      if (String(audience) === 'both') {
        query.$or = [{ audience: 'both' }, { audience: { $exists: false } }];
      } else {
        query.audience = audience;
      }
    } else {
      if (req.user?.role === 'student') {
        query.$or = [
          { audience: { $in: ['students', 'both'] } },
          { audience: { $exists: false } },
        ];
      } else if (req.user?.role === 'instructor') {
        query.$or = [
          { audience: { $in: ['instructors', 'both'] } },
          { audience: { $exists: false } },
        ];
      } else if (!req.user) {
        query.$or = [{ audience: 'both' }, { audience: { $exists: false } }];
      }
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
    
    if (req.body.audience && !['students', 'instructors', 'both'].includes(req.body.audience)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid announcement audience',
      });
    }

    const announcement = await Announcement.create({
      title: req.body.title,
      content: req.body.content,
      active: req.body.active !== undefined ? Boolean(req.body.active) : true,
      audience: req.body.audience || 'both',
    });
    
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
    const announcement = await Announcement.findById(req.params.id);
    
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found',
      });
    }

    if (req.body.title !== undefined) {
      announcement.title = String(req.body.title).trim();
    }

    if (req.body.content !== undefined) {
      announcement.content = String(req.body.content).trim();
    }

    if (req.body.active !== undefined) {
      announcement.active = Boolean(req.body.active);
    }

    if (req.body.audience !== undefined) {
      if (!['students', 'instructors', 'both'].includes(req.body.audience)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid announcement audience',
        });
      }
      announcement.audience = req.body.audience;
    }

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
