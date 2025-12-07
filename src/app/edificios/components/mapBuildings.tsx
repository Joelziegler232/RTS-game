import { Dispatch, SetStateAction, useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import Unit from '../units/units';
import BuildingDetails from './building';
import { Structure, structures, Generadores } from '../utils/StructuresData';
import styles from './MapBuilding.module.css';
import { User } from '@/app/objects/user';
import BarracksDetails from "./barracksDetails";

interface MapBuildingsProps {
  freeVillagers: number; 
  playerLevel: number;

  // ─────────── Menús ───────────
  ayunMenu: boolean;
  setAyuntamientoMenu: Dispatch<SetStateAction<boolean>>;
  // ─────────── Mapa ───────────
  gameMap: string[][] | null;
  // ─────────── Edificios ───────────
  lumberCampArray: Structure[];
  goldMineArray: Structure[];
  stoneMineArray: Structure[];
  millArray: Structure[];
  houseArray: Structure[];
  ayuntamientoArray: Structure[];
  barracksArray: Structure[];
  shipyardArray: Structure[];
  marketArray: Structure[];
  structure: number | null;
  // ─────────── Setters de edificios ───────────
  setStructure: Dispatch<SetStateAction<number | null>>;
  setLumberCampArray: Dispatch<SetStateAction<Structure[]>>;
  setGoldMineArray: Dispatch<SetStateAction<Structure[]>>;
  setStoneMineArray: Dispatch<SetStateAction<Structure[]>>;
  setMillArray: Dispatch<SetStateAction<Structure[]>>;
  setHouseArray: Dispatch<SetStateAction<Structure[]>>;
  setAyuntamientoArray: Dispatch<SetStateAction<Structure[]>>;
  setBarracksArray: Dispatch<SetStateAction<Structure[]>>;
  setShipyardArray: Dispatch<SetStateAction<Structure[]>>;
  setMarketArray: Dispatch<SetStateAction<Structure[]>>;
  // ─────────── Usuario y recursos ───────────
  user: User;
  playerFood: number;
  setPlayerFood: Dispatch<SetStateAction<number>>;
  setAppliedAumentar: Dispatch<SetStateAction<any>>;
  // ─────────── Unidades ───────────
  units: any[];
  setUnits: Dispatch<SetStateAction<any[]>>;
  // ─────────── Otros ───────────
  progressBar: boolean | null;
}



interface UnitData {
  id: string;
  type: string;
  position: { x: number; y: number };
  status: string;
}

export default function MapBuildings({
  freeVillagers,
  playerLevel,

  // Menús
  setAyuntamientoMenu,
  ayunMenu,
  // Mapa y estructuras
  gameMap,
  lumberCampArray,
  goldMineArray,
  stoneMineArray,
  millArray,
  houseArray,
  ayuntamientoArray,
  barracksArray,
  shipyardArray,
  marketArray,
  setMarketArray,
  structure,
  setStructure,
  // Estados de edificios
  setLumberCampArray,
  setGoldMineArray,
  setStoneMineArray,
  setMillArray,
  setHouseArray,
  setAyuntamientoArray,
  setBarracksArray,
  setShipyardArray,
  // Usuario y recursos
  user,
  playerFood,
  setPlayerFood,
  setAppliedAumentar,
  progressBar,
  // Unidades
  units,
  setUnits,
}: MapBuildingsProps) {
// ------------------------------
// Estados del componente
// ------------------------------
const [showResult, setShowResult] = useState(false);
const [lastReport, setLastReport] = useState<any>(null);
const [visibleBuildingDetails, setVisibleBuildingDetails] = useState(false);
const [visibleBarracksDetails, setVisibleBarracksDetails] = useState(false);
const [barracksInformation, setBarracksInformation] = useState<any | null>(null);
const [trainingSoldier, setTrainingSoldier] = useState<{
  id: number;
  progress: number;
} | null>(null);

// ESTADO LOCAL PARA EDIFICIOS (esto es la magia)
const [localBuildings, setLocalBuildings] = useState({
  ayuntamiento: ayuntamientoArray,
  lumber: lumberCampArray,
  mill: millArray,
  barracks: barracksArray,
  house: houseArray,
  goldMine: goldMineArray,
  stoneMine: stoneMineArray,
  market: marketArray,
});
// SINCRONIZA LOS EDIFICIOS AL INSTANTE SIN RECARGAR
useEffect(() => {
  setLocalBuildings({
    ayuntamiento: ayuntamientoArray,
    lumber: lumberCampArray,
    mill: millArray,
    barracks: barracksArray,
    house: houseArray,
    goldMine: goldMineArray,
    stoneMine: stoneMineArray,
    market: marketArray,
  });
}, [
  ayuntamientoArray,
  lumberCampArray,
  millArray,
  barracksArray,
  houseArray,
  goldMineArray,
  stoneMineArray,
  marketArray,
]);


// ------------------------------
// Referencias de Three.js
// ------------------------------
const mountRef = useRef<HTMLDivElement | null>(null);
const sceneRef = useRef<THREE.Scene>(new THREE.Scene());
const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
const raycaster = useRef(new THREE.Raycaster());
const mouse = useRef(new THREE.Vector2());

// ------------------------------
// Contadores derivados
// ------------------------------
const soldierCount = units.filter(u => u.type === "soldier").length;

// SINCRONIZA SIN RECARGAR
useEffect(() => {
  const handleInstanceUpdate = (event: any) => {
    const data = event.detail;

    
    if (data.units) {
      setUnits(data.units);
    }

    
    if (data.buildings) {
      setBarracksArray(data.buildings.filter((b: any) => b.type === "barracks"));
    }

   
    if (data.level !== undefined) {
      user.level = data.level;
    }
  };

  window.addEventListener("instanceUpdated", handleInstanceUpdate);
  return () => window.removeEventListener("instanceUpdated", handleInstanceUpdate);
}, []);

// ------------------------------
// Funciones
// ------------------------------
async function reloadPlayerData() {
  const res = await fetch(`/api/user_instance/${user.id}`);
  const data = await res.json();

  // Actualizar unidades
  setUnits(data.units || []);

  // Actualizar comida
  setPlayerFood(
    data.resources.find((r: any) => r.resource === "food")?.amount || 0
  );

  // Actualizar población para el HUD
  window.dispatchEvent(
    new CustomEvent("playerPopulationUpdate", {
      detail: {
        villagers: data.population.villagers,
        soldiers: data.population.soldiers,
        maxPopulation: data.population.maxPopulation,
      },
    })
  );
}

// ------------------------------
// Estados adicionales y referencias
// ------------------------------
const [visibleAyuntamientoDetails, setVisibleAyuntamientoDetails] = useState(false);
const [ayuntamientoInfo, setAyuntamientoInformation] = useState<Structure | null>(null);
const [buildingInformation, setBuildingInformation] = useState<Generadores | null>(null);
const [draggingBuilding, setDraggingBuilding] = useState<THREE.Sprite | null>(null);
const [isDraggingCamera, setIsDraggingCamera] = useState(false);
const previousMousePosition = useRef({ x: 0, y: 0 });
const highlightMeshRef = useRef<THREE.Mesh | null>(null);


// ------------------------------
// useEffect: cerrar menú de generadores
// ------------------------------
useEffect(() => {
  const closeMenu = () => setVisibleBuildingDetails(false);
  window.addEventListener("closeBuildingMenu", closeMenu);
  return () => window.removeEventListener("closeBuildingMenu", closeMenu);
}, []);

// ------------------------------
// useEffect: cerrar menú de cuarteles
// ------------------------------
useEffect(() => {
  const closeBarracks = () => {
    setVisibleBarracksDetails(false);
    setBarracksInformation(null);
  };
  window.addEventListener("closeBuildingMenu", closeBarracks);
  return () => window.removeEventListener("closeBuildingMenu", closeBarracks);
}, []);

// ------------------------------
// Función para abrir detalles de generadores
// ------------------------------
const generadorData = useCallback(
  (id: number) => {
    const built = [
      ...localBuildings.lumber,
      ...localBuildings.goldMine,
      ...localBuildings.stoneMine,
      ...localBuildings.mill,
    ].find((b) => b.id === id);

    if (!built) return;

    if (visibleBuildingDetails && buildingInformation?.id === id) {
      setVisibleBuildingDetails(false);
      setBuildingInformation(null);
      return;
    }

    const base = structures.find(
      (s) =>
        s.type === built.type &&
        (s.type === "lumber" || s.type === "gold_mine" || s.type === "stone_mine" || s.type === "mill")
    );

    if (!base) return;

    const fullInfo: Generadores = {
      ...(base as Generadores),
      ...(built as Generadores),
      updateTime: built.updateTime ? new Date(built.updateTime) : new Date(),
    };

    setBuildingInformation(fullInfo);
    setVisibleBuildingDetails(true);
  },
  [localBuildings, visibleBuildingDetails, buildingInformation]
);
const barracksMenu = useCallback(
  (id: number) => {
    const cuartel = localBuildings.barracks.find((b) => b.id === id);
    if (!cuartel) return;

    if (visibleBarracksDetails && barracksInformation?.id === id) {
      setVisibleBarracksDetails(false);
      setBarracksInformation(null);
      return;
    }

    setBarracksInformation(cuartel);
    setVisibleBarracksDetails(true);
    window.dispatchEvent(new CustomEvent("openBuildingMenu"));
  },
  [localBuildings.barracks, visibleBarracksDetails, barracksInformation]
);


  const ayuntamientoMenu = useCallback(
  (id: number) => {
    const ayuntamiento = localBuildings.ayuntamiento.find((b) => b.id === id);
    if (!ayuntamiento) return;

    // Si ya está abierto el menú del mismo ayuntamiento → cerrarlo
    if (ayunMenu && ayuntamientoInfo?.id === id) {
      setAyuntamientoMenu(false);
      setVisibleAyuntamientoDetails(false);
      setAyuntamientoInformation(null);
      return;
    }

    // Abrir menú
    setAyuntamientoInformation(ayuntamiento);
    setVisibleAyuntamientoDetails(true);
    setAyuntamientoMenu(true);
  },
  [localBuildings.ayuntamiento, ayunMenu, ayuntamientoInfo?.id]
);

  useEffect(() => {
    const mountNode = mountRef.current;
    if (!mountNode || !gameMap) {
      console.log('No se puede inicializar: mountNode o gameMap no están disponibles');
      return;
    }

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 50, 50);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    rendererRef.current = renderer;

    if (mountNode) {
      mountNode.appendChild(renderer.domElement);
    } else {
      console.error('mountNode is null, cannot append renderer DOM element');
      return;
    }

    const textureLoader = new THREE.TextureLoader();

    const loadTexture = (url: string) =>
      new Promise<HTMLImageElement>((resolve) => {
        textureLoader.load(url, (texture) => resolve(texture.image));
      });

    Promise.all([
      loadTexture('/arena.png'),
      loadTexture('/hierba.png'),
      loadTexture('/agua.png'),
      textureLoader.loadAsync('/palmera.png'),
      textureLoader.loadAsync('/tree.png'),
      textureLoader.loadAsync('/oro.png'),
      textureLoader.loadAsync('/piedra.png'),
      textureLoader.loadAsync('/berry.png'),
    ])
      .then(([sandImg, grassImg, waterImg, palmTex, treeTex, goldTex, stoneTex, berryTex]) => {
        
        const tileSize = 100;
        const canvas = document.createElement('canvas');
        canvas.width = 100 * tileSize;
        canvas.height = 100 * tileSize;
        const context = canvas.getContext('2d')!;
        if (!context) {
          console.error('No se pudo obtener el contexto 2D del canvas');
          return;
        }

        gameMap.forEach((row, y) => {
          row.forEach((cell, x) => {
            let img;
            switch (cell) {
              case 'water':
                img = waterImg;
                
                break;
              case 'sand':
                img = sandImg;
                break;
              case 'forest':
                img = grassImg;
                break;
              case 'plains':
                img = grassImg;
                break;
              case 'mountain':
                img = sandImg;
                break;
              case 'palm':
                img = sandImg;
                break;
              case 'tree':
                img = grassImg;
                break;
              case 'gold':
                img = sandImg;
                break;
              case 'stone':
                img = grassImg;
                break;
              case 'berry':
                img = grassImg;
                break;
              default:
                img = grassImg;
            }
            context.drawImage(img, x * tileSize, y * tileSize, tileSize, tileSize);
          });
        });

        const terrainTexture = new THREE.CanvasTexture(canvas);
        terrainTexture.minFilter = THREE.LinearFilter;
        terrainTexture.magFilter = THREE.LinearFilter;

        const geometry = new THREE.PlaneGeometry(100, 100, 100, 100);
        const material = new THREE.MeshPhongMaterial({ map: terrainTexture });
        const terrain = new THREE.Mesh(geometry, material);
        terrain.rotation.x = -Math.PI / 2;
        scene.add(terrain);

        const gridHelper = new THREE.GridHelper(100, 100, 0x000000, 0x000000);
        gridHelper.position.y = 0.01;
        (gridHelper.material as THREE.LineBasicMaterial).linewidth = 2;
        scene.add(gridHelper);

        const ambientLight = new THREE.AmbientLight(0x404040);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(0, 50, 50);
        scene.add(directionalLight);

        const palmMaterial = new THREE.SpriteMaterial({ map: palmTex });
        const treeMaterial = new THREE.SpriteMaterial({ map: treeTex });
        const goldMaterial = new THREE.SpriteMaterial({ map: goldTex });
        const stoneMaterial = new THREE.SpriteMaterial({ map: stoneTex });
        const berryMaterial = new THREE.SpriteMaterial({ map: berryTex });

        gameMap.forEach((row, y) => {
          row.forEach((cell, x) => {
            let spriteMaterial;
            let isValidTerrain = true;

            if (cell === 'gold') {
              const expectedTerrain = 'sand';
              if (gameMap[y][x] === 'gold') {
                spriteMaterial = goldMaterial;
              } else {
                isValidTerrain = false;
                console.warn(`Sprite de oro omitido en (${x}, ${y}): terreno base no es 'sand', es '${gameMap[y][x]}'`);
              }
            } else if (cell === 'tree') {
              spriteMaterial = treeMaterial;
              if (!['forest', 'plains', 'tree'].includes(gameMap[y][x])) {
                isValidTerrain = false;
                console.warn(`Sprite de árbol omitido en (${x}, ${y}): terreno base no es 'forest' o 'plains', es '${gameMap[y][x]}'`);
              }
            } else if (cell === 'palm') {
              spriteMaterial = palmMaterial;
              if (gameMap[y][x] !== 'sand' && gameMap[y][x] !== 'palm') {
                isValidTerrain = false;
                console.warn(`Sprite de palmera omitido en (${x}, ${y}): terreno base no es 'sand', es '${gameMap[y][x]}'`);
              }
            } else if (cell === 'stone') {
              spriteMaterial = stoneMaterial;
              if (gameMap[y][x] !== 'mountain' && gameMap[y][x] !== 'stone') {
                isValidTerrain = false;
                console.warn(`Sprite de piedra omitido en (${x}, ${y}): terreno base no es 'mountain', es '${gameMap[y][x]}'`);
              }
            } else if (cell === 'berry') {
              spriteMaterial = berryMaterial;
              if (!['plains', 'berry'].includes(gameMap[y][x])) {
                isValidTerrain = false;
                console.warn(`Sprite de baya omitido en (${x}, ${y}): terreno base no es 'plains', es '${gameMap[y][x]}'`);
              }
            }

            if (spriteMaterial && isValidTerrain) {
              const sprite = new THREE.Sprite(spriteMaterial);
              sprite.position.set(x - 50 + 0.5, 0.5, y - 50 + 0.5);
              sprite.scale.set(cell === 'palm' ? 1.5 : 1, cell === 'palm' ? 1.5 : 1, 1);
              scene.add(sprite);
              
            }
          });
        });

        const buildingTextures = {
          lumber: textureLoader.load('/madera_generador.png', (texture) => {
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
          }),
          gold_mine: textureLoader.load('/gold_mine.png', (texture) => {
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
          }),
          stone_mine: textureLoader.load('/stone_mine.png', (texture) => {
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
          }),
          mill: textureLoader.load('/molino.png', (texture) => {
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
          }),
          house: textureLoader.load('/casaD.png', (texture) => {
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
          }),
          ayuntamiento: textureLoader.load('/casa_oracion.png', (texture) => {
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
          }),
          barracks: textureLoader.load('/cuartel.png', (texture) => {
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
          }),
          shipyard: textureLoader.load('/port.png', (texture) => {
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            
          }),
          mercado: textureLoader.load('/mercado.png', (texture) => {
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
  }),

          
        };

       [
  ...lumberCampArray,
  ...goldMineArray,
  ...stoneMineArray,
  ...millArray,
  ...houseArray,
  ...ayuntamientoArray,
  ...barracksArray,
  ...shipyardArray,
  ...marketArray  
].forEach((building) => {
  const texture = buildingTextures[building.type as keyof typeof buildingTextures];
  
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ 
      map: texture ?? buildingTextures.house
    })
  );
  
  sprite.position.set(
    building.position!.x - 50 + 0.5,
    0.5,
    building.position!.y - 50 + 0.5
  );
  sprite.scale.set(2, 2, 1);
  sprite.userData = { id: building.id, type: building.type };
  scene.add(sprite);

  
  
});

        const animate = () => {
          if (rendererRef.current && sceneRef.current && cameraRef.current) {
            requestAnimationFrame(animate);
            rendererRef.current.render(sceneRef.current, cameraRef.current);
          }
        };
        animate();
      })
      .catch((error) => {
        console.error('Error al cargar texturas:', error);
        alert('Error al cargar texturas del mapa');
      });

    const handleResize = () => {
      if (cameraRef.current && rendererRef.current) {
        cameraRef.current.aspect = window.innerWidth / window.innerHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (rendererRef.current && mountNode) {
        try {
          mountNode.removeChild(rendererRef.current.domElement);
        } catch (error) {
          console.warn('Error removing renderer DOM element:', error);
        }
        rendererRef.current.dispose();
        rendererRef.current = null;
      }
      if (sceneRef.current) {
        sceneRef.current.children.forEach((child) => {
          if (child instanceof THREE.Mesh || child instanceof THREE.Sprite) {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach((mat) => mat.dispose());
              } else {
                child.material.dispose();
              }
            }
          }
        });
        sceneRef.current.clear();
      }
      cameraRef.current = null;
    };
  }, [gameMap]);

  // Texturas cargadas UNA sola vez
