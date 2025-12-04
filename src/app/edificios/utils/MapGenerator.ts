
export type TerrainType = 'grass' | 'water' | 'sand' | 'forest';

// Representa una casilla individual del mapa
export interface Tile {
  x: number;                    
  y: number;                    
  terrainType: TerrainType;     
  buildingId?: string;         
}

// Estructura final del mapa generado
export interface GameMap {
  width: number;
  height: number;
  tiles: Tile[];
}

// =============================================
// GENERADOR PRINCIPAL DEL MAPA
// =============================================
export function generateMap(width: number, height: number): GameMap {
  // 1. Crear mapa base completamente de hierba (grass)
  const tiles: Tile[] = new Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      tiles[y * width + x] = { x, y, terrainType: 'grass' };
    }
  }

  // 2. Generar un río diagonal aleatorio con grosor variable
  const riverStartY = Math.floor(Math.random() * height);
  for (let x = 0; x < width; x++) {
    // Simula un río natural con pequeñas variaciones en Y
    const y = Math.min(height - 1, Math.max(0, riverStartY + Math.floor(Math.random() * 3) - 1));
    const index = y * width + x;

    // Casilla central + una arriba y abajo → río de 3 de ancho
    tiles[index].terrainType = 'water';
    if (y > 0) tiles[(y - 1) * width + x].terrainType = 'water';
    if (y < height - 1) tiles[(y + 1) * width + x].terrainType = 'water';
  }

  // 3. Generar 10 parches de bosque aleatorios
  const forestCount = 10;
  for (let i = 0; i < forestCount; i++) {
    const centerX = Math.floor(Math.random() * width);
    const centerY = Math.floor(Math.random() * height);
    growForest(centerX, centerY, width, height, tiles);
  }

  // 4. Convertir hierba cercana al agua en arena (playas naturales)
  for (let i = 0; i < tiles.length; i++) {
    const tile = tiles[i];
    if (tile.terrainType === 'grass') {
      const neighbors = getNeighbors(tile.x, tile.y, width, height, tiles);
      // 30% de probabilidad si tiene un vecino de agua
      if (neighbors.some(n => n.terrainType === 'water') && Math.random() < 0.3) {
        tile.terrainType = 'sand';
      }
    }
  }

  return { width, height, tiles };
}

// =============================================
// HELPERS
// =============================================

// Devuelve los 4 vecinos cardinales (arriba, abajo, izquierda, derecha)
function getNeighbors(
  x: number,
  y: number,
  width: number,
  height: number,
  tiles: Tile[]
): Tile[] {
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

// Crea un parche de bosque orgánico alrededor de un punto central
function growForest(
  centerX: number,
  centerY: number,
  width: number,
  height: number,
  tiles: Tile[]
) {
  const size = 5 + Math.floor(Math.random() * 5); // Radio entre 5 y 9

  for (let dy = -size; dy <= size; dy++) {
    for (let dx = -size; dx <= size; dx++) {
      const x = centerX + dx;
      const y = centerY + dy;

      if (x >= 0 && x < width && y >= 0 && y < height) {
        // 70% de probabilidad → forma orgánica, no cuadrada
        if (Math.random() < 0.7) {
          const index = y * width + x;
          if (tiles[index].terrainType === 'grass') {
            tiles[index].terrainType = 'forest';
          }
        }
      }
    }
  }
}