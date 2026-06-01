import { Router } from 'express';
import examController from './exam.controller.js';
import { verifyToken, restrictTo } from '../../common/middleware/protect.js';
import { ROLES } from '../../common/constants/index.js';

const router = Router();

// Retrieve all exams (authenticated users - students see published, lecturers see theirs, admins see all)
router.get('/', verifyToken, examController.getExams);

// Retrieve details of a specific exam
router.get('/:id', verifyToken, examController.getExamById);

// Create a new exam draft (Lecturers only)
router.post('/', verifyToken, restrictTo(ROLES.LECTURER), examController.createExam);

// Update a draft exam details (Lecturers only)
router.put('/:id', verifyToken, restrictTo(ROLES.LECTURER), examController.updateExam);

// Publish a draft exam (Lecturers only)
router.patch('/:id/publish', verifyToken, restrictTo(ROLES.LECTURER), examController.publishExam);

// Delete an exam (Lecturer creator or Admin)
router.delete('/:id', verifyToken, restrictTo(ROLES.LECTURER, ROLES.ADMIN), examController.deleteExam);

export default router;
