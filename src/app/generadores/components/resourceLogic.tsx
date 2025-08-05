import React, { useState, useEffect, useContext } from 'react';
import { GeneradorContext } from "./generadorContext"; // Importa el contexto GeneradorContext
 

const Generador = (props: {
    type: string; // Tipo de generador (no utilizado en este código)
    maxObreros?: number; // Número máximo de obreros que se pueden asignar al generador
    obrerosAssigned?: number; // Número actual de obreros asignados al generador (opcional)
}) => {
    // Estados locales del componente Generador
    const [production, setProduction] = useState(0); // Producción actual del generador
    const [obrerosAssigned, setObrerosAssigned] = useState(props.obrerosAssigned || 0); // Número de obreros asignados al generador
    const [extractionCapacity, setExtractionCapacity] = useState(10 * (props.obrerosAssigned || 0)); // Capacidad de extracción del generador
    const { totalProduction, setTotalProduction } = useContext(GeneradorContext); // Obtiene totalProduction y setTotalProduction del contexto GeneradorContext
    const [improvements, setImprovements] = useState(0); // Mejoras realizadas en la capacidad de extracción

    // Efecto que se ejecuta al montar el componente y cada vez que cambian obrerosAssigned, extractionCapacity o setTotalProduction
    useEffect(() => {
        // Configura un temporizador que se ejecuta cada 60 segundos
        const timer = setInterval(() => {
            const newProduction = obrerosAssigned * extractionCapacity; // Calcula la producción actual del generador
            setProduction(newProduction); // Actualiza el estado de production
            setTotalProduction(prevTotal => prevTotal + newProduction); // Actualiza el total de producción en el contexto
        }, 60000); // Intervalo de ejecución del temporizador (60000 milisegundos = 60 segundos)

        // Retorna una función de limpieza que se ejecuta al desmontar el componente o al actualizar el efecto
        return () => clearInterval(timer); // Limpia el temporizador para evitar fugas de memoria
    }, [obrerosAssigned, extractionCapacity, setTotalProduction]); // Dependencias del efecto, se ejecuta si alguna de estas cambia

    // Función para manejar cambios en el número de obreros asignados
    const handleObrerosAssignedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newObrerosAssigned = Number(event.target.value); // Obtiene el nuevo número de obreros asignados desde el evento
        if (props.maxObreros !== undefined && newObrerosAssigned > props.maxObreros) {
            setObrerosAssigned(props.maxObreros); // Limita el número de obreros asignados al máximo especificado
        } else {
            setObrerosAssigned(newObrerosAssigned); // Actualiza el número de obreros asignados
        }
    };

    // Función para mejorar la capacidad de extracción del generador
    const improveExtractionCapacity = () => {
        if (totalProduction >= 500) { // Verifica si hay suficiente producción total para realizar la mejora
            setTotalProduction(prevTotal => prevTotal - 500); // Reduce la producción total en 500 unidades
            setExtractionCapacity(prevCapacity => prevCapacity + 1); // Aumenta la capacidad de extracción en 1 unidad
            setImprovements(prevImprovements => prevImprovements + 1); // Incrementa el contador de mejoras

            // Establece un temporizador para revertir la mejora después de 3 minutos (180000 milisegundos)
            setTimeout(() => {
                setExtractionCapacity(prevCapacity => prevCapacity - improvements); // Revierte la capacidad de extracción
                setImprovements(0); // Reinicia el contador de mejoras a cero
            }, 180000); // Tiempo de espera antes de revertir la mejora (180000 milisegundos = 3 minutos)
        } else {
            alert('No tienes suficientes recursos para mejorar la capacidad de extracción.'); // Alerta si no hay suficientes recursos para la mejora
        }
    };

    return null; // El componente no renderiza ningún contenido visible, posiblemente se utilizará solo para lógica y efectos secundarios
};

export default Generador;
