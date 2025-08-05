// src/app/edificios/components/mapBuildings.tsx
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GameMap } from "../utils/MapGenerator";
import { units } from "./progressbar";
import Unit from "../units/units";
import BuildingDetails from "./building";
import { Structure, structures, Generadores } from "../utils/StructuresData";
import styles from "./MapBuilding.module.css";
import AyuntamientoDetails from "./ayuntamientoMenu";
import { User } from "@/app/objects/user";
import { Aumentador } from "@/app/objects/aumentar";

interface MapBuildingsProps {
  setAyuntamientoMenu: Dispatch<SetStateAction<boolean>>;
  ayunMenu: boolean;
  gameMap: GameMap;
  lumberCampArray: Structure[];
  goldMineArray: Structure[];
  stoneMineArray: Structure[];
  ayuntamientoArray: Structure[];
  shipyardArray: Structure[];
  structure: number | null;
  setStructure: Dispatch<SetStateAction<number | null>>;
  setLumberCampArray: Dispatch<SetStateAction<Structure[]>>;
  setGoldMineArray: Dispatch<SetStateAction<Structure[]>>;
  setStoneMineArray: Dispatch<SetStateAction<Structure[]>>;
  setAyuntamientoArray: Dispatch<SetStateAction<Structure[]>>;
  setShipyardArray: Dispatch<SetStateAction<Structure[]>>;
  user: User;
  setAppliedAumentar: Dispatch<SetStateAction<Aumentador | null>>;
  progressBar: boolean | null;
}

