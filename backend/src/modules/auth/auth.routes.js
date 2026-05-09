import { Router } from 'express';
import authController from './auth.controller.js';
import { registerSchema, loginSchema } from './auth.validation.js';
import { verifyToken } from '../../common/middleware/protect.js';

const router = Router();

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: error.errors,
    });
  }
};

router.post('/register', validate(registerSchema), (req, res) => authController.register(req, res));
router.post('/login', validate(loginSchema), (req, res) => authController.login(req, res));
router.post('/logout', (req, res) => authController.logout(req, res));

router.get('/me', verifyToken, (req, res) => authController.me(req, res));

export default router;
