import mongoose from 'mongoose';
import logger from './logger.js';

const connectDB = async () => {
  try {
    // Validate MongoDB URI exists
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not defined!');
    }
    
    logger.info('Attempting to connect to MongoDB...');
    logger.info(`MongoDB URI starts with: ${process.env.MONGODB_URI.substring(0, 30)}...`);
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Mongoose 6+ no longer needs these options
      // useNewUrlParser and useUnifiedTopology are now always true
    });

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed through app termination');
      process.exit(0);
    });

    return conn;
  } catch (error) {
    logger.error('Error connecting to MongoDB:', error.message);
    logger.error('MongoDB URI format check:', process.env.MONGODB_URI ? 'URI is set' : 'URI is MISSING!');
    logger.error('Full error details:', error);
    
    // Don't exit immediately in production - keep retrying
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    } else {
      logger.error('MongoDB connection failed, but keeping server alive...');
    }
  }
};

export default connectDB;
