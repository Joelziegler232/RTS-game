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
  const [showCursorMarker, setShowCursorMarker] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [userInstance, setUserInstance] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // -------------------------------
  // Cargar userInstance desde el backend
  // -------------------------------
  const fetchUserInstance = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/user_instance/${userId}`);
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${await response.text()}`);
      }
      const data = await response.json();
      console.log('userInstance cargado:', JSON.stringify(data, null, 2));
      setUserInstance(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error al cargar userInstance:', error);
      setIsLoading(false);
    }
  };

  // --------------------------------
  // SOLO cargar una vez o cuando cambie el userId
  // --------------------------------
  useEffect(() => {
    console.log('userId recibido:', userId);
    fetchUserInstance();
  }, [userId]);

  // --------------------------------
  // Obtener posición del mouse
  // --------------------------------
  const handleMouseMove: MouseEventHandler = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / 20);
    const y = Math.floor((e.clientY - rect.top) / 20);
    setCursorPosition({ x, y });
  };

  // --------------------------------
  // Seleccionar edificio a construir
  // --------------------------------
  const handleBuildingSelect = (buildingType: string) => {
    if ((userInstance?.level || 1) === 1 && buildingType !== 'ayuntamiento') {
      alert('En el nivel 1 solo puedes construir el ayuntamiento.');
      return;
    }
    setSelectedBuilding(buildingType);
    setShowCursorMarker(true);
  };

 // --------------------------------
// Construir edificio en el mapa
// --------------------------------
const [isBuilding, setIsBuilding] = useState(false);

