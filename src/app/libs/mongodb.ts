import mongoose, { Connection } from "mongoose";

const { MONGODB_URI } = process.env;

if (!MONGODB_URI) {
  throw new Error("No MONGODB_URI provided");
}

interface MongooseCache {
  conn: Connection | null;
  promise: Promise<Connection> | null;
}

let cached: MongooseCache = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = {
    conn: null,
    promise: null,
  };
}

export async function connect(): Promise<Connection> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI!)
      .then(async (mongooseInstance) => {
        console.log("Connected to MongoDB");

        // FORZAMOS EL REGISTRO DEL MODELO "users" PARA QUE EL POPULATE FUNCIONE
        await import('@/app/models/user'); // Esto registra el modelo User
        if (!mongoose.models.users) {
          const UserSchema = (await import('@/app/models/user')).default.schema;
          mongoose.model('users', UserSchema);
        }

        return mongooseInstance.connection;
      })
      .catch((err) => {
        console.error("MongoDB connection error:", err);
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}