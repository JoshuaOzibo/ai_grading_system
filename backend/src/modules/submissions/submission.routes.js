import { Router } from 'express';
import submissionController from './submission.controller.js';
import { verifyToken } from '../../common/middleware/protect.js';

const router = Router();

// Retrieve all submissions of the logged-in student
router.get('/', verifyToken, submissionController.getMySubmissions);

// Retrieve specific submission details (results & feedback)
router.get('/:id', verifyToken, submissionController.getSubmissionDetails);

export default router;
