"use client";
import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { motion } from "framer-motion";

export default function BattleResultModal({
  open,
  report,
  onClose
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

      // SONIDO ÉPICO DE TROMPETAS EN VICTORIA
      const audio = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-triumphant-bugle-2163.mp3");
      audio.volume = 0.7;
      audio.play().catch(() => {});

      const timer = setTimeout(() => setShowConfetti(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [open, youWin]);

  if (!open || !report) return null;

  // Recursos saqueados (si ganaste) o perdidos (si perdiste)
  const loot = report.loot || {};
  const hasLoot = Object.values(loot).some((amt: any) => amt > 0);

  return (
    <>
      {/* CONFETTI SOLO EN VICTORIA */}
      {showConfetti && youWin && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={800}
          gravity={0.15}
          colors={["#FFD700", "#FF4500", "#FFA500", "#FFFF00", "#FF6347"]}
        />
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 15 }}
          className={`relative p-12 rounded-3xl text-center max-w-2xl border-8 shadow-2xl
            ${youWin 
              ? "bg-gradient-to-b from-yellow-600 via-orange-700 to-red-900 border-yellow-400" 
              : "bg-gradient-to-b from-gray-900 via-black to-gray-800 border-red-800"
            }`}
          onClick={(e) => e.stopPropagation()}
        >

          {/* TÍTULO ÉPICO */}
          <motion.h1
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={`text-8xl font-black drop-shadow-2xl mb-8
              ${youWin ? "text-yellow-300" : "text-red-500"}
            `}
          >
            {youWin ? "¡VICTORIA TOTAL!" : "DERROTA"}
          </motion.h1>

          {/* ESTADÍSTICAS COMUNES */}
          <div className="space-y-6 text-3xl text-white mb-10">
            <motion.p animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
              Tus bajas: <strong className={youWin ? "text-orange-300" : "text-red-400"}>
                {report.attacker?.losses || 0}
              </strong> soldados
            </motion.p>
            <motion.p animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2.3 }}>
              Bajas enemigas: <strong className={youWin ? "text-green-400" : "text-yellow-300"}>
                {report.defender?.losses || 0}
              </strong> soldados
            </motion.p>
          </div>

          {/* RECURSOS + TROFEOS + ELO (AHORA TAMBIÉN EN DERROTA) */}
          {hasLoot && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className={`text-4xl font-bold space-y-4 mb-8
                ${youWin ? "text-yellow-300" : "text-red-400"}
              `}
            >
              <p className="text-5xl mb-6 font-black">
                {youWin ? "¡SAQUEO EXITOSO!" : "TE SAQUEARON"}
              </p>

              {loot.gold > 0 && (
                <p>{youWin ? "+" : "-"}{loot.gold} Oro {youWin ? "saqueado" : "perdido"}</p>
              )}
              {loot.food > 0 && (
                <p>{youWin ? "+" : "-"}{loot.food} Comida {youWin ? "robada" : "perdida"}</p>
              )}
              {loot.lumber > 0 && (
                <p>{youWin ? "+" : "-"}{loot.lumber} Madera {youWin ? "robada" : "perdida"}</p>
              )}
              {loot.stone > 0 && (
                <p>{youWin ? "+" : "-"}{loot.stone} Piedra {youWin ? "perdida" : "robada"}</p>
              )}

              <p className="text-6xl mt-8 font-black">
                {youWin ? "+25" : "-20"} Trofeos
              </p>

              <p className="text-4xl">
                ELO: {youWin ? report.attacker?.elo : report.defender?.elo} {" "}
                <span className={youWin ? "text-green-400" : "text-red-500"}>
                  ({youWin ? "+" : "-"}{Math.round(Math.abs((youWin ? report.attacker?.elo : report.defender?.elo) - 1200) * 0.08)})
                </span>
              </p>
            </motion.div>
          )}

          {/* BOTÓN FINAL ÉPICO */}
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className={`px-24 py-10 text-6xl font-black rounded-full shadow-2xl transition-all
              ${youWin 
                ? "bg-yellow-500 hover:bg-yellow-400 text-black" 
                : "bg-red-700 hover:bg-red-600 text-white"
              }`}
          >
            {youWin ? "¡CERRAR!" : "VENGANZA"}
          </motion.button>
        </motion.div>
      </motion.div>
    </>
  );
}