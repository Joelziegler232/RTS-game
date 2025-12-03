
export default interface Units {
  id: number;
  name: string;
  img: React.ReactNode;
  precio: number;
  incrementador_time: number;
  level: number;
  desbloqueo: number;
  position?: { x: number; y: number }; 
}