const texturesRef = useRef<{ [key: string]: THREE.Texture }>({});

  const updateHighlight = (tileX: number, tileY: number, isValid: boolean) => {
    
    if (highlightMeshRef.current) {
      sceneRef.current.remove(highlightMeshRef.current);
      highlightMeshRef.current = null;
    }
    const geometry = new THREE.PlaneGeometry(1, 1);
    const material = new THREE.MeshBasicMaterial({
      color: isValid ? 0x00ff00 : 0xff0000,
      transparent: true,
      opacity: 0.5,
    });
    highlightMeshRef.current = new THREE.Mesh(geometry, material);
    highlightMeshRef.current.position.set(tileX - 50 + 0.5, 0.01, tileY - 50 + 0.5);
    highlightMeshRef.current.rotation.x = -Math.PI / 2;
    sceneRef.current.add(highlightMeshRef.current);
  };

  const handleMouseDown = useCallback(
    (event: MouseEvent) => {
      
      if (event.button === 0 && !draggingBuilding) {
        setIsDraggingCamera(true);
        previousMousePosition.current = { x: event.clientX, y: event.clientY };
        document.body.style.cursor = 'grabbing';
      }
    },
    [isDraggingCamera, draggingBuilding]
  );

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;

      if (isDraggingCamera && cameraRef.current && !draggingBuilding) {
        
        const deltaX = event.clientX - previousMousePosition.current.x;
        const deltaY = event.clientY - previousMousePosition.current.y;
        cameraRef.current.position.x -= deltaX * 0.1;
        cameraRef.current.position.z -= deltaY * 0.1;
        previousMousePosition.current = { x: event.clientX, y: event.clientY };
      }

      if (draggingBuilding && cameraRef.current && sceneRef.current && gameMap) {
        raycaster.current.setFromCamera(mouse.current, cameraRef.current);
        const terrain = sceneRef.current.children.find(
          (obj) => obj instanceof THREE.Mesh && obj.geometry instanceof THREE.PlaneGeometry
        );
        if (!terrain) {
          console.log('Terreno no encontrado en la escena');
          draggingBuilding.visible = false;
          if (highlightMeshRef.current) {
            sceneRef.current.remove(highlightMeshRef.current);
            highlightMeshRef.current = null;
          }
          return;
        }
        const intersects = raycaster.current.intersectObject(terrain);
        if (intersects.length > 0) {
          const point = intersects[0].point;
          const tileX = Math.floor(point.x + 50);
          const tileY = Math.floor(point.z + 50);

          if (tileX >= 0 && tileX < 100 && tileY >= 0 && tileY < 100) {
            draggingBuilding.visible = true;
            draggingBuilding.position.set(tileX - 50 + 0.5, 0.5, tileY - 50 + 0.5);

            const tile = gameMap[tileY][tileX];
            
            const isOccupied = [
              ...lumberCampArray,
              ...goldMineArray,
              ...stoneMineArray,
              ...millArray,
              ...houseArray,
              ...ayuntamientoArray,
              ...barracksArray,
              ...shipyardArray,
            ].some(b => b.position?.x === tileX && b.position?.y === tileY);

            const isValidTerrain =
              !!tile &&
              (structure === 3
                ? tile === 'water'
                : !['water', 'stone', 'gold', 'palm', 'tree', 'berry'].includes(tile));

            updateHighlight(tileX, tileY, isValidTerrain && !isOccupied);

          } else {
            console.log('Fuera de los límites del mapa:', { tileX, tileY });
            draggingBuilding.visible = false;
            if (highlightMeshRef.current) {
              sceneRef.current.remove(highlightMeshRef.current);
              highlightMeshRef.current = null;
            }
          }
        } else {
          console.log('No hay intersección con el terreno');
          draggingBuilding.visible = false;
          if (highlightMeshRef.current) {
            sceneRef.current.remove(highlightMeshRef.current);
            highlightMeshRef.current = null;
          }
        }
      }
    },
    [isDraggingCamera, draggingBuilding, gameMap, structure]
  );

  const handleMouseUp = useCallback(
    async (event: MouseEvent) => {
     
      if (event.button === 0) {
        setIsDraggingCamera(false);
        document.body.style.cursor = draggingBuilding ? 'pointer' : 'auto';
      }

      if (event.button === 0 && draggingBuilding && structure !== null && cameraRef.current && sceneRef.current && gameMap) {
        raycaster.current.setFromCamera(mouse.current, cameraRef.current);
        const terrain = sceneRef.current.children.find(
          (obj) => obj instanceof THREE.Mesh && obj.geometry instanceof THREE.PlaneGeometry
        );
        if (!terrain) {
          console.log('Terreno no encontrado');
          alert('No puedes construir aquí: terreno no encontrado.');
          sceneRef.current.remove(draggingBuilding);
          setDraggingBuilding(null);
          setStructure(null);
          document.body.style.cursor = 'auto';
          if (highlightMeshRef.current) {
            sceneRef.current.remove(highlightMeshRef.current);
            highlightMeshRef.current = null;
          }
          return;
        }
        const intersects = raycaster.current.intersectObject(terrain);
        if (intersects.length > 0) {
          const point = intersects[0].point;
          const tileX = Math.floor(point.x + 50);
          const tileY = Math.floor(point.z + 50);

          if (tileX < 0 || tileX >= 100 || tileY < 0 || tileY >= 100) {
            console.log('Posición fuera del mapa:', { tileX, tileY });
            alert('No puedes construir aquí: fuera del mapa.');
            sceneRef.current.remove(draggingBuilding);
            setDraggingBuilding(null);
            setStructure(null);
            document.body.style.cursor = 'auto';
            if (highlightMeshRef.current) {
              sceneRef.current.remove(highlightMeshRef.current);
              highlightMeshRef.current = null;
            }
            return;
          }

          const tile = gameMap[tileY][tileX];
          const selectedStructure = structures.find((s) => s.id === structure);

          if (!tile || !selectedStructure) {
            console.log('Datos inválidos:', { tile, selectedStructure });
            alert('No puedes construir aquí: datos inválidos.');
            sceneRef.current.remove(draggingBuilding);
            setDraggingBuilding(null);
            setStructure(null);
            document.body.style.cursor = 'auto';
            if (highlightMeshRef.current) {
              sceneRef.current.remove(highlightMeshRef.current);
              highlightMeshRef.current = null;
            }
            return;
          }

          const isValidTerrain =
            !!tile &&
            (selectedStructure.type === 'shipyard'
              ? tile === 'water'
              : !['water', 'stone', 'gold', 'palm', 'tree', 'berry'].includes(tile));
          const allBuildings = [
            ...lumberCampArray,
            ...goldMineArray,
            ...stoneMineArray,
            ...millArray,
            ...houseArray,
            ...ayuntamientoArray,
            ...barracksArray,
            ...shipyardArray,
          ];
          const isOccupied = allBuildings.some(
            (b) => b.position?.x === tileX && b.position?.y === tileY
          );

          if (isValidTerrain && !isOccupied) {
            const { img, ...structureWithoutImg } = selectedStructure;

const newStructure: Structure = {
  ...selectedStructure,   

  id: Date.now(),
  position: { x: tileX, y: tileY },

  // Estado dinámico
  obreros: 0,
  capacity: 0,

  updateTime:
    selectedStructure.type === "lumber" ||
    selectedStructure.type === "gold_mine" ||
    selectedStructure.type === "stone_mine" ||
    selectedStructure.type === "mill"
      ? new Date()
      : undefined,
};


            if (user.id) {
              try {
                console.log("🔥 DEBUG BUILDING:", {
                  type: newStructure.type,
                  id: newStructure.id,
                  position: newStructure.position
                });

                const response = await fetch(`/api/user_instance/${user.id}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ building: newStructure }),
                  
                });

                                if (!response.ok) {
                  const err = await response.json();
                  alert(err.error || "No se pudo construir el edificio");
                  sceneRef.current.remove(draggingBuilding);
                  setDraggingBuilding(null);
                  setStructure(null);
                  document.body.style.cursor = "auto";
                  if (highlightMeshRef.current) {
                    sceneRef.current.remove(highlightMeshRef.current);
                    highlightMeshRef.current = null;
                  }
                  return;
                }
                               const data = await response.json();

                // ACTUALIZAR RECURSOS (esto ya lo tenías)
                await fetch(`/api/user_instance/${user.id}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    resources: [
                      { resource: 'gold', amount: Math.floor((window as any).playerGold || 0) },
                      { resource: 'lumber', amount: Math.floor((window as any).playerLumber || 0) },
                      { resource: 'stone', amount: Math.floor((window as any).playerStone || 0) },
                      { resource: 'food', amount: Math.floor((window as any).playerFood || 0) },
                      { resource: 'money', amount: Math.floor((window as any).playerMoney || 0) },
                    ],
                  }),
                });

                // ACTUALIZAR EDIFICIOS CON LOS DATOS DEL BACKEND
                setLumberCampArray(data.buildings.filter((b: any) => b.type === "lumber"));
                setGoldMineArray(data.buildings.filter((b: any) => b.type === "gold_mine"));
                setStoneMineArray(data.buildings.filter((b: any) => b.type === "stone_mine"));
                setMillArray(data.buildings.filter((b: any) => b.type === "mill"));
                setHouseArray(data.buildings.filter((b: any) => b.type === "house"));
                setAyuntamientoArray(data.buildings.filter((b: any) => b.type === "ayuntamiento"));
                setBarracksArray(data.buildings.filter((b: any) => b.type === "barracks"));
                setMarketArray(data.buildings.filter((b: any) => b.type === "mercado") || []);

                // DISPARAR EVENTO
                window.dispatchEvent(new CustomEvent("buildingPlaced"));

                // ENCONTRAR EL EDIFICIO QUE ACABÁS DE CONSTRUIR (con el ID del backend)
                const nuevoEdificio = data.buildings.find((b: any) => 
                  b.position?.x === tileX && b.position?.y === tileY
                );

                if (nuevoEdificio) {
                  const material = draggingBuilding.material.clone();
                  material.opacity = 1;
                  const permanentSprite = new THREE.Sprite(material);
                  permanentSprite.position.copy(draggingBuilding.position);
                  permanentSprite.scale.set(2, 2, 1);
                  permanentSprite.userData = { 
                    id: nuevoEdificio.id,      // ID CORRECTO DEL BACKEND
                    type: nuevoEdificio.type   // TIPO CORRECTO
                  };
                  sceneRef.current.add(permanentSprite);
                }

                sceneRef.current.remove(draggingBuilding);
                setDraggingBuilding(null);
                setStructure(null);
                document.body.style.cursor = "auto";
                if (highlightMeshRef.current) {
                  sceneRef.current.remove(highlightMeshRef.current);
                  highlightMeshRef.current = null;
                }
                
              } catch (error) {
                console.error('Error en la solicitud al backend:', error);
                alert('Error al conectar con el servidor. Intenta de nuevo.');
                sceneRef.current.remove(draggingBuilding);
                setDraggingBuilding(null);
                setStructure(null);
                document.body.style.cursor = 'auto';
                if (highlightMeshRef.current) {
                  sceneRef.current.remove(highlightMeshRef.current);
                  highlightMeshRef.current = null;
                }
                return;
              }
            } else {
              console.error('No hay user.id disponible');
              alert('Error: No se encontró el ID del usuario.');
              sceneRef.current.remove(draggingBuilding);
              setDraggingBuilding(null);
              setStructure(null);
              document.body.style.cursor = 'auto';
              if (highlightMeshRef.current) {
                sceneRef.current.remove(highlightMeshRef.current);
                highlightMeshRef.current = null;
              }
              return;
            }
          } else {
            console.log('No se puede construir:', { isValidTerrain, isOccupied, tile });
            alert(
              `No puedes construir aquí: ${
                isOccupied
                  ? 'la posición ya está ocupada'
                  : `terreno no válido (${
                      tile === 'water'
                        ? 'agua'
                        : tile === 'stone'
                        ? 'piedra'
                        : tile === 'gold'
                        ? 'oro'
                        : tile === 'palm'
                        ? 'palmera'
                        : tile === 'tree'
                        ? 'árbol'
                        : 'bayas'
                    })`
              }.`
            );
          }
        } else {
          console.log('No hay intersección con el terreno');
          alert('No puedes construir aquí: no se encontró el terreno.');
        }
        sceneRef.current.remove(draggingBuilding);
        setDraggingBuilding(null);
        setStructure(null);
        document.body.style.cursor = 'auto';
        if (highlightMeshRef.current) {
          sceneRef.current.remove(highlightMeshRef.current);
          highlightMeshRef.current = null;
        }
      }
    },
    [
      isDraggingCamera,
      draggingBuilding,
      structure,
      gameMap,
      lumberCampArray,
      goldMineArray,
      stoneMineArray,
      millArray,
      houseArray,
      ayuntamientoArray,
      barracksArray,
      shipyardArray,
      user.id,
      setLumberCampArray,
      setGoldMineArray,
      setStoneMineArray,
      setMillArray,
      setHouseArray,
      setAyuntamientoArray,
      setBarracksArray,
      setShipyardArray,
      setStructure,
    ]
  );
