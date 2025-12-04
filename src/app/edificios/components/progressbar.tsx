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
  setPlayerFood: Dispatch<SetStateAction<number>>;         
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
  const [seconds, setSeconds] = useState(0);                    // Segundos transcurridos
  const timePerUnit = unit.incrementador_time;                  // Tiempo total por unidad (5s)
  const isCreatingUnit = useRef(false);                         // Evita crear múltiples a la vez

  // Reinicia el contador cuando cambia la cola o se activa/desactiva
  useEffect(() => {
    setSeconds(0);
  }, [running, quantity]);

  // Temporizador que avanza segundo a segundo
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

  // Se ejecuta cuando termina el tiempo de creación de un aldeano
  const finishOneUnit = async () => {
    if (isCreatingUnit.current) return;   // Evita duplicados
    isCreatingUnit.current = true;

    // Datos del nuevo aldeano
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
      // Guardamos la unidad en el backend
      const response = await fetch(`/api/user_instance/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ units: [newUnit] }),
      });

      if (!response.ok) throw new Error('Error creando aldeano');

      const updatedInstance = await response.json();

      // Actualizamos estado con datos reales del backend
      setPlayerVillagers(updatedInstance.population.villagers || 0);
      setUnits(updatedInstance.units || []);


    } catch (error) {
      console.error('Error:', error);
      alert('Error creando aldeano');
      setQuantity(prev => prev - 1);  // Revierte si falla
    } finally {
      // Siempre limpiamos la cola y la barra
      setQuantity(0);
      if (quantity <= 1) {
        setProgressBar(false);
      }
      isCreatingUnit.current = false;
    }
  };

  // Calcula el porcentaje de progreso
  const progress = timePerUnit > 0 ? (seconds / timePerUnit) * 100 : 0;

  // Si no está corriendo o no hay nada en cola → no renderiza nada
  if (!running || quantity === 0) return null;

  return (
    <div className="absolute left-1/2 top-4 -translate-x-1/2 z-50 bg-black/90 text-white px-6 py-4 rounded-xl shadow-2xl border border-cyan-500">
      {/* Barra de progreso visual */}
      <div className="relative w-80 h-12 bg-gray-800 rounded-lg overflow-hidden border-2 border-cyan-400">
        <div
          className="h-full bg-gradient-to-r from-blue-600 via-cyan-500 to-green-500 transition-all duration-1000 ease-linear"
          style={{ width: `${progress}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center font-bold text-lg">
          {seconds}s / {timePerUnit}s
        </div>
      </div>

      {/* Texto descriptivo */}
      <div className="text-center mt-3 text-xl font-bold text-cyan-300">
        Creando aldeano...
      </div>
    </div>
  );
}