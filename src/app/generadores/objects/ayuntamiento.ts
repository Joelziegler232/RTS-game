// Definición de la interfaz Ayuntamiento para representar las características de un ayuntamiento en un contexto específico
export default interface Ayuntamiento {
  // Identificador único del ayuntamiento
  id: number;
  // Nombre del ayuntamiento
  name: string;
  // Imagen del ayuntamiento, representada como un nodo React
  img: React.ReactNode;
  // precio de construcción del ayuntamiento
  precio: number;
  // Tipo de recurso que produce el ayuntamiento
  producing: string;
  // Producción por hora del ayuntamiento
  produccion_hora: number;
  // Número de trabajadores del ayuntamiento
  obreros: number;
  // Nivel del ayuntamiento
  level: number;
  // Nivel de desbloqueo del ayuntamiento
  desbloqueo: number;
  // Número máximo de trabajadores del ayuntamiento
  maxObreros: number;
  // Capacidad máxima de recursos del ayuntamiento (opcional)
  maxCap?: number;
  // Posición del ayuntamiento en el mapa
  position: { x: number; y: number };
}
