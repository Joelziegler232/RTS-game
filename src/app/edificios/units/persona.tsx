import { useState, useEffect, MutableRefObject } from "react";
import Image from "next/image";

export default function Persona({
  reference,
}: {
  reference: MutableRefObject<{
    x: number;
    y: number;
  }>;
}) {
  const [unitPosition, setUnitPosition] = useState({ x: 500, y: 500 });

  useEffect(() => {
    const intervalId = setInterval(() => {
      setUnitPosition({ ...reference.current }); 
    }, 5);

    return () => {
      clearInterval(intervalId);
    };
  }, [reference]); 

  return (
    <div
      className="absolute"
      style={{
        left: unitPosition.x,
        top: unitPosition.y,
      }}
    >
    
    </div>
  );
}
