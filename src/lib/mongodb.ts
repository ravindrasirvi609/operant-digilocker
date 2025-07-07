import mongoose, { Mongoose } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

console.log(MONGODB_URI);

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

interface MongooseGlobal {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

// Use globalThis for type safety
const cached: MongooseGlobal = (
  globalThis as unknown as { mongoose?: MongooseGlobal }
).mongoose ?? { conn: null, promise: null };

if (!(globalThis as unknown as { mongoose?: MongooseGlobal }).mongoose) {
  (globalThis as unknown as { mongoose?: MongooseGlobal }).mongoose = cached;
}

async function dbConnect(): Promise<Mongoose> {
  if (cached.conn) {
    return cached.conn;
  }
  console.log("Connecting to MongoDB");

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false,
      })
      .then((mongooseInstance: Mongoose) => {
        return mongooseInstance;
      });
    console.log("Connected to MongoDB");
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
