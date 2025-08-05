// src/app/generadores/objects/generador.ts
export default interface Generadores {
  id: number;
  name: string;
  img: JSX.Element;
  precio: number;
  produccion_hora: number;
  obreros: number;
  level: number;
  desbloqueo: number;
  maxObreros: number;
  position: { x: number; y: number };
  aumentar: boolean;
  capacity: number;
  maxCapacity: number;
  updateTime: Date;
}