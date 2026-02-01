import express from 'express';
import {
  submitApplication,
  getApplication,
  getMyApplications,
  getApplications,
  trackApplicationByNumber,
  updateApplication,
} from '../controllers/applicationController.js';
import {
  submitApplicationValidator,
  updateApplicationValidator,
} from '../validators/applicationValidator.js';
import { validate } from '../middleware/validate.js';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Public/optional auth routes
router.post(
  '/',
  optionalAuth,
  submitApplicationValidator,
  validate,
  submitApplication
);
router.get('/track/:applicationNumber', trackApplicationByNumber);

// Protected user routes
router.get('/my', authenticate, getMyApplications);
router.get('/:id', authenticate, getApplication);

// Protected admin routes
router.get('/', authenticate, authorize('admin'), getApplications);
router.patch(
  '/:id',
  authenticate,
  authorize('admin'),
  updateApplicationValidator,
  validate,
  updateApplication
);

export default router;
