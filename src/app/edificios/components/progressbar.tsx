// src/app/edificios/components/progressbar.tsx
'use client';

import Units from '@/app/generadores/objects/Units';
import { Dispatch, SetStateAction, useEffect, useState, useRef } from 'react';
import { Structure } from '../utils/StructuresData';
import { v4 as uuidv4 } from 'uuid';

interface ProgressbarProps {
  running: boolean;
  unit: Units;
  quantity: number;
  setProgressBar: Dispatch<SetStateAction<boolean | null>>;
  ayuntamiento: Structure;
  setQuantity: Dispatch<SetStateAction<number>>;
  userId: string;
  setPlayerVillagers: Dispatch<SetStateAction<number>>;
  setUnits: Dispatch<SetStateAction<any[]>>;
  setPlayerFood: Dispatch<SetStateAction<number>>; // ← Añadimos esto
}

export default function Progressbar({
  running,
  unit,
  quantity,
  setProgressBar,
  ayuntamiento,
  setQuantity,
  userId,
  setPlayerVillagers,
  setUnits,
  setPlayerFood,
}: ProgressbarProps) {
  const [seconds, setSeconds] = useState(0);
  const timePerUnit = unit.incrementador_time; // 5 segundos por aldeano
  const isCreatingUnit = useRef(false);

  // Reiniciar contador cada vez que cambia la cola o se reinicia
  useEffect(() => {
    setSeconds(0);
  }, [running, quantity]);

  // Barra de progreso
  useEffect(() => {
    if (!running || quantity <= 0) return;

    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev >= timePerUnit) {
          clearInterval(interval);
          finishOneUnit();
          return 0;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [running, quantity, timePerUnit]);

  // Esta función se ejecuta SOLO cuando termina el tiempo de una unidad
  const finishOneUnit = async () => {
  if (isCreatingUnit.current) return;
  isCreatingUnit.current = true;

  const newUnit = {
    id: uuidv4(),
    type: 'villager',
    position: {
      x: ayuntamiento.position!.x + 1,
      y: ayuntamiento.position!.y + 1,
    },
    status: 'idle',
  };

  try {
    const response = await fetch(`/api/user_instance/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ units: [newUnit] }), // Solo agregamos unidad
    });

    if (!response.ok) throw new Error('Error creando aldeano');

    const updatedInstance = await response.json();

    // Actualizamos todo desde el backend
    setPlayerVillagers(updatedInstance.population.villagers || 0);
    setUnits(updatedInstance.units || []);

    // La comida ya está descontada desde CreacionMenu → no tocar
    // setPlayerFood(...) ← BORRÁ ESTO SI LO TENÉS

  } catch (error) {
    console.error('Error:', error);
    alert('Error creando aldeano');
    setQuantity(prev => prev - 1);
  } finally {
    setQuantity(0);  // ← siempre 0 cuando termina
if (quantity <= 1) {
  setProgressBar(false);
}
    isCreatingUnit.current = false;
  }
};

  const progress = timePerUnit > 0 ? (seconds / timePerUnit) * 100 : 0;

  if (!running || quantity === 0) return null;

  return (
    <div className="absolute left-1/2 top-4 -translate-x-1/2 z-50 bg-black/90 text-white px-6 py-4 rounded-xl shadow-2xl border border-cyan-500">
      <div className="relative w-80 h-12 bg-gray-800 rounded-lg overflow-hidden border-2 border-cyan-400">
        <div
          className="h-full bg-gradient-to-r from-blue-600 via-cyan-500 to-green-500 transition-all duration-1000 ease-linear"
          style={{ width: `${progress}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center font-bold text-lg">
          {seconds}s / {timePerUnit}s
        </div>
      </div>

      <div className="text-center mt-3 text-xl font-bold text-cyan-300">
  Creando aldeano...
</div>
    </div>
  );
}