// src/app/components/BattleModal.tsx (o donde lo tengas)
"use client";
import React from "react";

export default function BattleModal({
  open,
  onClose,
  enemy,
  onAttack,
  loading,
  onSearchAgain, // NUEVO PROP
}: {
  open: boolean;
  onClose: () => void;
  enemy: any | null;
  onAttack: () => Promise<void>;
  loading?: boolean;
  onSearchAgain: () => void; // para buscar otro
}) {
  if (!open || !enemy) return null;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.95)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 3000,
    }}>
      <div style={{
        background: "linear-gradient(135deg, #1a1a2e, #16213e)",
        padding: "30px 40px",
        borderRadius: "16px",
        border: "3px solid #ffd700",
        color: "white",
        textAlign: "center",
        maxWidth: "400px",
        boxShadow: "0 0 30px rgba(255,215,0,0.6)",
      }}>
        <h2 style={{ fontSize: "28px", margin: "0 0 20px 0", color: "#ffd700" }}>
          Enemigo encontrado
        </h2>

        <div style={{ fontSize: "20px", margin: "15px 0" }}>
          <p><strong>Jugador:</strong> {enemy.name}</p>
          <p><strong>Soldados:</strong> {enemy.soldiers}</p>
          <p><strong>Nivel:</strong> {enemy.level}</p>
        </div>

        <div style={{ marginTop: "25px", display: "flex", gap: "12px", justifyContent: "center" }}>
          <button
            onClick={onAttack}
            disabled={loading}
            style={{
              padding: "12px 24px",
              background: "#c62828",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "18px",
              fontWeight: "bold",
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "ATACANDO..." : "ATACAR"}
          </button>

          <button
            onClick={onSearchAgain}
            style={{
              padding: "12px 20px",
              background: "#43a047",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "bold"
            }}
          >
            Buscar otro
          </button>

          <button
            onClick={onClose}
            style={{
              padding: "12px 20px",
              background: "#666",
              color: "white",
              border: "none",
              borderRadius: "8px"
            }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}