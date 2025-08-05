// src/app/models/instance.ts
import mongoose, { Schema } from 'mongoose';

const userInstanceSchema = new Schema({
  userId: { type: String, required: true },
  location: {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
  },
  resources: [
    {
      resource: { type: String, required: true },
      amount: { type: Number, required: true },
    },
  ],
  buildings: [
    {
      id: { type: Number, required: true },
      name: { type: String, required: true },
      type: { type: String, required: true },
      position: {
        x: { type: Number, required: true },
        y: { type: Number, required: true },
      },
      obreros: { type: Number, required: true },
      aumentar: { type: Boolean, default: false },
      precio: { type: Number, default: 0 },
      produccion_hora: { type: Number, default: 0 },
      level: { type: Number, default: 1 },
      desbloqueo: { type: Number, default: 1 },
      maxObreros: { type: Number, default: 1 },
      maxCap: { type: Number, default: 0 },
      producing: { type: String, default: '' },
      spriteImage: { type: String, default: '' },
    },
  ],
  units: [
    {
      id: { type: Number, required: true },
      name: { type: String, required: true },
      position: {
        x: { type: Number, required: true },
        y: { type: Number, required: true },
      },
    },
  ],
  aumentadores: [
    {
      buildingId: { type: Number, required: true },
      timestamp: { type: Date, required: true },
    },
  ],
}, {
  timestamps: true,
});

export default mongoose.models.UserInstance || mongoose.model('UserInstance', userInstanceSchema);