// src/app/models/instance.ts
import { Schema, model, models, Document } from 'mongoose';

// ===========================
// INTERFACES
// ===========================
interface IResource extends Document {
  resource: string;
  amount: number;
}

interface IBuilding extends Document {
  id: string;
  type: string;
  position: { x: number; y: number };
  updateTime?: Date;
  produccion_hora?: number;
  obreros?: number;
  maxObreros?: number;
  maxCapacity?: number;
  aumentar?: boolean;
  capacity?: number;
  aldeanos_por_casa?: number;
}

interface IUnit extends Document {
  id: string;
  type: string;
  position: { x: number; y: number };
  status: string;
}

interface IMap extends Document {
  grid: string[][];
  createdAt: Date;
}

interface IBattleReport {
  attackerId: string;
  attackerName?: string;
  timestamp: Date;
  attackerWins: boolean;        // true = el atacante ganó (defensor perdió)
  losses: number;               // soldados que perdió el defensor
  stolenResources: Record<string, number>;
  attackerTroopsSent: number;
  defenderTroops: number;
  eloChange: number;
}

interface IUserInstance extends Document {
  userId: string;
  location: { x: number; y: number };
  resources: IResource[];
  buildings: IBuilding[];
  units: IUnit[];
  aumentadores: any[];
  map: IMap;
  population: { 
    villagers: number; 
    soldiers: number;
    maxPopulation: number; 
  };
  level: number;

  // SISTEMA DE RANKING Y BATALLAS
  elo: number;
  trophies: number;
  battlesToday: number;
  lastBattleDate: Date;
  totalBattles: number;
  victories: number;

  // NUEVO: Historial de ataques recibidos
  battleReports: IBattleReport[];
}

// ===========================
// SCHEMAS
// ===========================

const resourceSchema = new Schema<IResource>({
  resource: { type: String, required: true },
  amount: { type: Number, required: true },
});

const buildingSchema = new Schema<IBuilding>({
  id: { type: String, required: true },
  type: { type: String, required: true },
  position: {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
  },
  updateTime: { type: Date },
  produccion_hora: { type: Number },
  obreros: { type: Number },
  maxObreros: { type: Number },
  maxCapacity: { type: Number },
  aumentar: { type: Boolean },
  capacity: { type: Number },
  aldeanos_por_casa: { type: Number },
});

const unitSchema = new Schema<IUnit>({
  id: { type: String, required: true },
  type: { type: String, required: true },
  position: {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
  },
  status: { type: String, default: 'idle' },
});

const mapSchema = new Schema<IMap>({
  grid: { type: [[String]], required: true },
  createdAt: { type: Date, default: Date.now },
});

// ===========================
// USER INSTANCE SCHEMA (CON HISTORIAL DE ATAQUES)
// ===========================
const userInstanceSchema = new Schema<IUserInstance>({
  userId: { type: String, required: true, unique: true },

  location: {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
  },

  resources: [resourceSchema],
  buildings: [buildingSchema],
  units: [unitSchema],
  aumentadores: [{ type: Schema.Types.Mixed }],
  map: mapSchema,

  population: {
    villagers: { type: Number, default: 0 },
    soldiers: { type: Number, default: 0 },
    maxPopulation: { type: Number, default: 0 },
  },

  level: { type: Number, default: 1 },

  // RANKING Y ESTADÍSTICAS
  elo: { type: Number, default: 1200 },
  trophies: { type: Number, default: 0 },
  battlesToday: { type: Number, default: 0 },
  lastBattleDate: { type: Date },
  totalBattles: { type: Number, default: 0 },
  victories: { type: Number, default: 0 },

  // HISTORIAL DE ATAQUES RECIBIDOS
  battleReports: [
    {
      attackerId: { type: String, required: true },
      attackerName: { type: String },
      timestamp: { type: Date, default: Date.now },
      attackerWins: { type: Boolean, required: true },
      losses: { type: Number, required: true },
      stolenResources: {
  type: {
    gold: { type: Number, default: 0 },
    food: { type: Number, default: 0 },
    lumber: { type: Number, default: 0 },
    stone: { type: Number, default: 0 },
  },
  default: { gold: 0, food: 0, lumber: 0, stone: 0 },
},
      attackerTroopsSent: { type: Number, required: true },
      defenderTroops: { type: Number, required: true },
      eloChange: { type: Number, default: 0 },
    }
  ],
});

// Índices
userInstanceSchema.index({ trophies: -1 });
userInstanceSchema.index({ "battleReports.timestamp": -1 });

export default models.UserInstance || model<IUserInstance>('UserInstance', userInstanceSchema);