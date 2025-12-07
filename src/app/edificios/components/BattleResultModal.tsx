"use client";
import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { motion } from "framer-motion";

export default function BattleResultModal({
  open,
  report,
  onClose,
}: {
  open: boolean;
  report: any;
  onClose: () => void;
}) {
  const [showConfetti, setShowConfetti] = useState(false);
  const youWin = report?.attackerWins;

  useEffect(() => {
    if (open && youWin) {
      setShowConfetti(true);
      const audio = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-triumphant-bugle-2163.mp3");
      audio.volume = 0.8;
      audio.play().catch(() => {});

      const timer = setTimeout(() => setShowConfetti(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [open, youWin]);

  if (!open || !report) return null;

  const loot = report.loot || {};
  const hasLoot = Object.values(loot).some((amt: any) => amt > 0);

  return (
    <>
     
      {showConfetti && youWin && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={1000}
          gravity={0.12}
          initialVelocityY={-15}
          colors={["#FFD700", "#FF4500", "#FFA500", "#FFFF00", "#FF6347", "#FF8C00"]}
          confettiSource={{ x: window.innerWidth / 2, y: 0, w: 0, h: 0 }}
        />
      )}

      {/* FONDO OSCURO */}
      <div className="fixed inset-0 bg-black/95 z-60 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 15 }}
          className={`relative bg-gradient-to-b ${
            youWin
              ? "from-yellow-900 via-orange-900 to-red-950 border-yellow-600"
              : "from-red-900 via-black to-red-950 border-red-600"
          } border-8 rounded-3xl p-12 max-w-3xl text-center shadow-2xl`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* TÍTULO */}
          <h1 className={`text-8xl font-black mb-10 drop-shadow-2xl ${
            youWin ? "text-yellow-400" : "text-red-500"
          }`}>
            {youWin ? "¡VICTORIA!" : "¡DERROTA!"}
          </h1>

       
          <div className="space-y-6 text-3xl text-white">
            {/* ESTADÍSTICAS */}
            <p>
              Tus bajas: <strong className={youWin ? "text-orange-400" : "text-red-400"}>
                {report.attacker?.losses || 0}
              </strong> soldados
            </p>
            <p>
              Bajas enemigas: <strong className={youWin ? "text-green-400" : "text-yellow-300"}>
                {report.defender?.losses || 0}
              </strong> soldados
            </p>

            {/* SAQUEO */}
            {hasLoot && (
              <div className={`bg-${youWin ? "yellow" : "red"}-900/50 rounded-2xl p-6 mt-6`}>
                <p className="text-4xl mb-4 text-yellow-300 font-bold">
                  {youWin ? "SAQUEO ÉPICO" : "TE SAQUEARON"}
                </p>
                {loot.gold > 0 && <p className="text-3xl">+ {loot.gold} Oro</p>}
                {loot.food > 0 && <p className="text-3xl">+ {loot.food} Comida</p>}
                {loot.lumber > 0 && <p className="text-3xl">+ {loot.lumber} Madera</p>}
                {loot.stone > 0 && <p className="text-3xl">+ {loot.stone} Piedra</p>}
              </div>
            )}

           
            
          </div>

          {/* BOTÓN */}
          <button
            onClick={onClose}
            className={`mt-12 px-24 py-8 bg-${youWin ? "yellow" : "red"}-700 hover:bg-${youWin ? "yellow" : "red"}-600 text-${youWin ? "black" : "white"} text-5xl font-black rounded-full shadow-2xl transition-all transform hover:scale-110`}
          >
            {youWin ? "CERRAR" : "CERRAR"}
          </button>
        </motion.div>
      </div>
    </>
  );
}