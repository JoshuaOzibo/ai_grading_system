import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes.js';
import userRoutes from '../modules/users/user.routes.js';
import examRoutes from '../modules/exams/exam.routes.js';
import questionRoutes from '../modules/questions/question.routes.js';
import submissionRoutes from '../modules/submissions/submission.routes.js';
import analyticsRoutes from '../modules/analytics/analytics.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/exams', examRoutes);
router.use('/questions', questionRoutes);
router.use('/submissions', submissionRoutes);
router.use('/analytics', analyticsRoutes);

export default router;