const handleClick = useCallback(
  (event: MouseEvent) => {
    if (draggingBuilding || !cameraRef.current || !sceneRef.current) return;

    mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.current.setFromCamera(mouse.current, cameraRef.current);
    const intersects = raycaster.current.intersectObjects(sceneRef.current.children);

    if (intersects.length > 0) {
      const intersected = intersects[0].object;
      if (intersected instanceof THREE.Sprite && intersected.userData.id !== undefined) {
        const { id, type } = intersected.userData;

        if (type === 'ayuntamiento') {
          ayuntamientoMenu(id);
        } else if (type === 'lumber' || type === 'gold_mine' || type === 'stone_mine' || type === 'mill') {
          generadorData(id);
        } else if (type === 'barracks') {
          barracksMenu(id);
        } else if (type === 'mercado') {
          window.location.href = '/mercado';
        }
      }
    }
  },
  [draggingBuilding, ayuntamientoMenu, generadorData, barracksMenu]
);

  const handleWheel = useCallback((event: WheelEvent) => {
    if (cameraRef.current) {
      cameraRef.current.position.y += event.deltaY * 0.1;
      cameraRef.current.position.y = Math.max(10, Math.min(100, cameraRef.current.position.y));
    }
  }, []);

  

  useEffect(() => {
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('click', handleClick);
    window.addEventListener('wheel', handleWheel);
    window.addEventListener('contextmenu', (e) => e.preventDefault());

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('contextmenu', (e) => e.preventDefault());
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp, handleClick, handleWheel]);

  
  
  useEffect(() => {
    if (structure !== null && !draggingBuilding && sceneRef.current) {
      const textureLoader = new THREE.TextureLoader();
      const selectedStructure = structures.find((s) => s.id === structure);
      if (!selectedStructure || !selectedStructure.spriteImage) {
        console.log('Estructura no válida:', { structure, selectedStructure });
        return;
      }

      const texture = textureLoader.load(selectedStructure.spriteImage);
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      const material = new THREE.SpriteMaterial({ map: texture, opacity: 0.7 });
      const sprite = new THREE.Sprite(material);
      sprite.scale.set(2, 2, 1);
      sprite.position.set(0, 0.5, 0);
      sceneRef.current.add(sprite);
      setDraggingBuilding(sprite);
      document.body.style.cursor = 'pointer';
      console.log('Sprite de edificio creado:', { structure });
    } else if (structure === null && draggingBuilding && sceneRef.current) {
      sceneRef.current.remove(draggingBuilding);
      setDraggingBuilding(null);
      document.body.style.cursor = 'auto';
      if (highlightMeshRef.current) {
        sceneRef.current.remove(highlightMeshRef.current);
        highlightMeshRef.current = null;
      }
      console.log('Sprite de edificio eliminado');
    }
  }, [structure, draggingBuilding]);

