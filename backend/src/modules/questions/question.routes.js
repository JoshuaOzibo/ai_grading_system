import { Router } from 'express';
import questionController from './question.controller.js';
import { verifyToken, restrictTo } from '../../common/middleware/protect.js';
import { ROLES } from '../../common/constants/index.js';

const router = Router();

// Get questions by exam ID (query parameter: examId)
router.get('/', verifyToken, questionController.getQuestions);

// Add a new question to an exam (Lecturer only)
router.post('/', verifyToken, restrictTo(ROLES.LECTURER), questionController.addQuestion);

// Update a question (Lecturer only)
router.put('/:id', verifyToken, restrictTo(ROLES.LECTURER), questionController.updateQuestion);

// Delete a question (Lecturer only)
router.delete('/:id', verifyToken, restrictTo(ROLES.LECTURER), questionController.deleteQuestion);

// Generate AI suggested ideal answer and marking guide (Lecturer only)
router.post('/ai-suggest', verifyToken, restrictTo(ROLES.LECTURER), questionController.aiSuggest);

export default router;
