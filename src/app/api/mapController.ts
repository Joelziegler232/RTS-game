// app/api/mapController.ts
import { MapModel } from "../../../src/app/models/map"; // Asegúrate de tener la ruta correcta
import * as perlin from "perlin-noise";

const GRID_SIZE = 100; // Tamaño de la cuadrícula

function mapNoiseToResource(noiseValue: number): string {
  if (noiseValue < -0.5) return "water";
  if (noiseValue < 0) return "plains";
  if (noiseValue < 0.5) return "forest";
  return "mountain";
}

function generateMap(gridSize: number): string[][] {
  const perlinGrid = perlin.generatePerlinNoise(gridSize, gridSize, { octaveCount: 4 });
  return Array.from({ length: gridSize }, (_, y) =>
    Array.from({ length: gridSize }, (_, x) =>
      mapNoiseToResource(perlinGrid[y * gridSize + x])
    )
  );
}

export const createMap = async () => {
    try {
      const grid = generateMap(GRID_SIZE);
      const newMap = new MapModel({ grid });
      await newMap.save();
      return newMap;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message); // Ahora TypeScript sabe que `error` es un `Error`
      } else {
        throw new Error("Un error desconocido ocurrió");
      }
    }
  };
  
  export const getMaps = async () => {
    try {
      return await MapModel.find().sort({ createdAt: -1 });
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message); // Ahora TypeScript sabe que `error` es un `Error`
      } else {
        throw new Error("Un error desconocido ocurrió");
      }
    }
  };
  