const assignVillager = async (buildingId: number) => {
  try {
    const response = await fetch(`/api/user_instance/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignVillager: { id: buildingId } }),
    });

    if (!response.ok) throw new Error("Error asignando aldeano");

    const updatedInstance = await response.json();

    // SOLO actualizamos los edificios
    setLumberCampArray(updatedInstance.buildings.filter((b: any) => b.type === "lumber"));
    setGoldMineArray(updatedInstance.buildings.filter((b: any) => b.type === "gold_mine"));
    setStoneMineArray(updatedInstance.buildings.filter((b: any) => b.type === "stone_mine"));
    setMillArray(updatedInstance.buildings.filter((b: any) => b.type === "mill"));

    // DISPARAR EVENTO → page.tsx actualiza TODO (recursos, aldeanos, nivel)
    window.dispatchEvent(new CustomEvent("instanceUpdated", { detail: updatedInstance }));

  } catch (err) {
    console.error(err);
    alert("No hay aldeanos disponibles o límite alcanzado");
  }
};

const removeVillager = async (buildingId: number) => {
  try {
    const response = await fetch(`/api/user_instance/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ removeVillagerFromBuilding: { id: buildingId } }),
    });

    if (!response.ok) throw new Error("Error quitando aldeano");

    const updatedInstance = await response.json();

    setLumberCampArray(updatedInstance.buildings.filter((b: any) => b.type === "lumber"));
    setGoldMineArray(updatedInstance.buildings.filter((b: any) => b.type === "gold_mine"));
    setStoneMineArray(updatedInstance.buildings.filter((b: any) => b.type === "stone_mine"));
    setMillArray(updatedInstance.buildings.filter((b: any) => b.type === "mill"));

    window.dispatchEvent(new CustomEvent("instanceUpdated", { detail: updatedInstance }));

  } catch (err) {
    console.error(err);
    alert("No hay aldeanos asignados para quitar");
  }
};


