import Image from "next/image";
import React, { useState, useEffect, MouseEventHandler } from "react";

const Mostrar = () => {
  const [showCursorMarker, setShowCursorMarker] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [structures, setStructures] = useState<{ [key: string]: { x: number; y: number } }>({});

  const handleMouseMove: MouseEventHandler = (e) => {
    setCursorPosition({ x: e.pageX, y: e.pageY });
  };

  const handleClick = () => {
    setStructures((prevStructures) => ({
      ...prevStructures,
      [`structure-${Date.now()}`]: { x: cursorPosition.x, y: cursorPosition.y },
    }));
    setShowCursorMarker(false);
  };

  const handleButtonClick = () => {
    setShowCursorMarker((current) => !current);
  };

  return (
    <div className="w-full h-full relative">
      <button
        className="absolute bg-blue-500 text-white px-4 py-2 rounded-md ml-4"
        onClick={handleButtonClick}
      >
        {showCursorMarker ? "Disable Cursor Marker" : "Enable Cursor Marker"}
      </button>
      {showCursorMarker && (
        <div
          className="absolute w-4 h-4 bg-green-500 rounded-full pointer-events-none"
          style={{ left: cursorPosition.x, top: cursorPosition.y }}
        ></div>
      )}

      {Object.entries(structures).map(([key, structure]) => (
        <div
          key={key}
          className="absolute w-4 h-4 bg-red-500 rounded-full pointer-events-none"
          style={{ left: structure.x, top: structure.y }}
        ></div>
      ))}
      <Image
        src="/Mapaage.jpg"
        alt="map"
        width={2000}
        height={500}
        onClick={showCursorMarker ? handleClick : undefined}
        onMouseMove={handleMouseMove}
        className="inset-0 w-full h-full object-cover"
      />
    </div>
  );
};

export default Mostrar;
