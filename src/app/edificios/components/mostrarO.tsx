"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";

export default function Mostrar(props: {
  appearence: boolean;
  structure: number | null;
}) {
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [visibleBuildingDetails, setvisibleBuildingDetails] = useState(false);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setCursorPosition({ x: event.clientX, y: event.clientY });
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);

    };
  }, []);

  const structure_images = {
    1: "Aserradero.jpg",
    2: "Ayuntamiento.jpeg",
  };

  return (
    <div>
      {props.appearence && (
        <div
          className="absolute pointer-events-none"
          style={{
            left: Math.floor(cursorPosition.x / 30) * 30,
            top: Math.floor(cursorPosition.y / 30) * 30,
          }}
        >
          <div className="flex flex-col">
            <div className="absolute w-20 h-20 bg-green-500 rotate-[38deg] -skew-x-[15deg] z-10 mt-3" />
          </div>
        </div>
      )}
    </div>
  );
}
