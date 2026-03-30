import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI as string;

// Global cache to prevent multiple connections during Next.js hot reload
declare global {
    // eslint-disable-next-line no-var
    var mongooseCache: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
}

let cached = global.mongooseCache;

if (!cached) {
    cached = global.mongooseCache = { conn: null, promise: null };
}

export async function connectMongoDB(): Promise<typeof mongoose | null> {
    if (!MONGODB_URI) {
        console.warn('MONGODB_URI is not defined. Skipping MongoDB connection.');
        return null;
    }

    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI, {
            bufferCommands: false,
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
