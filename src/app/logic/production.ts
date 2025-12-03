// src/app/logic/production.ts
import { Structure, Generadores } from "../edificios/utils/StructuresData";

export function updateData(generador: Structure): Structure {
  if (
    generador.type === "lumber" ||
    generador.type === "gold_mine" ||
    generador.type === "stone_mine"
  ) {
    // Type guard para asegurar que generador es un Generadores
    if (
      generador.produccion_hora !== undefined &&
      generador.obreros !== undefined &&
      generador.maxObreros !== undefined &&
      generador.maxCapacity !== undefined &&
      generador.aumentar !== undefined &&
      generador.capacity !== undefined &&
      generador.updateTime !== undefined
    ) {
      // 🔥 FIX CRÍTICO: convertir updateTime a Date SIEMPRE
      const lastUpdate =
        generador.updateTime instanceof Date
          ? generador.updateTime
          : new Date(generador.updateTime); // <-- permite string o Date

      const timeDiff =
        (Date.now() - lastUpdate.getTime()) / 1000 / 3600; // Horas desde última actualización

      const newCapacity = Math.min(
        generador.maxCapacity,
        generador.capacity +
          generador.produccion_hora * generador.obreros * timeDiff
      );

      return {
        ...generador,
        capacity: newCapacity,
        updateTime: new Date(), // nueva marca de tiempo
      } as Generadores;
    }
  }

  return generador;
}
