"use client";

import { Structure } from "../utils/StructuresData";

export default function BarracksDetails({
  cuartel,
  state,
  buildingId,
  onTrainSoldier,
  playerLevel,
  trainingData,
  onSearchBattle, // 🆕 NUEVO PROP
}: {
  cuartel: Structure;
  state: boolean;
  buildingId: number;
  onTrainSoldier: (bId: number) => void;
  playerLevel: number;
  trainingData?: { id: number; progress: number } | null;
  onSearchBattle: () => void; // 🆕 NUEVO PROP
}) {
  if (!state || buildingId !== cuartel.id) return null;

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
        width: "300px",
        textAlign: "center",
      }}
    >
      <h2
        style={{
          fontSize: "18px",
          marginBottom: "10px",
          fontWeight: "bold",
        }}
      >
        Cuartel
      </h2>

      {/* ============================
            ENTRENAR SOLDADO
      ============================ */}
      <button
        style={{
          marginTop: "10px",
          padding: "10px",
          background: "#2196F3",
          border: "none",
          color: "white",
          borderRadius: "8px",
          cursor: "pointer",
          width: "100%",
          fontSize: "16px",
        }}
        onClick={() => onTrainSoldier(buildingId)}
      >
        Entrenar Soldado (30 comida 🍗)
      </button>

      {/* Barra de progreso de entrenamiento */}
      {trainingData?.id === buildingId && (
        <div style={{ marginTop: "10px" }}>
          <div
            style={{
              width: "100%",
              height: "12px",
              background: "#333",
              borderRadius: "6px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${trainingData.progress}%`,
                height: "100%",
                background: "#4CAF50",
                transition: "width 0.1s",
              }}
            />
          </div>

          <p style={{ marginTop: "5px", fontSize: "12px" }}>
            Entrenando soldado...
          </p>
        </div>
      )}

      {/* ============================
            BUSCAR BATALLA (A PARTIR NIVEL 3)
      ============================ */}
      {playerLevel >= 3 && (
        <button
          style={{
            marginTop: "15px",
            padding: "10px",
            background: "#9C27B0",
            border: "none",
            color: "white",
            borderRadius: "8px",
            cursor: "pointer",
            width: "100%",
            fontSize: "16px",
            fontWeight: "bold",
          }}
          onClick={onSearchBattle} // 🟣 ACÁ LLAMAMOS A LA FUNCIÓN REAL
        >
          🔥 BUSCAR BATALLA
        </button>
      )}

      {/* -----------------------------
            CERRAR MENÚ
      ----------------------------- */}
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
        onClick={() =>
          window.dispatchEvent(new CustomEvent("closeBuildingMenu"))
        }
      >
        Cerrar
      </button>
    </div>
  );
}
