import { Router } from 'express';
import analyticsController from './analytics.controller.js';
import { verifyToken, restrictTo } from '../../common/middleware/protect.js';
import { ROLES } from '../../common/constants/index.js';

const router = Router();

// Retrieve analytics for a specific exam (Lecturers or Admins only)
router.get('/exam/:examId', verifyToken, restrictTo(ROLES.LECTURER, ROLES.ADMIN), analyticsController.getExamAnalytics);

// Retrieve global system statistics (Admins only)
router.get('/global', verifyToken, restrictTo(ROLES.ADMIN), analyticsController.getGlobalAnalytics);

export default router;
