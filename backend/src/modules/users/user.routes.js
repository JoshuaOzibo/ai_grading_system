import { Router } from 'express';
import userController from './user.controller.js';
import { verifyToken, restrictTo } from '../../common/middleware/protect.js';
import { ROLES } from '../../common/constants/index.js';

const router = Router();

// Profile routes (Any authenticated user)
router.get('/profile', verifyToken, userController.getProfile);
router.patch('/profile', verifyToken, userController.updateProfile);

// Admin-only user management routes
router.get('/', verifyToken, restrictTo(ROLES.ADMIN), userController.getAllUsers);
router.patch('/:id/verify', verifyToken, restrictTo(ROLES.ADMIN), userController.verifyLecturer);

export default router;
