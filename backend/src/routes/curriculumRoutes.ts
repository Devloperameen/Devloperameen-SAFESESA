import express from 'express';
import {
    getCurriculum,
    upsertCurriculum,
    patchCurriculum,
    deleteCurriculum,
} from '../controllers/curriculumController';
import { protect, checkRole, optionalProtect } from '../middleware/auth';

const router = express.Router();

/**
 * GET  /api/curriculum/:courseId
 *   Public route — but videoUrls are hidden for non-enrolled / non-instructor users.
 *   Uses optionalProtect so auth context is available when present.
 */
router.get('/:courseId', optionalProtect, getCurriculum);

/**
 * POST /api/curriculum/:courseId
 *   Full create/replace — Instructor or Admin only.
 */
router.post(
    '/:courseId',
    protect,
    checkRole('instructor', 'admin'),
    upsertCurriculum,
);

/**
 * PATCH /api/curriculum/:courseId
 *   Partial update — Instructor or Admin only.
 */
router.patch(
    '/:courseId',
    protect,
    checkRole('instructor', 'admin'),
    patchCurriculum,
);

/**
 * DELETE /api/curriculum/:courseId
 *   Delete curriculum — Instructor or Admin only.
 */
router.delete(
    '/:courseId',
    protect,
    checkRole('instructor', 'admin'),
    deleteCurriculum,
);

export default router;
