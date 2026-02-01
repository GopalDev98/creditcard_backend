import express from 'express';
import authRoutes from './authRoutes.js';
import applicationRoutes from './applicationRoutes.js';

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

// Routes
router.use('/auth', authRoutes);
router.use('/applications', applicationRoutes);

export default router;
