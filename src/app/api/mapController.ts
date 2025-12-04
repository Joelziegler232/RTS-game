// src/app/api/mapController.ts
import { MapModel } from "../models/map";
import * as perlin from "perlin-noise";

// Tamaño del mapa (100x100)
const GRID_SIZE = 100;

// Convierte un valor de ruido Perlin en un tipo de terreno
export function mapNoiseToResource(noiseValue: number): string {
  if (noiseValue < 0.1) return "water";
  if (noiseValue < 0.4) return "sand";
  if (noiseValue < 0.6) return "plains";
  if (noiseValue < 0.75) return "forest";
  return "mountain";
}

// Genera un mapa completo de 100x100 con terrenos y recursos
export function generateMap(gridSize: number): string[][] {
  // 1) Base con ruido Perlin (6 octavas)
  const perlinGrid = perlin.generatePerlinNoise(gridSize, gridSize, { octaveCount: 6 });
  const map: string[][] = Array.from({ length: gridSize }, (_, y) =>
    Array.from({ length: gridSize }, (_, x) => mapNoiseToResource(perlinGrid[y * gridSize + x]))
  );

  // 2) Gran océano en la esquina inferior izquierda
  const oceanWidth = Math.floor(gridSize * 0.4);
  const oceanHeight = Math.floor(gridSize * 0.5);
  const oceanNoise = perlin.generatePerlinNoise(gridSize, gridSize, { octaveCount: 5 });
  for (let y = gridSize - oceanHeight; y < gridSize; y++) {
    for (let x = 0; x < oceanWidth; x++) {
      const distX = x / oceanWidth;
      const distY = (y - (gridSize - oceanHeight)) / oceanHeight;
      const distance = Math.sqrt(distX * distX + distY * distY);
      if (oceanNoise[y * gridSize + x] < 0.7 - 0.5 * distance) {
        map[y][x] = "water";
      }
    }
  }

  // 3) Río principal que cruza el mapa 
  const riverY = Math.floor(gridSize / 2) + Math.floor(Math.random() * 10 - 5);
  for (let x = 0; x < gridSize; x++) {
    const yVariation = Math.floor(Math.sin(x / 10) * 5);
    for (let dy = -2; dy <= 2; dy++) {
      const ny = riverY + yVariation + dy;
      if (ny >= 0 && ny < gridSize) map[ny][x] = "water";
    }
  }

  // 4) 3 lagos pequeños aleatorios
  for (let i = 0; i < 3; i++) {
    const centerX = Math.floor(Math.random() * (gridSize - 20)) + 10;
    const centerY = Math.floor(Math.random() * (gridSize - 20)) + 10;
    const radius = 3 + Math.floor(Math.random() * 3);
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const nx = centerX + dx;
        const ny = centerY + dy;
        if (
          nx >= 0 && nx < gridSize &&
          ny >= 0 && ny < gridSize &&
          Math.sqrt(dx * dx + dy * dy) <= radius &&
          Math.random() < 0.9
        ) {
          map[ny][nx] = "water";
        }
      }
    }
  }

  // 5) Colocar recursos en los terrenos adecuados 
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const tile = map[y][x];

      if ((tile === "sand" || tile === "mountain") && Math.random() < 0.03)
        map[y][x] = "gold";
      else if (tile === "forest" && Math.random() < 0.03)
        map[y][x] = "stone";
      else if ((tile === "plains" || tile === "forest") && Math.random() < 0.03)
        map[y][x] = "berry";
      else if (tile === "sand" && Math.random() < 0.05)
        map[y][x] = "palm";
      else if ((tile === "forest" || tile === "plains") && Math.random() < 0.1)
        map[y][x] = "tree";
    }
  }

  return map;
}

// Crea y guarda un nuevo mapa en la base de datos
export const createMap = async () => {
  const grid = generateMap(GRID_SIZE);
  const newMap = new MapModel({ grid });
  await newMap.save();
  return newMap;
};

// Obtiene todos los mapas guardados (ordenados por fecha, más nuevo primero)
export const getMaps = async () => {
  return await MapModel.find().sort({ createdAt: -1 });
};