'use client';
import Units from '@/app/generadores/objects/Units';
import { User } from '@/app/objects/user';
import Image from 'next/image';
import { Dispatch, SetStateAction, useState } from 'react';

const units_Array: Units[] = [
  {
    id: 1,
    name: 'Aldeano',
    img: <Image key="Aldeano" src="/Aldeano.png" width={60} height={70} alt="png Aldeano" />,
    precio: 20,
    incrementador_time: 5,
    level: 1,
    desbloqueo: 1,
  },
];

interface CreacionMenuProps {
  user: User;
  quantity: number;
  setProgressBar: Dispatch<SetStateAction<boolean | null>>;
  setUnit: Dispatch<SetStateAction<Units | undefined>>;
  setQuantity: Dispatch<SetStateAction<number>>;
  playerPopulationCap: number;
  playerVillagers: number;
  playerLevel: number;
  playerFood: number;
  setPlayerFood: Dispatch<SetStateAction<number>>;
  ayunMenu: boolean;

  lumberCampArray: any[];
  goldMineArray: any[];
  stoneMineArray: any[];
  millArray: any[];
  soldierCount: number;
}

export default function CreacionMenu({
  user,
  quantity,
  setProgressBar,
  setUnit,
  setQuantity,
  playerPopulationCap,
  playerVillagers,
  playerLevel,
  playerFood,
  setPlayerFood,
  ayunMenu,
  lumberCampArray,
  goldMineArray,
  stoneMineArray,
  millArray,
  soldierCount,
}: CreacionMenuProps) {
  const [creacionMenu, setCreacionMenu] = useState(true); 
  const [isCreatingUnit, setIsCreatingUnit] = useState(false);

  // Función para crear un aldeano
  const handleCreateVillager = async () => {
    // Si ya hay uno en cola → no permitimos crear otro
    if (quantity > 0) {
      return;
    }

    try {
      // Calculamos cuántos aldeanos están trabajando en edificios
      const aldeanosTrabajando =
        (lumberCampArray?.reduce((sum, b) => sum + (b.obreros || 0), 0) || 0) +
        (goldMineArray?.reduce((sum, b) => sum + (b.obreros || 0), 0) || 0) +
        (stoneMineArray?.reduce((sum, b) => sum + (b.obreros || 0), 0) || 0) +
        (millArray?.reduce((sum, b) => sum + (b.obreros || 0), 0) || 0);

      // Población total actual (aldeanos libres + obreros + soldados)
      const poblacionActual = playerVillagers + aldeanosTrabajando + soldierCount;

      // Validación: límite de población
      if (poblacionActual + 1 > playerPopulationCap) {
        alert(`Límite de población alcanzado: ${poblacionActual}/${playerPopulationCap}`);
        return;
      }

      // Validación: comida suficiente
      if (playerFood < 20) {
        alert('No tienes suficiente comida (20)');
        return;
      }

      // Descontamos la comida localmente
      setPlayerFood(prev => prev - 20);

      // Actualizamos en el backend
      await fetch(`/api/user_instance/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resources: [{ resource: 'food', amount: playerFood - 20 }]
        })
      });

      // Iniciamos la creación del aldeano
      setUnit(units_Array[0]);
      setQuantity(1);  
      setProgressBar(true);

    } catch (error) {
      console.error("Error:", error);
      // Si falla, devolvemos la comida
      setPlayerFood(prev => prev + 20);
      alert("Error al iniciar creación");
    }
  };

  if (!ayunMenu) return null;

  return (
    <main>
      {/* MENÚ DE UNIDADES  */}
      <div className={`fixed bottom-0 h-[100px] w-screen flex flex-row bg-transparent transition-all duration-300 ${creacionMenu ? 'translate-y-full' : 'translate-y-0'}`}>
        {units_Array.map((unit, index) => (
          <div
            key={index}
            className="sidebar-icon group cursor-pointer hover:scale-110 transition-transform"
            onClick={handleCreateVillager}
            style={{
              // Deshabilitamos visualmente si no hay comida o ya hay uno en cola
              opacity: playerFood < 20 || isCreatingUnit ? 0.5 : 1,
              pointerEvents: playerFood < 20 || isCreatingUnit ? 'none' : 'auto'
            }}
          >
            {unit.img}
            <span className="sidebar-name group-hover:scale-100">
              {unit.name}
              <br />
              Precio: 20 Comida
              <br />
              Tiempo: 5s
            </span>
          </div>
        ))}
      </div>

      {/* BOTÓN PRINCIPAL  */}
      <button
        onClick={() => setCreacionMenu(!creacionMenu)}
        className={`
          fixed bottom-[105px] left-[47%] 
          bg-blue-600 hover:bg-blue-700 text-white font-bold 
          px-6 py-3 rounded-lg shadow-lg z-50
          transition-all duration-300 transform
          ${creacionMenu ? 'translate-y-[105px]' : 'translate-y-0'}
        `}
      >
        Crear Aldeano
      </button>
    </main>
  );
}