
export default interface Ayuntamiento {

  id: number;

  name: string;

  img: React.ReactNode;

  precio: number;

  producing: string;

  produccion_hora: number;

  obreros: number;

  level: number;

  desbloqueo: number;

  maxObreros: number;
 
  maxCap?: number;
  
  position: { x: number; y: number };
}
