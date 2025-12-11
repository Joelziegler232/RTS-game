import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

const MapViewer: React.FC = () => {
  const { data: session, status } = useSession();

  // Estado del mapa y errores
  const [map, setMap] = useState<string[][] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Carga el mapa del usuario cuando está autenticado
  useEffect(() => {
    const loadUserMap = async () => {
      if (status === "authenticated" && session?.user?.id) {
        try {
          console.log("Cargando mapa para userId:", session.user.id);

          const response = await fetch(`/api/user_instance/${session.user.id}`);
          if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
          }

          const userInstance = await response.json();
          
          console.log("Mapa recibido (primera fila):", userInstance.map?.grid?.[0]);

          if (userInstance.map?.grid) {
            setMap(userInstance.map.grid);
          } else {
            setError("No se encontró el mapa del usuario");
          }
        } catch (err: any) {
          console.error("Error cargando el mapa:", err);
          setError(err.message || "Error al cargar el mapa");
        }
      }
    };

    loadUserMap();
  }, [status, session]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Visor de Mapa</h1>

      {error && <p className="text-red-500 font-medium mb-4">{error}</p>}

      {map ? (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Tu Mapa (100x100)</h2>
          <div
            className="inline-block border-4 border-gray-800 shadow-2xl"
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${map.length}, 8px)`, 
              gap: "1px",
              backgroundColor: "#000",
            }}
          >
            {map.flat().map((cell, index) => (
              <div
                key={index}
                title={cell} 
                className="w-2 h-2" 
                style={{
                  backgroundColor:
                    cell === "water" ? "#1e40af" :    
                    cell === "sand" ? "#fde047" :     
                    cell === "plains" ? "#86efac" :    
                    cell === "forest" ? "#166534" :     
                    cell === "mountain" ? "#6b7280" :   
                    cell === "tree" ? "#22c55e" :       
                    cell === "palm" ? "#84cc16" :       
                    cell === "gold" ? "#fbbf24" :       
                    cell === "stone" ? "#94a3b8" :     
                    cell === "berry" ? "#ec4899" :      
                    "#000000", 
                }}
              />
            ))}
          </div>
          <p className="mt-4 text-sm text-gray-600">
            Total de celdas: {map.length * map[0].length} (100×100)
          </p>
        </div>
      ) : (
        <p className="text-lg">Cargando mapa...</p>
      )}
    </div>
  );
};

export default MapViewer;