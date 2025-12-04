
import mongoose, { Connection } from "mongoose";

const { MONGODB_URI } = process.env;

if (!MONGODB_URI) {
  throw new Error(
    "Por favor define la variable de entorno MONGODB_URI en tu .env.local"
  );
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
      .connect(MONGODB_URI!, {
        bufferCommands: false, 
      })
      .then(async (mongooseInstance) => {
        console.log("Conectado a MongoDB correctamente");

        await import('@/app/models/user');

        if (!mongoose.models.users) {
          const UserSchema = (await import('@/app/models/user')).default.schema;
          mongoose.model('users', UserSchema);
        }

        return mongooseInstance.connection;
      })
      .catch((err) => {
        console.error("Error al conectar con MongoDB:", err);
        cached.promise = null; 
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}