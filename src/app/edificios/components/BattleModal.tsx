"use client";
import React from "react";

export default function BattleModal({
  open,
  onClose,
  enemy,
  onAttack,
  loading = false,
  onSearchAgain, 
}: {
  open: boolean;
  onClose: () => void;
  enemy: any | null;
  onAttack: () => Promise<void>;
  loading?: boolean;
  onSearchAgain: () => void;
}) {
  if (!open || !enemy) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.97)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 3000,
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #1a1a2e, #16213e)",
          padding: "36px 48px",
          borderRadius: "20px",
          border: "4px solid #ffd700",
          color: "white",
          textAlign: "center",
          maxWidth: "420px",
          width: "90%",
          boxShadow: "0 0 40px rgba(255, 215, 0, 0.7), inset 0 0 20px rgba(255, 215, 0, 0.1)",
          animation: "pulseGlow 2s infinite alternate",
        }}
      >
        {/* Título */}
        <h2
          style={{
            fontSize: "32px",
            margin: "0 0 24px 0",
            color: "#ffd700",
            textShadow: "0 0 15px #ffd700, 0 0 30px #ff6b6b",
            fontWeight: "bold",
            letterSpacing: "1px",
          }}
        >
          ENEMIGO ENCONTRADO
        </h2>

        {/* Info del enemigo */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            padding: "16px",
            borderRadius: "12px",
            margin: "20px 0",
            border: "1px solid #ffd70033",
          }}
        >
          <p style={{ fontSize: "22px", margin: "8px 0" }}>
            <strong>Jugador:</strong> {enemy.name}
          </p>
          <p style={{ fontSize: "20px", margin: "8px 0" }}>
            <strong>Soldados:</strong> {enemy.soldiers}
          </p>
          <p style={{ fontSize: "18px", margin: "8px 0", color: "#ff6b6b" }}>
            <strong>Nivel:</strong> {enemy.level}
          </p>
        </div>

        {/* Botones de acción */}
        <div
          style={{
            marginTop: "30px",
            display: "flex",
            gap: "14px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {/* ATACAR */}
          <button
            onClick={onAttack}
            disabled={loading}
            style={{
              padding: "14px 32px",
              background: loading ? "#666" : "#c62828",
              color: "white",
              border: "none",
              borderRadius: "10px",
              fontSize: "20px",
              fontWeight: "bold",
              cursor: loading ? "not-allowed" : "pointer",
              minWidth: "160px",
              boxShadow: loading ? "none" : "0 6px 15px rgba(198, 40, 40, 0.6)",
              transition: "all 0.3s",
            }}
            onMouseOver={(e) =>
              !loading && (e.currentTarget.style.transform = "translateY(-3px)")
            }
            onMouseOut={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            {loading ? "ATACANDO..." : "ATACAR"}
          </button>

          {/* BUSCAR OTRO */}
          <button
            onClick={onSearchAgain}
            style={{
              padding: "14px 24px",
              background: "#43a047",
              color: "white",
              border: "none",
              borderRadius: "10px",
              fontSize: "17px",
              fontWeight: "bold",
              boxShadow: "0 4px 12px rgba(67, 160, 71, 0.5)",
            }}
          >
            Buscar otro
          </button>

          {/* CANCELAR */}
          <button
            onClick={onClose}
            style={{
              padding: "14px 24px",
              background: "#555",
              color: "white",
              border: "none",
              borderRadius: "10px",
              fontSize: "16px",
            }}
          >
            Cancelar
          </button>
        </div>
      </div>

      {/* Animación sutil de brillo */}
      <style jsx>{`
        @keyframes pulseGlow {
          from {
            box-shadow: 0 0 40px rgba(255, 215, 0, 0.7),
              inset 0 0 20px rgba(255, 215, 0, 0.1);
          }
          to {
            box-shadow: 0 0 50px rgba(255, 215, 0, 0.9),
              inset 0 0 30px rgba(255, 215, 0, 0.2);
          }
        }
      `}</style>
    </div>
  );
}