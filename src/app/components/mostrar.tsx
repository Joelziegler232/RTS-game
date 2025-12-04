'use client';

import Image from 'next/image';
import React, { useState, useEffect, MouseEventHandler } from 'react';
import { Structure, structures, structuresForBackend } from '../edificios/utils/StructuresData';

interface MostrarProps {
  map: string[][];
  buildings: Structure[];
  units: any[];
  userId: string;
}

const Mostrar: React.FC<MostrarProps> = ({ map, buildings, units, userId }) => {
  // Estado del cursor y construcción
  const [showCursorMarker, setShowCursorMarker] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);

  // Estado del backend
  const [userInstance, setUserInstance] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuilding, setIsBuilding] = useState(false); // Evita doble click

  // -------------------------------------------------
  // Cargar datos completos del usuario desde el backend
  // -------------------------------------------------
  const fetchUserInstance = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/user_instance/${userId}`);
      if (!response.ok) throw new Error(`Error ${response.status}`);
      const data = await response.json();
      setUserInstance(data);
    } catch (error) {
      console.error('Error cargando userInstance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Carga solo cuando cambia el userId
  useEffect(() => {
    if (userId) fetchUserInstance();
  }, [userId]);

  // -------------------------------------------------
  // Seguimiento del mouse → posición en celdas (20x20)
  // -------------------------------------------------
  const handleMouseMove: MouseEventHandler = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / 20);
    const y = Math.floor((e.clientY - rect.top) / 20);
    setCursorPosition({ x, y });
  };

  // -------------------------------------------------
  // Seleccionar edificio para construir
  // -------------------------------------------------
  const handleBuildingSelect = (buildingType: string) => {
    if ((userInstance?.level || 1) === 1 && buildingType !== 'ayuntamiento') {
      alert('En el nivel 1 solo puedes construir el ayuntamiento.');
      return;
    }
    setSelectedBuilding(buildingType);
    setShowCursorMarker(true);
  };

  // -------------------------------------------------
  // CONSTRUIR EDIFICIO AL HACER CLICK
  // -------------------------------------------------
  const handleMapClick = async () => {
    if (!selectedBuilding || !userInstance || isLoading || isBuilding) return;

    setIsBuilding(true);

    const structure = structuresForBackend.find(s => s.type === selectedBuilding);
    if (!structure) {
      alert('Edificio no válido.');
      setIsBuilding(false);
      return;
    }

    // Validaciones
    const hasTownHall = userInstance.buildings.some((b: any) => b.type === 'ayuntamiento');
    if (hasTownHall && selectedBuilding === 'ayuntamiento') {
      alert('Ya tienes un ayuntamiento.');
      setIsBuilding(false);
      return;
    }

    if (map[cursorPosition.y]?.[cursorPosition.x] === 'water') {
      alert('No puedes construir en agua.');
      setIsBuilding(false);
      return;
    }

    // Recursos y aldeanos (solo a partir del nivel 2)
    if (userInstance.level >= 2) {
      const idleVillagers = userInstance.units.filter((u: any) => u.type === 'villager' && u.status === 'idle').length;
      if (idleVillagers < (structure.requiredVillagers || 1)) {
        alert('No tienes aldeanos libres para construir.');
        setIsBuilding(false);
        return;
      }

      for (const [res, cost] of Object.entries(structure.cost)) {
        const userRes = userInstance.resources.find((r: any) => r.resource === res);
        if (!userRes || userRes.amount < (cost as number)) {
          alert(`Te falta ${res}: necesitas ${cost}`);
          setIsBuilding(false);
          return;
        }
      }
    }

    // Crear edificio
    const newBuilding = {
      id: Date.now(),
      type: selectedBuilding,
      position: { x: cursorPosition.x + 50, y: cursorPosition.y + 50 },
      obreros: 0,
      maxObreros: structure.maxObreros || 0,
      capacity: structure.capacity || 0,
      maxCap: structure.maxCapacity,
      level: structure.level || 1,
      updateTime: structure.updateTime,
      aumentar: structure.aumentar || false,
    };

    // Descontar recursos
    const updatedResources = userInstance.resources.map((r: any) => {
      const cost = structure.cost[r.resource as keyof typeof structure.cost];
      return cost ? { ...r, amount: r.amount - (cost as number) } : r;
    });

    try {
      const res = await fetch(`/api/user_instance/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          building: newBuilding,
          resources: userInstance.level >= 2 ? updatedResources : userInstance.resources,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setUserInstance(updated);
        setSelectedBuilding(null);
        setShowCursorMarker(false);
      } else {
        const err = await res.json();
        alert(err.error || 'Error al construir');
      }
    } catch (err) {
      console.error(err);
      alert('Error de red');
    } finally {
      setIsBuilding(false);
    }
  };

  // -------------------------------------------------
  // Imagen según tipo de edificio
  // -------------------------------------------------
  const getBuildingImage = (type: string) => {
    const images: Record<string, string> = {
      lumber: '/madera_generador.png',
      gold_mine: '/gold_mine.png',
      stone_mine: '/stone_mine.png',
      ayuntamiento: '/casa_oracion.png',
      shipyard: '/port.png',
      mill: '/molino.png',
      house: '/casaD.png',
      barracks: '/cuartel.png',
    };
    return images[type] || '/default.png';
  };

  // Nivel actual y estructuras disponibles
  const currentLevel = userInstance?.level || 1;
  const hasTownHall = userInstance?.buildings?.some((b: any) => b.type === 'ayuntamiento');

  const availableStructures = structures.filter(s => {
    if (s.type === 'ayuntamiento' && (hasTownHall || currentLevel >= 2)) return false;
    return s.desbloqueo <= currentLevel;
  });

  if (isLoading) return <div className="text-white text-2xl">Cargando tu aldea...</div>;

  return (
    <div
      className="w-full h-screen relative overflow-hidden bg-black"
      onMouseMove={handleMouseMove}
      onClick={handleMapClick}
    >
      {/* BOTONES DE CONSTRUCCIÓN */}
      <div className="absolute top-4 left-4 z-50 flex flex-col gap-3 bg-black/70 p-4 rounded-lg">
        {availableStructures.map(s => (
          <button
            key={s.type}
            onClick={() => handleBuildingSelect(s.type)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-medium transition"
          >
            {s.name}{' '}
            {currentLevel === 1 && s.type === 'ayuntamiento'
              ? '(Gratis)'
              : `(${Object.entries(s.cost)
                  .map(([r, a]) => `${a} ${r}`)
                  .join(', ')})`}
          </button>
        ))}
      </div>

      {/* MARCADOR DE CURSOR */}
      {showCursorMarker && (
        <div
          className="absolute w-6 h-6 border-4 border-green-400 rounded-full pointer-events-none z-40 animate-pulse"
          style={{ left: cursorPosition.x * 20 - 8, top: cursorPosition.y * 20 - 8 }}
        />
      )}

      {/* FONDO + GRID */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(/Mapaage.jpg)`,
          backgroundSize: 'cover',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(100, 20px)',
            gridTemplateRows: 'repeat(25, 20px)',
            opacity: 0.3,
          }}
        >
          {Array.from({ length: 25 }, (_, y) =>
            Array.from({ length: 100 }, (_, x) => (
              <div key={`${x}-${y}`} className="border border-gray-800" />
            ))
          )}
        </div>
      </div>

      {/* RECURSOS NATURALES (árboles, palmeras) */}
      {map.slice(0, 25).flatMap((row, y) =>
        row.map((cell, x) =>
          (cell === 'tree' || cell === 'palm') ? (
            <Image
              key={`${x}-${y}`}
              src={cell === 'tree' ? '/tree.png' : '/palmera.png'}
              alt={cell}
              width={40}
              height={40}
              className="absolute"
              style={{ left: x * 20 - 10, top: y * 20 - 20 }}
            />
          ) : null
        )
      )}

      {/* EDIFICIOS */}
      {buildings.map(b => (
        <Image
          key={b.id}
          src={getBuildingImage(b.type)}
          alt={b.type}
          width={60}
          height={60}
          className="absolute drop-shadow-lg"
          style={{
            left: (b.position!.x - 50) * 20 - 20,
            top: (b.position!.y - 50) * 20 - 20,
          }}
        />
      ))}

      {/* UNIDADES (aldeanos y soldados) */}
      {(userInstance?.units ?? units).map((unit: any) => (
        <Image
          key={unit.id}
          src="/Aldeano.png"
          alt="unit"
          width={30}
          height={30}
          className="absolute drop-shadow-md"
          style={{
            left: (unit.position?.x ?? 0) * 20 - 15,
            top: (unit.position?.y ?? 0) * 20 - 15,
          }}
        />
      ))}
    </div>
  );
};

export default Mostrar;