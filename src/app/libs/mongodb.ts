// Importa el paquete mongoose para interactuar con MongoDB
import mongoose from "mongoose";

// Extrae la URI de MongoDB de las variables de entorno
const { MONGODB_URI } = process.env;

// Verifica si se proporcionó la URI de MongoDB
if (!MONGODB_URI) {
  // Lanza un error si la URI no está definida
  throw new Error("No MONGODB_URI provided");
}

// Exporta una función asincrónica llamada connect que devuelve una promesa booleana
export const connect = async (): Promise<boolean> => {
  try {
    // Intenta conectar a la base de datos MongoDB utilizando la URI proporcionada
    const { connection } = await mongoose.connect(MONGODB_URI);

    // Verifica el estado de la conexión
    if (connection.readyState === 1) {
      // Si la conexión se establece correctamente, imprime un mensaje de éxito en la consola
      console.log("Connected to MongoDB");
      // Devuelve true para indicar una conexión exitosa
      return true;
    } else {
      // Si la conexión falla, imprime un mensaje de error en la consola
      console.error("Connection failed");
      // Devuelve false para indicar una conexión fallida
      return false;
    }
  } catch (error: unknown) {
    // Captura cualquier error que ocurra durante el intento de conexión
    if (error instanceof Error) {
      console.error("Error connecting to MongoDB:", error.message);
    } else {
      console.error("An unknown error occurred during MongoDB connection");
    }
    // Devuelve false para indicar una conexión fallida
    return false;
  }
};
