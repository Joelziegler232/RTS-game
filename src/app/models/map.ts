// src/models/map.ts
import { Schema, model, Document } from "mongoose";

interface IMap extends Document {
  grid: string[][]; // Mapa 2D con tipos de recursos
  createdAt: Date;
}

const mapSchema = new Schema<IMap>({
  grid: { type: [[String]], required: true },
  createdAt: { type: Date, default: Date.now },
});

export const MapModel = model<IMap>("Map", mapSchema);
