import { MongoClient } from 'mongodb';
import mongoose from 'mongoose';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MONGODB_URI to .env.local');
}

const uri = process.env.MONGODB_URI;

// Global types for MongoDB connections
declare global {
  var mongoPromise: {
    client: Promise<MongoClient> | undefined;
    mongoose: {
      conn: mongoose.Connection | null;
      promise: Promise<mongoose.Connection> | null;
    };
  }
}

// Initialize global connection state
if (!global.mongoPromise) {
  global.mongoPromise = {
    client: undefined,
    mongoose: {
      conn: null,
      promise: null
    }
  };
}

// For NextAuth.js (MongoDB native client)
if (!global.mongoPromise.client) {
  const client = new MongoClient(uri);
  global.mongoPromise.client = client.connect();
}
export const clientPromise = global.mongoPromise.client;

// For Mongoose models
export async function connectDB() {
  try {
    // Return existing connection if available
    if (global.mongoPromise.mongoose.conn) {
      return global.mongoPromise.mongoose.conn;
    }

    // Create new connection if none exists
    if (!global.mongoPromise.mongoose.promise) {
      const opts = {
        bufferCommands: false,
      };

      global.mongoPromise.mongoose.promise = mongoose.connect(uri, opts).then((mongoose) => {
        return mongoose.connection;
      });
    }

    // Wait for connection
    const conn = await global.mongoPromise.mongoose.promise;
    global.mongoPromise.mongoose.conn = conn;
    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    global.mongoPromise.mongoose.promise = null;
    throw error;
  }
}
