import express from 'express';
import mongoose from 'mongoose';
import authRoutes from './authRoutes.js';
import applicationRoutes from './applicationRoutes.js';

const router = express.Router();

// Simple ping endpoint (lightweight check)
router.get('/ping', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'pong',
    timestamp: new Date().toISOString()
  });
});

// Enhanced Health check endpoint
router.get('/health', (req, res) => {
  const healthCheck = {
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())} seconds`,
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      readyState: mongoose.connection.readyState,
      name: mongoose.connection.name || 'N/A',
    },
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
      rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + ' MB',
    },
    server: {
      nodeVersion: process.version,
      platform: process.platform,
      pid: process.pid,
    },
  };

  // Return 503 if database is not connected
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      ...healthCheck,
      success: false,
      message: 'Service degraded - Database not connected',
    });
  }

  res.status(200).json(healthCheck);
});

// Routes
router.use('/auth', authRoutes);
router.use('/applications', applicationRoutes);

export default router;
