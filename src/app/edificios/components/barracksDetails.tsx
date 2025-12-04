"use client";

import { Structure } from "../utils/StructuresData";

export default function BarracksDetails({
  cuartel,
  state,
  buildingId,
  onTrainSoldier,
  playerLevel,
  trainingData,
  onSearchBattle,
}: {
  cuartel: Structure;
  state: boolean;                    
  buildingId: number;                
  onTrainSoldier: (bId: number) => void;  
  playerLevel: number;            
  trainingData?: { id: number; progress: number } | null;  
  onSearchBattle: () => void;        
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
        boxShadow: "0 0 20px rgba(0,0,0,0.8)",
      }}
    >
      {/* Título del cuartel */}
      <h2
        style={{
          fontSize: "20px",
          marginBottom: "12px",
          fontWeight: "bold",
          textShadow: "0 2px 4px rgba(0,0,0,0.8)",
        }}
      >
        Cuartel
      </h2>

      {/* BOTÓN: Entrenar soldado */}
      <button
        style={{
          marginTop: "10px",
          padding: "12px",
          background: "#2196F3",
          border: "none",
          color: "white",
          borderRadius: "8px",
          cursor: "pointer",
          width: "100%",
          fontSize: "16px",
          fontWeight: "bold",
          transition: "all 0.2s",
        }}
        onClick={() => onTrainSoldier(buildingId)}
        onMouseOver={(e) => e.currentTarget.style.background = "#1976D2"}
        onMouseOut={(e) => e.currentTarget.style.background = "#2196F3"}
      >
        Entrenar Soldado (30 comida)
      </button>

      {/* BARRA DE PROGRESO del entrenamiento */}
      {trainingData?.id === buildingId && (
        <div style={{ marginTop: "14px" }}>
          <div
            style={{
              width: "100%",
              height: "14px",
              background: "#333",
              borderRadius: "7px",
              overflow: "hidden",
              border: "1px solid #555",
            }}
          >
            <div
              style={{
                width: `${trainingData.progress}%`,
                height: "100%",
                background: "#4CAF50",
                transition: "width 0.3s ease",
              }}
            />
          </div>
          <p style={{ marginTop: "6px", fontSize: "13px", color: "#a0e0a0" }}>
            Entrenando soldado... {trainingData.progress}%
          </p>
        </div>
      )}

      {/* BOTÓN: Buscar batalla (solo si nivel >= 3) */}
      {playerLevel >= 3 && (
        <button
          style={{
            marginTop: "18px",
            padding: "14px",
            background: "#9C27B0",
            border: "none",
            color: "white",
            borderRadius: "10px",
            cursor: "pointer",
            width: "100%",
            fontSize: "18px",
            fontWeight: "bold",
            boxShadow: "0 4px 10px rgba(156, 39, 176, 0.5)",
            transition: "all 0.3s",
          }}
          onClick={onSearchBattle}
          onMouseOver={(e) => {
            e.currentTarget.style.background = "#7B1FA2";
            e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = "#9C27B0";
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          BUSCAR BATALLA
        </button>
      )}

      {/* BOTÓN: Cerrar menú */}
      <button
        style={{
          marginTop: "16px",
          padding: "8px",
          background: "#d9534f",
          border: "none",
          color: "white",
          borderRadius: "6px",
          cursor: "pointer",
          width: "100%",
          fontSize: "14px",
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