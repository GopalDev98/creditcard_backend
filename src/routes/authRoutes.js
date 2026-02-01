import express from 'express';
import {
  register,
  login,
  refreshToken,
  getCurrentUser,
} from '../controllers/authController.js';
import {
  registerValidator,
  loginValidator,
  refreshTokenValidator,
} from '../validators/authValidator.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', registerValidator, validate, register);
router.post('/login', loginValidator, validate, login);
router.post('/refresh', refreshTokenValidator, validate, refreshToken);

// Protected routes
router.get('/me', authenticate, getCurrentUser);

export default router;