const handleMapClick = async () => {
  if (!selectedBuilding || !userInstance || isLoading || isBuilding) {
    console.log('Click ignorado: ', { selectedBuilding, isLoading, isBuilding });
    return;
  }

  setIsBuilding(true);
  console.log('handleMapClick iniciado');

  const structure = structuresForBackend.find((s) => s.type === selectedBuilding);
  if (!structure) {
    alert('Edificio no válido.');
    setIsBuilding(false);
    return;
  }

  const hasTownHall =
    userInstance.buildings.some((b: any) => b.type === 'ayuntamiento') ||
    buildings.some((b: any) => b.type === 'ayuntamiento');

  if (hasTownHall && selectedBuilding === 'ayuntamiento') {
    alert('Ya has construido un ayuntamiento.');
    setIsBuilding(false);
    return;
  }

  if (userInstance.map.grid[cursorPosition.y]?.[cursorPosition.x] === 'agua') {
    alert('No puedes construir en agua.');
    setIsBuilding(false);
    return;
  }

  if ((userInstance.level || 1) >= 2) {
    const idleVillagers = userInstance.units.filter(
      (u: any) => u.type === 'villager' && u.status === 'idle'
    ).length;

    if (idleVillagers < (structure.requiredVillagers || 1)) {
      alert('Se requiere al menos un aldeano disponible para construir.');
      setIsBuilding(false);
      return;
    }

    for (const [resource, amount] of Object.entries(structure.cost)) {
      const userResource = userInstance.resources.find((r: any) => r.resource === resource);
      if (!userResource || userResource.amount < (amount as number)) {
        alert(`No tienes suficientes recursos: ${resource} (${amount} requerido).`);
        setIsBuilding(false);
        return;
      }
    }
  }

  const building = {
    id: Date.now(),
    type: selectedBuilding,
    position: { x: cursorPosition.x + 50, y: cursorPosition.y + 50 },
    obreros: structure.obreros || 0,
    maxObreros: structure.maxObreros || 0,
    capacity: structure.capacity || 0,
   
    maxCap: structure.maxCapacity,
    level: structure.level || 1,
    updateTime: structure.updateTime,
    aumentar: structure.aumentar || false,
  };

  const updatedResources = userInstance.resources.map((r: any) => {
    const costAmount = structure.cost[r.resource as keyof typeof structure.cost] as number | undefined;
    return costAmount !== undefined ? { ...r, amount: r.amount - costAmount } : r;
  });

  console.log('Enviando PATCH con building:', building);

  try {
    const response = await fetch(`/api/user_instance/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        building,
        resources: (userInstance.level || 1) >= 2 ? updatedResources : userInstance.resources,
        population: userInstance.population,
      }),
    });

    if (response.ok) {
      const updatedInstance = await response.json();
      console.log('userInstance actualizado después de construir:', updatedInstance);

      setUserInstance(updatedInstance);
      await fetchUserInstance();

      setShowCursorMarker(false);
      setSelectedBuilding(null);
    } else {
      const error = await response.json();
      console.error('Error al construir edificio:', error);
      alert(`Error: ${error.error || 'No se pudo construir el edificio.'}`);
    }
  } catch (err) {
    console.error('Error en fetch:', err);
  } finally {
    setIsBuilding(false);
    console.log('handleMapClick finalizado');
  }
};


  // --------------------------------
  // Obtener la imagen del edificio
  // --------------------------------
  const getBuildingImage = (type: string) => {
    switch (type) {
      case 'lumber': return '/madera_generador.png';
      case 'gold_mine': return '/gold_mine.png';
      case 'stone_mine': return '/stone_mine.png';
      case 'ayuntamiento': return '/casa_oracion.png';
      case 'shipyard': return '/port.png';
      case 'mill': return '/molino.png';
      case 'house': return '/casaD.png';
      case 'barracks': return '/cuartel.png';
      default: return '/default.png';
    }
  };

  const hasTownHall =
    userInstance?.buildings?.some((b: any) => b.type === 'ayuntamiento') ||
    buildings.some((b: any) => b.type === 'ayuntamiento') ||
    false;

  const currentLevel = userInstance?.level || 1;

  const availableStructures = structures.filter((structure) => {
    if (structure.type === 'ayuntamiento' && (hasTownHall || currentLevel >= 2)) {
      return false;
    }
    return structure.desbloqueo <= currentLevel;
  });

  if (isLoading) {
    return <div className="text-white">Cargando datos del usuario...</div>;
  }

  return (
    <div className="w-full h-full relative" onMouseMove={handleMouseMove} onClick={handleMapClick}>
      
      {/* -------------------------------- */}
      {/* Botones para construir edificios */}
      {/* -------------------------------- */}
      <div className="absolute top-4 left-4 flex flex-col gap-2">
        {availableStructures.map((structure) => (
          <button
            key={structure.type}
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
            onClick={() => handleBuildingSelect(structure.type)}
          >
            {structure.name}{' '}
            {currentLevel === 1 && structure.type === 'ayuntamiento'
              ? '(Gratis)'
              : `(${Object.entries(structure.cost)
                  .filter(([_, amt]) => amt !== undefined)
                  .map(([res, amt]) => `${amt} ${res}`)
                  .join(', ')})`}
          </button>
        ))}
      </div>

      {/* Cursor de construcción */}
      {showCursorMarker && (
        <div
          className="absolute w-4 h-4 bg-green-500 rounded-full pointer-events-none"
          style={{ left: cursorPosition.x * 20, top: cursorPosition.y * 20 }}
        ></div>
      )}

      {/* Mapa */}
      <div
        style={{
          position: 'absolute',
          width: 2000,
          height: 500,
          backgroundImage: `url(/Mapaage.jpg)`,
          backgroundSize: 'cover',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(100, 20px)`,
            gridTemplateRows: `repeat(25, 20px)`,
            width: 2000,
            height: 500,
            opacity: 0.5,
          }}
        >
          {Array.from({ length: 25 }).map((_, y) =>
            Array.from({ length: 100 }).map((_, x) => (
              <div
                key={`${x}-${y}`}
                style={{ border: '1px solid rgba(0, 0, 0, 0.1)' }}
              ></div>
            ))
          )}
        </div>
      </div>

      {/* Render del mapa, edificios, unidades */}
      {map && (
        <div>
          {/* Árboles y palmeras */}
          {map.slice(0, 25).flatMap((row, y) =>
            row.map((cell, x) => {
              if (cell === 'tree' || cell === 'palm') {
                return (
                  <Image
                    key={`${x}-${y}`}
                    src={cell === 'tree' ? '/tree.png' : '/palmera.png'}
                    alt={cell}
                    width={20}
                    height={20}
                    style={{ position: 'absolute', left: x * 20, top: y * 20 }}
                  />
                );
              }
              return null;
            })
          )}

          {/* Edificios */}
          {buildings.map((building) => (
            <Image
              key={`${building.type}-${building.id}`}
              src={getBuildingImage(building.type)}
              alt={building.type}
              width={40}
              height={40}
              style={{
                position: 'absolute',
                left: (building.position!.x - 50) * 20,
                top: (building.position!.y - 50) * 20,
              }}
            />
          ))}

          {/* Unidades (aldeanos) */}
          {(userInstance?.units ?? units)?.map((unit: any) => (
            <Image
              key={unit.id}
              src="/Aldeano.png"
              alt="villager"
              width={20}
              height={20}
              style={{
                position: "absolute",
                left: (unit.position?.x ?? 0) * 20,
                top: (unit.position?.y ?? 0) * 20,
                transform: "translate(-50%, -50%)",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Mostrar;
