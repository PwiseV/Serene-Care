import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      // If you still have DNS +srv issues, you can enforce IPv4 by un-commenting the line below
      // family: 4 
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      console.log("✅ Successfully connected to MongoDB");
      return mongoose;
    }).catch(err => {
        console.error("❌ Error connecting to MongoDB:", err.message);
        throw err;
    });
  }
  
  try {
      cached.conn = await cached.promise;
  } catch (e) {
      cached.promise = null;
      throw e;
  }

  return cached.conn;
}

export default connectToDatabase;
