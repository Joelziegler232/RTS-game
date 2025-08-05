// src/app/edificios/units/unit.tsx
import { useRef, useEffect } from "react";
import * as THREE from "three";
import styles from "./Unit.module.css"; // Nuevo archivo CSS

interface UnitProps {
  initialPosition: { x: number; y: number }; // Posición en coordenadas de grilla (0-99)
  mapWidth: number;
  mapHeight: number;
  scene: THREE.Scene; // Escena pasada desde mapBuilding
}

export default function Unit({ initialPosition, mapWidth, mapHeight, scene }: UnitProps) {
  const unitRef = useRef<THREE.Sprite | null>(null);
  const positionRef = useRef({ x: initialPosition.x, y: initialPosition.y });

  useEffect(() => {
    // Crear sprite para la unidad
    const texture = new THREE.TextureLoader().load("/unit.png"); // Imagen para la unidad
    const material = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(material);
    sprite.position.set(
      initialPosition.x - mapWidth / 2 + 0.5,
      0.5,
      initialPosition.y - mapHeight / 2 + 0.5
    );
    sprite.scale.set(1, 1, 1);
    scene.add(sprite);
    unitRef.current = sprite;

    // Iniciar movimiento
    moveRandomUnit(20, { x: 50, y: 50 });

    return () => {
      if (unitRef.current) {
        scene.remove(unitRef.current);
      }
    };
  }, [scene, mapWidth, mapHeight, initialPosition]);

  function moveCreeper(newPosition: { x: number; y: number }) {
    const positionToChange = { ...positionRef.current };
    const moveStepByStep = () => {
      if (newPosition.x !== positionRef.current.x) {
        newPosition.x < positionRef.current.x
          ? (positionToChange.x -= 0.1)
          : (positionToChange.x += 0.1);
      }
      if (newPosition.y !== positionRef.current.y) {
        newPosition.y < positionRef.current.y
          ? (positionToChange.y -= 0.1)
          : (positionToChange.y += 0.1);
      }
      positionRef.current = positionToChange;

      if (unitRef.current) {
        unitRef.current.position.set(
          positionRef.current.x - mapWidth / 2 + 0.5,
          0.5,
          positionRef.current.y - mapHeight / 2 + 0.5
        );
      }

      if (
        Math.abs(newPosition.x - positionRef.current.x) < 0.1 &&
        Math.abs(newPosition.y - positionRef.current.y) < 0.1
      ) {
        clearInterval(intervalId);
        console.log("Arrived at destination");
      }
    };
    const intervalId = setInterval(moveStepByStep, 16); // ~60 FPS
  }

  function moveRandomUnit(radius: number, center: { x: number; y: number }) {
    positionRef.current = { x: center.x, y: center.y + radius / 2 };

    const moveInCircle = () => {
      const rndNumber = Math.random();
      const moveDirection = rndNumber >= 0.5 ? 1 : -1;
      let newPosition = { x: positionRef.current.x, y: positionRef.current.y };

      if (Math.abs(positionRef.current.y - (center.y + radius / 2)) < 0.1) {
        newPosition.x += moveDirection * radius / 2;
        newPosition.y -= radius;
      } else if (Math.abs(positionRef.current.y - (center.y - radius / 2)) < 0.1) {
        newPosition.x += moveDirection * radius / 2;
        newPosition.y += radius;
      } else if (Math.abs(positionRef.current.x - (center.x + radius)) < 0.1) {
        newPosition.x -= radius / 2;
        newPosition.y += radius;
      } else {
        newPosition.x += radius / 2;
        newPosition.y += moveDirection * radius / 2;
      }

      moveCreeper(newPosition);
    };
    const movement = setInterval(moveInCircle, 4000);

    return () => clearInterval(movement);
  }

  return null; // No renderizamos nada en el DOM, todo es manejado por Three.js
}