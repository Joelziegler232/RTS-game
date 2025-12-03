import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

const MapViewer: React.FC = () => {
  const { data: session, status } = useSession();
  const [map, setMap] = useState<string[][] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUserMap = async () => {
      if (status === "authenticated" && session?.user?.id) {
        try {
          console.log("Cargando mapa para userId:", session.user.id);
          const response = await fetch(`/api/user_instance/${session.user.id}`);
          if (!response.ok) {
            throw new Error(`Failed to fetch user instance: ${response.statusText}`);
          }
          const userInstance = await response.json();
          console.log("Mapa recibido:", userInstance.map.grid[0]); // Log para depurar
          if (userInstance.map && userInstance.map.grid) {
            setMap(userInstance.map.grid);
          } else {
            setError("No se encontró el mapa del usuario");
          }
        } catch (error: any) {
          console.error("Error loading user map:", error);
          setError(error.message || "Error al cargar el mapa");
        }
      }
    };
    loadUserMap();
  }, [status, session]);

  return (
    <div>
      <h1>Map Viewer</h1>
      {error && <p className="text-red-500">{error}</p>}
      {map ? (
        <div>
          <h2>Your Map</h2>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${map.length}, 20px)` }}>
            {map.flat().map((cell: string, index: number) => (
              <div
                key={index}
                style={{
                  width: "20px",
                  height: "20px",
                  backgroundColor:
                    cell === "water" ? "blue" :
                    cell === "plains" ? "green" :
                    cell === "forest" ? "darkgreen" :
                    cell === "mountain" ? "gray" :
                    cell === "tree" ? "brown" :
                    cell === "palm" ? "lightgreen" :
                    "black",
                }}
              ></div>
            ))}
          </div>
        </div>
      ) : (
        <p>Loading map...</p>
      )}
    </div>
  );
};

export default MapViewer;