const trainSoldier = async (buildingId: number) => {
 
  if (playerFood < 30) {
    alert("No tienes suficiente comida (30) para entrenar un soldado.");
    return;
  }
  if (freeVillagers <= 0) {
  alert("No hay aldeanos disponibles.");
  return;
}
  if (trainingSoldier?.id === buildingId) {
    alert("Ya hay un soldado en entrenamiento en este cuartel.");
    return;
  }

  
  setPlayerFood(prev => prev - 30);


  setTrainingSoldier({ id: buildingId, progress: 0 });

  const duration = 5000;
  const interval = 100;
  let elapsed = 0;

  const timer = setInterval(() => {
    elapsed += interval;
    const progress = Math.min((elapsed / duration) * 100, 100);
    setTrainingSoldier({ id: buildingId, progress });

    if (elapsed >= duration) {
      clearInterval(timer);
      finishTraining(buildingId);
    }
  }, interval);
};

const finishTraining = async (buildingId: number) => {
  try {
    const cuartel = barracksArray.find(b => b.id === buildingId);
    if (!cuartel) return;

    const newSoldier = {
      id: Date.now().toString(),
      type: "soldier",
      position: {
        x: (cuartel.position!.x ?? 0) + 2,
        y: (cuartel.position!.y ?? 0),
      },
      status: "idle",
    };

    const res = await fetch(`/api/user_instance/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ addSoldier: newSoldier }),
    });

    if (!res.ok) throw new Error("Error al crear soldado");

    const updated = await res.json();

    
    setUnits(updated.units || []);
    setTrainingSoldier(null); 
    window.dispatchEvent(new CustomEvent("instanceUpdated", { detail: updated }));

  } catch (err) {
    console.error(err);
    alert("Error al finalizar entrenamiento");
    setTrainingSoldier(null);
  }
};


const searchBattle = async () => {
  if (soldierCount === 0) {
    alert("No tienes soldados");
    return;
  }

  try {
    const res = await fetch('/api/battle/find', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id })
    });

    const data = await res.json();

   
    if (!res.ok) {
      alert(data.error || "Error buscando enemigo");
      return;
    }

    if (!data.enemy) {
      alert(data.error || "No hay enemigos disponibles en este momento");
      return;
    }

  
    window.dispatchEvent(new CustomEvent('enemyFound', { detail: data.enemy }));

  } catch (err) {
    console.error(err);
    alert("Error buscando batalla");
  }
};



const generadorActualizado: Generadores | null =
  buildingInformation &&
  ["lumber", "gold_mine", "stone_mine", "mill"].includes(buildingInformation.type)
    ? ({
        ...buildingInformation,
        produccion_hora: buildingInformation.produccion_hora!,
        obreros: buildingInformation.obreros!,
        maxObreros: buildingInformation.maxObreros!,
        maxCapacity: buildingInformation.maxCapacity!,
        aumentar: buildingInformation.aumentar!,
        capacity: buildingInformation.capacity!,
        updateTime: new Date(buildingInformation.updateTime!),
      } as Generadores)
    : null;


    return (
    <div>
      <div ref={mountRef} className={styles.mapContainer} />
      
      {/* UNIDADES EN EL MAPA */}
            {/* TODOS LOS EDIFICIOS */}
      {(() => {
        const allBuildings = [
          ...lumberCampArray,
          ...goldMineArray,
          ...stoneMineArray,
          ...millArray,
          ...houseArray,
          ...ayuntamientoArray,
          ...barracksArray,
          ...shipyardArray,
        ];

        return units.map((unit) => (
          <Unit
            key={unit.id}
            type={unit.type}
            initialPosition={unit.position}
            mapWidth={100}
            mapHeight={100}
            scene={sceneRef.current!}
            gameMap={gameMap || []}           
            buildings={allBuildings}         
          />
        ));
      })()}

      {/* DETALLES DE GENERADORES */}
      {visibleBuildingDetails && generadorActualizado && (
        <BuildingDetails
  buildingId={buildingInformation?.id || 0}
  state={visibleBuildingDetails}
  onAssignVillager={assignVillager}
  onRemoveVillager={removeVillager}
  allGenerators={[
  ...(localBuildings.lumber as Generadores[]),
  ...(localBuildings.goldMine as Generadores[]),
  ...(localBuildings.stoneMine as Generadores[]),
  ...(localBuildings.mill as Generadores[]),
]}
/>
      )}

     {/* DETALLES DEL CUARTEL */}
{visibleBarracksDetails && barracksInformation && (
  <BarracksDetails
    key={barracksInformation.id + "-lvl-" + playerLevel}
    cuartel={barracksInformation}
    state={visibleBarracksDetails}
    buildingId={barracksInformation.id}
    onTrainSoldier={trainSoldier}
    playerLevel={playerLevel}   // ← 🔥 AHORA SÍ REACTIVO
    trainingData={trainingSoldier}
    onSearchBattle={searchBattle}  
  />
)}


      
      

    </div>
  );
}