export default function MapBuildings({
  setAyuntamientoMenu,
  ayunMenu,
  gameMap,
  lumberCampArray,
  goldMineArray,
  stoneMineArray,
  ayuntamientoArray,
  shipyardArray,
  structure,
  setStructure,
  setLumberCampArray,
  setGoldMineArray,
  setStoneMineArray,
  setAyuntamientoArray,
  setShipyardArray,
  user,
  setAppliedAumentar,
  progressBar,
}: MapBuildingsProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const [visibleBuildingDetails, setVisibleBuildingDetails] = useState(false);
  const [visibleAyuntamientoDetails, setVisibleAyuntamientoDetails] = useState(false);
  const [ayuntamientoInfo, setAyuntamientoInformation] = useState<Structure | null>(null);
  const [buildingInformation, setBuildingInformation] = useState<Generadores | null>(null);
  const [draggingBuilding, setDraggingBuilding] = useState<THREE.Sprite | null>(null);

  function generadorData(index: number) {
    const building = [...lumberCampArray, ...goldMineArray, ...stoneMineArray].find(
      (generador): generador is Generadores =>
        generador.id === index &&
        generador.produccion_hora !== undefined &&
        generador.obreros !== undefined &&
        generador.maxObreros !== undefined &&
        generador.maxCapacity !== undefined &&
        generador.aumentar !== undefined &&
        generador.capacity !== undefined &&
        generador.updateTime !== undefined
    );
    if (building) {
      setBuildingInformation(building);
      setVisibleBuildingDetails(!visibleBuildingDetails);
    }
  }

  function ayuntamientoMenu(index: number) {
    const ayuntamiento = ayuntamientoArray.find((ayuntamiento) => ayuntamiento.id === index);
    if (ayuntamiento) {
      setAyuntamientoInformation(ayuntamiento);
      setVisibleAyuntamientoDetails(!visibleAyuntamientoDetails);
      setAyuntamientoMenu(!ayunMenu);
    }
  }

  useEffect(() => {
    const mountNode = mountRef.current;
    if (!mountNode) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    cameraRef.current = camera;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    rendererRef.current = renderer;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountNode.appendChild(renderer.domElement);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let isDraggingCamera = false;
    let previousMousePosition = { x: 0, y: 0 };

    const handleMouseDown = (event: MouseEvent) => {
      if (draggingBuilding) return;
      isDraggingCamera = true;
      previousMousePosition = { x: event.clientX, y: event.clientY };
    };

    const handleMouseMove = (event: MouseEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      if (isDraggingCamera && cameraRef.current) {
        const deltaX = event.clientX - previousMousePosition.x;
        const deltaY = event.clientY - previousMousePosition.y;
        cameraRef.current.position.x -= deltaX * 0.1;
        cameraRef.current.position.z -= deltaY * 0.1;
        previousMousePosition = { x: event.clientX, y: event.clientY };
      }

      if (draggingBuilding && cameraRef.current) {
        raycaster.setFromCamera(mouse, cameraRef.current);
        const terrain = scene.children.find(
          (obj) => obj instanceof THREE.Mesh && obj.geometry instanceof THREE.PlaneGeometry
        );
        if (!terrain) {
          console.log("Terreno no encontrado en la escena");
          return;
        }
        const intersects = raycaster.intersectObject(terrain);
        if (intersects.length > 0) {
          const point = intersects[0].point;
          draggingBuilding.position.set(Math.round(point.x) + 0.5, 0.5, Math.round(point.z) + 0.5);
        }
      }
    };

    const handleMouseUp = (event: MouseEvent) => {
      isDraggingCamera = false;
      if (draggingBuilding && structure !== null && cameraRef.current) {
        const position = draggingBuilding.position;
        const tileX = Math.round(position.x + gameMap.width / 2);
        const tileY = Math.round(position.z + gameMap.height / 2);
        const tileIndex = tileY * gameMap.width + tileX;
        const tile = gameMap.tiles[tileIndex];

        if (tile && (structure === 3 ? tile.terrainType === "water" : tile.terrainType !== "water")) {
          const selectedStructure = structures.find((s) => s.id === structure);
          if (selectedStructure) {
            const newStructure: Structure = {
              ...selectedStructure,
              id:
                selectedStructure.type === "lumber"
                  ? lumberCampArray.length
                  : selectedStructure.type === "gold_mine"
                  ? goldMineArray.length
                  : selectedStructure.type === "stone_mine"
                  ? stoneMineArray.length
                  : selectedStructure.type === "ayuntamiento"
                  ? ayuntamientoArray.length
                  : shipyardArray.length,
              position: { x: tileX, y: tileY },
              updateTime:
                selectedStructure.type === "lumber" ||
                selectedStructure.type === "gold_mine" ||
                selectedStructure.type === "stone_mine"
                  ? new Date()
                  : undefined,
            };

            switch (selectedStructure.type) {
              case "lumber":
                setLumberCampArray((prev) => [...prev, newStructure]);
                break;
              case "gold_mine":
                setGoldMineArray((prev) => [...prev, newStructure]);
                break;
              case "stone_mine":
                setStoneMineArray((prev) => [...prev, newStructure]);
                break;
              case "ayuntamiento":
                setAyuntamientoArray((prev) => [...prev, newStructure]);
                break;
              case "shipyard":
                setShipyardArray((prev) => [...prev, newStructure]);
                break;
            }

            const sprite = new THREE.Sprite(draggingBuilding.material.clone());
            sprite.material.opacity = 1.0;
            sprite.position.copy(position);
            sprite.scale.set(2, 2, 1);
            scene.add(sprite);
          }
        }
        scene.remove(draggingBuilding);
        setDraggingBuilding(null);
        setStructure(null);
      }
    };

    const handleWheel = (event: WheelEvent) => {
      if (cameraRef.current) {
        cameraRef.current.position.y += event.deltaY * 0.1;
        cameraRef.current.position.y = Math.max(10, Math.min(100, cameraRef.current.position.y));
      }
    };

    const handleResize = () => {
      if (cameraRef.current && rendererRef.current) {
        cameraRef.current.aspect = window.innerWidth / window.innerHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      }
    };

    const handleClick = (event: MouseEvent) => {
      if (draggingBuilding) return;
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      if (cameraRef.current && sceneRef.current) {
        raycaster.setFromCamera(mouse, cameraRef.current);
        const intersects = raycaster.intersectObjects(sceneRef.current.children);
        if (intersects.length > 0) {
          const intersected = intersects[0].object;
          if (intersected instanceof THREE.Sprite && intersected.userData.id !== undefined) {
            const { id, type } = intersected.userData;
            if (type === "ayuntamiento") {
              ayuntamientoMenu(id);
            } else if (type === "lumber" || type === "gold_mine" || type === "stone_mine") {
              generadorData(id);
            }
          }
        }
      }
    };

    const noise = (x: number, y: number) => {
      const scale = 0.05;
      return Math.sin(x * scale) * Math.sin(y * scale) + Math.random() * 0.3;
    };

    const textureLoader = new THREE.TextureLoader();
    const loadTexture = (url: string) =>
      new Promise<HTMLImageElement>((resolve) => {
        textureLoader.load(url, (texture) => resolve(texture.image));
      });

    Promise.all([
      loadTexture("/arena.png"),
      loadTexture("/hierba.png"),
      loadTexture("/agua.png"),
      loadTexture("/palmera.png"),
      loadTexture("/tree.png"),
    ])
      .then(([sandImg, grassImg, waterImg, palmImg, treeImg]) => {
        const tileSize = 100;
        const canvas = document.createElement("canvas");
        canvas.width = gameMap.width * tileSize;
        canvas.height = gameMap.height * tileSize;
        const context = canvas.getContext("2d")!;

        gameMap.tiles.forEach((tile) => {
          const { x, y } = tile;
          const noiseValue = noise(x, y);
          let img;

          if (y > 70 + noiseValue * 20) {
            tile.terrainType = "water";
            img = waterImg;
          } else if (Math.abs(x - 50) < 5 + noiseValue * 5 && y > 20 + noiseValue * 10) {
            tile.terrainType = "water";
            img = waterImg;
          } else if (x < 40 + noiseValue * 20 && y < 40 + noiseValue * 20) {
            tile.terrainType = "sand";
            img = sandImg;
          } else if (x > 50 + noiseValue * 20 && y > 20 && y < 60 + noiseValue * 10) {
            tile.terrainType = "forest";
            img = grassImg;
          } else {
            tile.terrainType = "grass";
            img = grassImg;
          }

          context.drawImage(img, tile.x * tileSize, tile.y * tileSize, tileSize, tileSize);
        });

        const terrainTexture = new THREE.CanvasTexture(canvas);
        terrainTexture.minFilter = THREE.LinearFilter;
        terrainTexture.magFilter = THREE.LinearFilter;

        const geometry = new THREE.PlaneGeometry(
          gameMap.width,
          gameMap.height,
          gameMap.width * 2,
          gameMap.height * 2
        );
        const material = new THREE.MeshPhongMaterial({ map: terrainTexture });
        const terrain = new THREE.Mesh(geometry, material);
        terrain.rotation.x = -Math.PI / 2;
        scene.add(terrain);

        const gridHelper = new THREE.GridHelper(gameMap.width, gameMap.width, 0x000000, 0x000000);
        gridHelper.position.y = 0.01;
        (gridHelper.material as THREE.LineBasicMaterial).linewidth = 2;
        scene.add(gridHelper);

        const ambientLight = new THREE.AmbientLight(0x404040);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(0, 50, 50);
        scene.add(directionalLight);

        const palmMaterial = new THREE.SpriteMaterial({ map: textureLoader.load("/palmera.png") });
        const treeMaterial = new THREE.SpriteMaterial({ map: textureLoader.load("/tree.png") });
        gameMap.tiles.forEach((tile) => {
          if (tile.terrainType === "sand" && Math.random() < 0.05) {
            const palm = new THREE.Sprite(palmMaterial);
            palm.position.set(tile.x - gameMap.width / 2 + 0.5, 0.5, tile.y - gameMap.height / 2 + 0.5);
            palm.scale.set(1.5, 1.5, 1);
            scene.add(palm);
          } else if (tile.terrainType === "forest" && Math.random() < 0.15) {
            const tree = new THREE.Sprite(treeMaterial);
            tree.position.set(tile.x - gameMap.width / 2 + 0.5, 0.5, tile.y - gameMap.height / 2 + 0.5);
            tree.scale.set(1, 1, 1);
            scene.add(tree);
          }
        });

        const buildingTextures = {
          lumber: textureLoader.load("/madera_generador.png", (texture) => {
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
          }),
          gold_mine: textureLoader.load("/gold_mine.png", (texture) => {
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
          }),
          stone_mine: textureLoader.load("/stone_mine.png", (texture) => {
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
          }),
          ayuntamiento: textureLoader.load("/casa_oracion.png", (texture) => {
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
          }),
          shipyard: textureLoader.load("/port.png", (texture) => {
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
          }),
        };

        lumberCampArray.forEach((building) => {
          const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: buildingTextures.lumber }));
          sprite.position.set(
            building.position!.x - gameMap.width / 2 + 0.5,
            0.5,
            building.position!.y - gameMap.height / 2 + 0.5
          );
          sprite.scale.set(2, 2, 1);
          sprite.userData = { id: building.id, type: "lumber" };
          scene.add(sprite);
        });
        goldMineArray.forEach((building) => {
          const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: buildingTextures.gold_mine }));
          sprite.position.set(
            building.position!.x - gameMap.width / 2 + 0.5,
            0.5,
            building.position!.y - gameMap.height / 2 + 0.5
          );
          sprite.scale.set(2, 2, 1);
          sprite.userData = { id: building.id, type: "gold_mine" };
          scene.add(sprite);
        });
        stoneMineArray.forEach((building) => {
          const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: buildingTextures.stone_mine }));
          sprite.position.set(
            building.position!.x - gameMap.width / 2 + 0.5,
            0.5,
            building.position!.y - gameMap.height / 2 + 0.5
          );
          sprite.scale.set(2, 2, 1);
          sprite.userData = { id: building.id, type: "stone_mine" };
          scene.add(sprite);
        });
        ayuntamientoArray.forEach((building) => {
          const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: buildingTextures.ayuntamiento }));
          sprite.position.set(
            building.position!.x - gameMap.width / 2 + 0.5,
            0.5,
            building.position!.y - gameMap.height / 2 + 0.5
          );
          sprite.scale.set(2, 2, 1);
          sprite.userData = { id: building.id, type: "ayuntamiento" };
          scene.add(sprite);
        });
        shipyardArray.forEach((building) => {
          const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: buildingTextures.shipyard }));
          sprite.position.set(
            building.position!.x - gameMap.width / 2 + 0.5,
            0.5,
            building.position!.y - gameMap.height / 2 + 0.5
          );
          sprite.scale.set(2, 2, 1);
          sprite.userData = { id: building.id, type: "shipyard" };
          scene.add(sprite);
        });

        camera.position.set(0, 50, 50);
        camera.lookAt(0, 0, 0);

        window.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
        window.addEventListener("click", handleClick);
        window.addEventListener("wheel", handleWheel);
        window.addEventListener("resize", handleResize);

        const animate = () => {
          requestAnimationFrame(animate);
          renderer.render(scene, camera);
        };
        animate();
      })
      .catch((error) => {
        console.error("Error loading textures:", error);
      });

    return () => {
      if (mountNode && renderer.domElement) {
        mountNode.removeChild(renderer.domElement);
      }
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("click", handleClick);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("resize", handleResize);
      if (draggingBuilding && sceneRef.current) sceneRef.current.remove(draggingBuilding);
    };
  }, [gameMap, lumberCampArray, goldMineArray, stoneMineArray, ayuntamientoArray, shipyardArray]);

  useEffect(() => {
    if (structure !== null && !draggingBuilding && sceneRef.current) {
      const textureLoader = new THREE.TextureLoader();
      const selectedStructure = structures.find((s) => s.id === structure);
      if (!selectedStructure || !selectedStructure.spriteImage) return;

      const texture = textureLoader.load(selectedStructure.spriteImage);
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      const material = new THREE.SpriteMaterial({ map: texture, opacity: 0.7 });
      const sprite = new THREE.Sprite(material);
      sprite.scale.set(2, 2, 1);
      sprite.position.set(0, 0.5, 0);
      sceneRef.current.add(sprite);
      setDraggingBuilding(sprite);
      document.body.style.cursor = "pointer";
    } else if (structure === null && draggingBuilding && sceneRef.current) {
      sceneRef.current.remove(draggingBuilding);
      setDraggingBuilding(null);
      document.body.style.cursor = "auto";
    }
  }, [structure]);

  return (
    <div>
      <div ref={mountRef} className={styles.mapContainer} />
      {units.map((unit) => (
        <Unit
          key={unit.id}
          initialPosition={unit.position!}
          mapWidth={gameMap.width}
          mapHeight={gameMap.height}
          scene={sceneRef.current!}
        />
      ))}
      {visibleBuildingDetails && buildingInformation && (
        <BuildingDetails
          generador={buildingInformation}
          state={visibleBuildingDetails}
          buildingId={buildingInformation.id}
        />
      )}
      {visibleAyuntamientoDetails && ayuntamientoInfo && (
        <AyuntamientoDetails
          ayuntamiento={ayuntamientoInfo}
          user={user}
          setAppliedAumentar={setAppliedAumentar}
          progressBar={progressBar}
        />
      )}
    </div>
  );
}