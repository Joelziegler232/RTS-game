
export const fetchMaps = async () => {
    // Usa la ruta relativa desde la raíz del dominio para el cliente
    const response = await fetch("/api/map");
    if (!response.ok) throw new Error("Failed to fetch maps");
    return await response.json();
  };
  
  export const createMap = async () => {
    // Usa la ruta relativa desde la raíz del dominio para el cliente
    const response = await fetch("/api/map", {
      method: "POST",
    });
    if (!response.ok) throw new Error("Failed to create map");
    return await response.json();
  };
  