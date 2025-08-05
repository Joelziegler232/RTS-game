// src/app/edificios/utils/StructuresData.ts
import Image from "next/image";

export interface Structure {
  id: number;
  name: string;
  type: "lumber" | "gold_mine" | "stone_mine" | "ayuntamiento" | "shipyard";
  img?: JSX.Element;
  precio: number;
  produccion_hora?: number;
  obreros?: number;
  level?: number;
  desbloqueo?: number;
  maxObreros?: number;
  maxCap?: number;
  maxCapacity?: number;
  aumentar?: boolean;
  producing?: string;
  position?: { x: number; y: number };
  updateTime?: Date;
  spriteImage: string;
  capacity?: number;
}

export interface Generadores extends Structure {
  type: "lumber" | "gold_mine" | "stone_mine";
  produccion_hora: number;
  obreros: number;
  maxObreros: number;
  maxCapacity: number;
  aumentar: boolean;
  capacity: number;
  updateTime: Date;
}

export const structures: Structure[] = [
  {
    id: 1,
    name: "Fabrica de madera",
    type: "lumber",
    img: (
      <Image
        src="/madera_generador.png"
        width={20}
        height={20}
        alt="png of Generador de madera"
      />
    ),
    spriteImage: "/madera_generador.png",
    precio: 100,
    produccion_hora: 1,
    obreros: 1,
    level: 1,
    desbloqueo: 1,
    maxObreros: 1,
    maxCapacity: 200,
    aumentar: false,
    updateTime: new Date(),
    capacity: 0,
  },
  {
    id: 2,
    name: "Casa de Oración",
    type: "ayuntamiento",
    img: (
      <Image
        src="/casa_oracion.png"
        width={20}
        height={20}
        alt="jpeg of the Ayuntamiento"
      />
    ),
    spriteImage: "/casa_oracion.png",
    precio: 5,
    produccion_hora: 1,
    obreros: 1,
    level: 1,
    desbloqueo: 1,
    maxObreros: 10,
    maxCap: 20,
    producing: "",
  },
  {
    id: 3,
    name: "Astillero",
    type: "shipyard",
    img: (
      <Image
        src="/port.png"
        width={20}
        height={20}
        alt="png of Astillero"
      />
    ),
    spriteImage: "/port.png",
    precio: 100,
  },
  {
    id: 4,
    name: "Mina de oro",
    type: "gold_mine",
    img: (
      <Image
        src="/gold_mine.png"
        width={20}
        height={20}
        alt="png of Mina de oro"
      />
    ),
    spriteImage: "/gold_mine.png",
    precio: 150,
    produccion_hora: 1,
    obreros: 1,
    level: 1,
    desbloqueo: 1,
    maxObreros: 1,
    maxCapacity: 200,
    aumentar: false,
    updateTime: new Date(),
    capacity: 0,
  },
  {
    id: 5,
    name: "Mina de piedra",
    type: "stone_mine",
    img: (
      <Image
        src="/stone_mine.png"
        width={20}
        height={20}
        alt="png of Mina de piedra"
      />
    ),
    spriteImage: "/stone_mine.png",
    precio: 120,
    produccion_hora: 1,
    obreros: 1,
    level: 1,
    desbloqueo: 1,
    maxObreros: 1,
    maxCapacity: 200,
    aumentar: false,
    updateTime: new Date(),
    capacity: 0,
  },
];

export const structuresForBackend = structures.map(({ img, ...rest }) => rest);