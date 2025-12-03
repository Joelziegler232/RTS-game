// src/app/edificios/components/building.tsx
"use client";

import { Generadores } from "../utils/StructuresData";

export default function BuildingDetails({
  generador,
  state,
  buildingId,
  onAssignVillager,
  onRemoveVillager
}: {
  generador: Generadores;
  state: boolean;
  buildingId: number;
  onAssignVillager: (bId: number) => void;
  onRemoveVillager: (bId: number) => void;
}) {
  if (!state || buildingId !== generador.id) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "120px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "rgba(0,0,0,0.85)",
        padding: "20px",
        borderRadius: "10px",
        color: "white",
        zIndex: 2000,
        width: "260px",
        textAlign: "center",
      }}
    >
      <h2 style={{ fontSize: "18px", marginBottom: "10px", fontWeight: "bold" }}>
        {generador.name}
      </h2>

      <p>Producción: {generador.produccion_hora} / hora</p>
      <p>Obreros: {generador.obreros} / {generador.maxObreros}</p>
      

      <button
        disabled={generador.obreros >= generador.maxObreros}
        style={{
          marginTop: "15px",
          padding: "10px",
          background: generador.obreros >= generador.maxObreros ? "#555" : "#4CAF50",
          cursor: generador.obreros >= generador.maxObreros ? "not-allowed" : "pointer",
          border: "none",
          color: "white",
          borderRadius: "8px",
          width: "100%",
          fontSize: "16px",
        }}
        onClick={() => onAssignVillager(buildingId)}
      >
        {generador.obreros >= generador.maxObreros
          ? "Capacidad completa"
          : "Asignar Aldeano"}
      </button>

      {generador.obreros > 0 && (
        <button
          style={{
            marginTop: "10px",
            padding: "8px",
            background: "#ff9800",
            border: "none",
            color: "white",
            borderRadius: "8px",
            cursor: "pointer",
            width: "100%",
          }}
          onClick={() => onRemoveVillager(generador.id)}
        >
          Quitar Aldeano
        </button>
      )}

      <button
        style={{
          marginTop: "10px",
          padding: "6px",
          background: "#d9534f",
          border: "none",
          color: "white",
          borderRadius: "8px",
          cursor: "pointer",
          width: "100%",
        }}
        onClick={() => window.dispatchEvent(new CustomEvent("closeBuildingMenu"))}
      >
        Cerrar
      </button>
    </div>
  );
}
