import mongoose from 'mongoose';

let hasSetupConnectionEvents = false;
let connectionPromise: Promise<typeof mongoose> | null = null;

const connectDB = async (): Promise<void> => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (connectionPromise) {
    await connectionPromise;
    return;
  }

  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eduflow';
    connectionPromise = mongoose.connect(mongoURI);
    await connectionPromise;

    console.log(`MongoDB Connected: ${mongoose.connection.host}`);

    if (!hasSetupConnectionEvents) {
      mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err);
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('MongoDB disconnected');
      });

      hasSetupConnectionEvents = true;
    }
  } catch (error) {
    connectionPromise = null;
    console.error('MongoDB connection failed:', error);
    throw error;
  } finally {
    connectionPromise = null;
  }
};

export default connectDB;
