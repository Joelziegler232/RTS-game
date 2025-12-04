"use client";

import { Generadores } from "../utils/StructuresData";

export default function BuildingDetails({
  generador,
  state,
  buildingId,
  onAssignVillager,
  onRemoveVillager,
}: {
  generador: Generadores;
  state: boolean;
  buildingId: number;
  onAssignVillager: (bId: number) => void;
  onRemoveVillager: (bId: number) => void;
}) {
  if (!state || buildingId !== generador.id) return null;

  const isFull = generador.obreros >= generador.maxObreros;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "130px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "linear-gradient(135deg, rgba(0,0,0,0.95), rgba(20,20,40,0.95))",
        padding: "24px 20px",
        borderRadius: "16px",
        border: "3px solid #ffd700",
        color: "white",
        zIndex: 3000,
        width: "300px",
        textAlign: "center",
        boxShadow: "0 0 30px rgba(255,215,0,0.5), inset 0 0 20px rgba(255,215,0,0.1)",
        fontFamily: "'MedievalSharp', 'Roboto', sans-serif",
      }}
    >
      {/* NOMBRE DEL EDIFICIO */}
      <h2
        style={{
          fontSize: "22px",
          margin: "0 0 16px 0",
          fontWeight: "bold",
          color: "#ffd700",
          textShadow: "0 0 10px #ffd700",
          letterSpacing: "1px",
        }}
      >
        {generador.name}
      </h2>

      {/* INFORMACIÓN DE PRODUCCIÓN */}
      <div style={{ marginBottom: "18px", fontSize: "17px" }}>
        <p style={{ margin: "8px 0", fontWeight: "bold" }}>
          Producción: <span style={{ color: "#4CAF50" }}>{generador.produccion_hora}/hora</span>
        </p>
        <p style={{ margin: "8px 0" }}>
          Obreros asignados:{' '}
          <span style={{ color: isFull ? "#ff4444" : "#00ff88", fontWeight: "bold" }}>
            {generador.obreros} / {generador.maxObreros}
          </span>
        </p>
      </div>

      {/* BARRA DE PROGRESO DE OBREROS */}
      <div
        style={{
          width: "100%",
          height: "14px",
          background: "#333",
          borderRadius: "8px",
          overflow: "hidden",
          margin: "12px 0",
          border: "1px solid #555",
        }}
      >
        <div
          style={{
            width: `${(generador.obreros / generador.maxObreros) * 100}%`,
            height: "100%",
            background: isFull ? "#ff4444" : "linear-gradient(90deg, #4CAF50, #8BC34A)",
            transition: "width 0.6s ease",
            borderRadius: "6px",
          }}
        />
      </div>

      {/* BOTÓN: ASIGNAR ALDEANO */}
      <button
        disabled={isFull}
        style={{
          marginTop: "16px",
          padding: "14px",
          background: isFull ? "#444" : "#43a047",
          cursor: isFull ? "not-allowed" : "pointer",
          border: "none",
          color: "white",
          borderRadius: "10px",
          width: "100%",
          fontSize: "17px",
          fontWeight: "bold",
          boxShadow: isFull ? "none" : "0 6px 15px rgba(67,160,71,0.6)",
          transition: "all 0.3s",
        }}
        onClick={() => onAssignVillager(buildingId)}
        onMouseOver={(e) => !isFull && (e.currentTarget.style.transform = "translateY(-3px)")}
        onMouseOut={(e) => (e.currentTarget.style.transform = "translateY(0)")}
      >
        {isFull ? "Capacidad completa" : "Asignar Aldeano"}
      </button>

      {/* BOTÓN: QUITAR ALDEANO (solo si hay al menos uno) */}
      {generador.obreros > 0 && (
        <button
          style={{
            marginTop: "12px",
            padding: "12px 20px",
            background: "#ff9800",
            border: "none",
            color: "white",
            borderRadius: "10px",
            cursor: "pointer",
            width: "100%",
            fontSize: "16px",
            fontWeight: "bold",
            boxShadow: "0 4px 12px rgba(255,152,0,0.5)",
          }}
          onClick={() => onRemoveVillager(generador.id)}
        >
          Quitar Aldeano
        </button>
      )}

      {/* BOTÓN: CERRAR */}
      <button
        style={{
          marginTop: "16px",
          padding: "10px",
          background: "#c62828",
          border: "none",
          color: "white",
          borderRadius: "10px",
          cursor: "pointer",
          width: "100%",
          fontSize: "16px",
          fontWeight: "bold",
        }}
        onClick={() => window.dispatchEvent(new CustomEvent("closeBuildingMenu"))}
      >
        Cerrar
      </button>
    </div>
  );
}