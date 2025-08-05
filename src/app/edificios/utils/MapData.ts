// src/app/utils/MapData.ts
export type TerrainType = 'grass' | 'water' | 'sand' | 'forest';

export interface Tile {
  x: number;
  y: number;
  terrainType: TerrainType;
  buildingId?: string; // Para conectar con tus edificios (opcional por ahora)
}

export interface GameMap {
  width: number;
  height: number;
  tiles: Tile[];
}