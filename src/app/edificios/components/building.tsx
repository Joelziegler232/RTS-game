// src/app/edificios/components/building.tsx
import { useState, useEffect } from "react";
import { Generadores } from "../utils/StructuresData";
import { updateData } from "@/app/logic/production";

export default function BuildingDetails({
  generador,
  state,
  buildingId,
}: {
  generador: Generadores;
  state: boolean;
  buildingId: number;
}) {
  const [updatedGenerador, setUpdatedGenerador] = useState<Generadores>(generador);

  useEffect(() => {
    const updatedData = updateData(generador) as Generadores;
    setUpdatedGenerador(updatedData);
  }, [state, generador]);

  if (state && buildingId === updatedGenerador.id) {
    return (
      <div className="show-detail">
        {updatedGenerador.name}
        <br />
        Producción por minuto: {updatedGenerador.produccion_hora}
        <br />
        Obreros: {updatedGenerador.obreros}
        <br />
        Capacidad: {updatedGenerador.capacity} / {updatedGenerador.maxCapacity}
      </div>
    );
  } else {
    return null;
  }
}