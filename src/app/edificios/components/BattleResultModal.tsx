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
      {/* CONFETTI  */}
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

      {/* ANIMACIÓN */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/98 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* MODAL ÉPICO */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 15 }}
          className={`relative p-16 rounded-3xl text-center max-w-3xl border-8 shadow-2xl overflow-hidden
            ${youWin 
              ? "bg-gradient-to-b from-yellow-700 via-orange-800 to-red-950 border-yellow-400" 
              : "bg-gradient-to-b from-gray-900 via-black to-gray-800 border-red-900"
            }`}
          onClick={(e) => e.stopPropagation()}
          style={{
            backgroundImage: youWin ? "url('/victory-bg.jpg')" : "url('/defeat-bg.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* TÍTULO LEGENDARIO */}
          <motion.h1
            initial={{ y: -120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
            className={`text-9xl font-black drop-shadow-2xl mb-10 tracking-wider
              ${youWin ? "text-yellow-300" : "text-red-600"}
              ${youWin ? "animate-pulse" : ""}
            `}
            style={{
              textShadow: youWin 
                ? "0 0 30px #FFD700, 0 0 60px #FF4500" 
                : "0 0 30px #8B0000, 0 0 60px #000000",
            }}
          >
            {youWin ? "¡VICTORIA TOTAL!" : "DERROTA"}
          </motion.h1>

          {/* ESTADÍSTICAS DE BATALLA */}
          <div className="space-y-8 text-4xl text-white font-bold mb-12">
            <motion.p
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 2.5 }}
              className="drop-shadow-lg"
            >
              Tus bajas: <span className={youWin ? "text-orange-400" : "text-red-500"}>
                {report.attacker?.losses || 0}
              </span> soldados
            </motion.p>
            <motion.p
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 2.8 }}
              className="drop-shadow-lg"
            >
              Bajas enemigas: <span className={youWin ? "text-green-400" : "text-yellow-300"}>
                {report.defender?.losses || 0}
              </span> soldados
            </motion.p>
          </div>

          {/* SAQUEO O PÉRDIDA */}
          {hasLoot && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className={`text-5xl font-black space-y-6 mb-12
                ${youWin ? "text-yellow-300" : "text-red-400"}
              `}
            >
              <p className="text-7xl mb-8">
                {youWin ? "SAQUEO ÉPICO" : "TE SAQUEARON"}
              </p>

              {loot.gold > 0 && <p>{youWin ? "+" : "-"}{loot.gold} Oro</p>}
              {loot.food > 0 && <p>{youWin ? "+" : "-"}{loot.food} Comida</p>}
              {loot.lumber > 0 && <p>{youWin ? "+" : "-"}{loot.lumber} Madera</p>}
              {loot.stone > 0 && <p>{youWin ? "+" : "-"}{loot.stone} Piedra</p>}

              {/* TROFEOS Y ELO */}
              <p className="text-8xl mt-10 font-extrabold">
                {youWin ? "+25" : "-20"} TROFEOS
              </p>

              <p className="text-5xl">
                ELO: {youWin ? report.attacker?.elo : report.defender?.elo}{" "}
                <span className={youWin ? "text-green-400" : "text-red-600"}>
                  ({youWin ? "+" : "-"}{Math.round(Math.abs((youWin ? report.attacker?.elo : report.defender?.elo) - 1200) * 0.08)})
                </span>
              </p>
            </motion.div>
          )}

          {/* BOTÓN FINAL */}
          <motion.button
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className={`px-32 py-12 text-7xl font-black rounded-full shadow-2xl transition-all duration-300
              ${youWin 
                ? "bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 text-black" 
                : "bg-gradient-to-r from-red-800 to-black hover:from-red-700 hover:to-gray-900 text-white"
              }`}
            style={{
              boxShadow: youWin 
                ? "0 0 40px #FFD700, 0 0 80px #FF4500" 
                : "0 0 40px #8B0000",
            }}
          >
            {youWin ? "CERRAR" : "VENGANZA"}
          </motion.button>
        </motion.div>
      </motion.div>
    </>
  );
}