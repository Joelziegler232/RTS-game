"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";

// Componente que muestra una previsualización del edificio al construir (el "fantasma" verde)
export default function Mostrar(props: {
  appearence: boolean;  // Si es true → se muestra la previsualización
  structure: number | null; // ID del edificio que se está colocando
}) {
  // Posición actual del ratón (en píxeles)
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  // Estado para controlar si se muestra el menú de detalles (no usado aún)
  const [visibleBuildingDetails, setvisibleBuildingDetails] = useState(false);

  // Seguimos el movimiento del ratón para posicionar el fantasma del edificio
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setCursorPosition({ x: event.clientX, y: event.clientY });
    };

    document.addEventListener("mousemove", handleMouseMove);

    // Limpiamos el evento cuando se desmonta el componente
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Mapeo de IDs de estructuras a sus imágenes (puedes expandirlo)
  const structure_images = {
    1: "Aserradero.jpg",
    2: "Ayuntamiento.jpeg",
  };

  return (
    <div>
      {/* Solo se muestra si appearence es true (cuando estás construyendo) */}
      {props.appearence && (
        <div
          className="absolute pointer-events-none" // No bloquea clics
          style={{
            // Alinea el fantasma a una grilla de 30x30 píxeles
            left: Math.floor(cursorPosition.x / 30) * 30,
            top: Math.floor(cursorPosition.y / 30) * 30,
          }}
        >
          <div className="flex flex-col">
            {/* Fantasma verde semitransparente que sigue al cursor */}
            <div className="absolute w-20 h-20 bg-green-500 rotate-[38deg] -skew-x-[15deg] z-10 mt-3 opacity-60" />
            
            {/* Aquí podrías poner la imagen real del edificio si quisieras */}
            {/* <Image src={structure_images[props.structure!]} alt="Edificio" width={80} height={80} /> */}
          </div>
        </div>
      )}
    </div>
  );
}