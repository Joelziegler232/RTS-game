
import { Structure, Generadores } from "../edificios/utils/StructuresData";

export function updateData(generador: Structure): Structure {
  if (
    generador.type === "lumber" ||
    generador.type === "gold_mine" ||
    generador.type === "stone_mine"
  ) {
    
    if (
      generador.produccion_hora !== undefined &&
      generador.obreros !== undefined &&
      generador.maxObreros !== undefined &&
      generador.maxCapacity !== undefined &&
      generador.aumentar !== undefined &&
      generador.capacity !== undefined &&
      generador.updateTime !== undefined
    ) {
      
      const lastUpdate =
        generador.updateTime instanceof Date
          ? generador.updateTime
          : new Date(generador.updateTime); 

      const timeDiff =
        (Date.now() - lastUpdate.getTime()) / 1000 / 3600; 

      const newCapacity = Math.min(
        generador.maxCapacity,
        generador.capacity +
          generador.produccion_hora * generador.obreros * timeDiff
      );

      return {
        ...generador,
        capacity: newCapacity,
        updateTime: new Date(), 
      } as Generadores;
    }
  }

  return generador;
}
