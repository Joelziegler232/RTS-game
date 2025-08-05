import React, { createContext, Dispatch, SetStateAction, useContext } from 'react';

// Definición de las propiedades del contexto GeneradorContext
interface GeneradorContextProps {
    totalProduction: number; // Número total de producción
    setTotalProduction: Dispatch<SetStateAction<number>>; // Función para actualizar el estado de totalProduction
}

// Valor inicial del contexto GeneradorContext
const initialContextValue: GeneradorContextProps = {
    totalProduction: 0, // Inicialmente la producción total es 0
    setTotalProduction: () => {}, // Función vacía por defecto para actualizar la producción total
};

// Creación del contexto GeneradorContext
export const GeneradorContext = createContext<GeneradorContextProps>(initialContextValue);

// Hook personalizado para acceder al contexto GeneradorContext
export const useGeneradorContext = () => useContext(GeneradorContext);

