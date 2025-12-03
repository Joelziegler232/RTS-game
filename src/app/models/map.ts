// src/models/map.ts
import { Schema, model, models, Document } from "mongoose";

interface IMap extends Document {
  grid: string[][];
  createdAt: Date;
}

const mapSchema = new Schema<IMap>({
  grid: { type: [[String]], required: true },
  createdAt: { type: Date, default: Date.now },
});

// Exportar el modelo, pero solo si no existe ya
export const MapModel = models.Map || model<IMap>("Map", mapSchema);