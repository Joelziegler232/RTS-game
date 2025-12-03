'use client';
import { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface UnitProps {
  type: string;
  initialPosition: { x: number; y: number };
  mapWidth: number;
  mapHeight: number;
  scene: THREE.Scene;
  gameMap: string[][];
  buildings: any[];
}

export default function Unit({
  type,
  initialPosition,
  mapWidth,
  mapHeight,
  scene,
  gameMap,
  buildings,
}: UnitProps) {
  const unitRef = useRef<THREE.Sprite | null>(null);

  // Solo pueden estar en plains o grass
  const validTerrains = ['plains', 'grass'];

  // Posiciones ocupadas por edificios
  const occupiedPositions = new Set<string>();
  buildings.forEach((b) => {
    if (b.position?.x != null && b.position?.y != null) {
      const x = Math.floor(b.position.x);
      const y = Math.floor(b.position.y);
      occupiedPositions.add(`${x},${y}`);
    }
  });

  const isValidSpot = (x: number, y: number): boolean => {
    if (y < 0 || y >= gameMap.length || x < 0 || x >= gameMap[0].length) return false;
    if (!validTerrains.includes(gameMap[y][x])) return false;
    if (occupiedPositions.has(`${x},${y}`)) return false;
    return true;
  };

  const findValidPosition = (startX: number, startY: number) => {
    const sx = Math.round(startX);
    const sy = Math.round(startY);

    // 1. Posición original
    if (isValidSpot(sx, sy)) return { x: sx, y: sy };

    // 2. Búsqueda en espiral (máximo 15 casillas)
    for (let distance = 1; distance <= 15; distance++) {
      for (let dx = -distance; dx <= distance; dx++) {
        for (let dy = -distance; dy <= distance; dy++) {
          // Solo el borde del cuadrado
          if (Math.abs(dx) !== distance && Math.abs(dy) !== distance) continue;

          const x = sx + dx;
          const y = sy + dy;

          if (isValidSpot(x, y)) {
            return { x, y };
          }
        }
      }
    }

    // 3. Barrido completo del mapa (nunca falla)
    for (let y = 0; y < gameMap.length; y++) {
      for (let x = 0; x < gameMap[y].length; x++) {
        if (isValidSpot(x, y)) {
          return { x, y };
        }
      }
    }

    // Último recurso
    return { x: Math.floor(mapWidth / 2), y: Math.floor(mapHeight / 2) };
  };

  useEffect(() => {
    if (!initialPosition || !gameMap || gameMap.length === 0) return;

    const { x, y } = findValidPosition(initialPosition.x, initialPosition.y);

    const texturePath = type === 'soldier' ? '/soldado.png' : '/Aldeana.png';
    const loader = new THREE.TextureLoader();

    loader.load(
      texturePath,
      (texture) => {
        const material = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(material);

        sprite.position.set(
          x - mapWidth / 2 + 0.5,
          0.5,
          y - mapHeight / 2 + 0.5
        );

        sprite.scale.set(1, 1, 1);
        scene.add(sprite);
        unitRef.current = sprite;
      },
      undefined,
      (err) => console.error('Error cargando textura de unidad:', err)
    );

    return () => {
      if (unitRef.current) {
        scene.remove(unitRef.current);
        unitRef.current.material?.map?.dispose();
        unitRef.current.material?.dispose();
        unitRef.current = null;
      }
    };
  }, [scene, mapWidth, mapHeight, initialPosition, type, gameMap, buildings]);

  return null;
}