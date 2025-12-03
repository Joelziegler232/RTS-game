// src/app/utils/MapGenerator.ts
export type TerrainType = 'grass' | 'water' | 'sand' | 'forest';

export interface Tile {
  x: number;
  y: number;
  terrainType: TerrainType;
  buildingId?: string; // Opcional por ahora
}

export interface GameMap {
  width: number;
  height: number;
  tiles: Tile[];
}

export function generateMap(width: number, height: number): GameMap {
  // Paso 1: Crear mapa base con grass
  const tiles: Tile[] = new Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      tiles[y * width + x] = { x, y, terrainType: 'grass' };
    }
  }

  // Paso 2: Generar un río simple
  const riverStartY = Math.floor(Math.random() * height);
  for (let x = 0; x < width; x++) {
    const y = Math.min(height - 1, Math.max(0, riverStartY + Math.floor(Math.random() * 3) - 1));
    const index = y * width + x;
    tiles[index].terrainType = 'water';
    if (y > 0) tiles[(y - 1) * width + x].terrainType = 'water';
    if (y < height - 1) tiles[(y + 1) * width + x].terrainType = 'water';
  }

  // Paso 3 y 4: Arena cerca del agua y bosques en un solo loop
  const forestCount = 10;
  for (let i = 0; i < forestCount; i++) {
    const centerX = Math.floor(Math.random() * width);
    const centerY = Math.floor(Math.random() * height);
    growForest(centerX, centerY, width, height, tiles);
  }

  for (let i = 0; i < tiles.length; i++) {
    const tile = tiles[i];
    if (tile.terrainType === 'grass') {
      const neighbors = getNeighbors(tile.x, tile.y, width, height, tiles);
      if (neighbors.some(n => n.terrainType === 'water') && Math.random() < 0.3) {
        tile.terrainType = 'sand';
      }
    }
  }

  return { width, height, tiles };
}

// Helper: Obtener vecinos
function getNeighbors(x: number, y: number, width: number, height: number, tiles: Tile[]): Tile[] {
  const neighbors: Tile[] = [];
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  for (const [dx, dy] of directions) {
    const nx = x + dx;
    const ny = y + dy;
    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
      neighbors.push(tiles[ny * width + nx]);
    }
  }
  return neighbors;
}

// Helper: Expandir parches de bosque
function growForest(centerX: number, centerY: number, width: number, height: number, tiles: Tile[]) {
  const size = 5 + Math.floor(Math.random() * 5);
  for (let dy = -size; dy <= size; dy++) {
    for (let dx = -size; dx <= size; dx++) {
      const x = centerX + dx;
      const y = centerY + dy;
      if (x >= 0 && x < width && y >= 0 && y < height && Math.random() < 0.7) {
        const index = y * width + x;
        if (tiles[index].terrainType === 'grass') tiles[index].terrainType = 'forest';
      }
    }
  }
}
