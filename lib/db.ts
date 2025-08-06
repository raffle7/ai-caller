import { MongoClient } from 'mongodb';
import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error('Please define the MONGODB_URI in .env.local');
}

// Type declaration for globalThis
declare global {
  // eslint-disable-next-line no-var
  var _mongo: {
    client?: Promise<MongoClient>;
    mongoose?: {
      conn: mongoose.Connection | null;
      promise: Promise<mongoose.Connection> | null;
    };
  };
}

// Prevent hot reload issues in dev
if (!global._mongo) {
  global._mongo = {
    client: undefined,
    mongoose: {
      conn: null,
      promise: null,
    },
  };
}

// Native MongoDB Client (used for NextAuth adapter)
if (!global._mongo.client) {
  const client = new MongoClient(uri);
  global._mongo.client = client.connect();
}

export const clientPromise = global._mongo.client!;

// Mongoose connection (used for Mongoose models)
export async function connectDB() {
  if (global._mongo.mongoose?.conn) return global._mongo.mongoose.conn;

  if (!global._mongo.mongoose?.promise) {
    global._mongo.mongoose = {
      conn: null,
      promise: mongoose.connect(uri, { bufferCommands: false }).then((mongoose) => mongoose.connection),
    };
  }

  const conn = await global._mongo.mongoose.promise;
  global._mongo.mongoose.conn = conn;
  return conn;
}
