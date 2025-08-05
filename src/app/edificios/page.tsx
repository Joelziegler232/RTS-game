// src/app/edificios/page.tsx
"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import MapBuildings from "./components/mapBuildings";
import CreacionMenu from "./components/creacionMenu";
import Progressbar from "./components/progressbar";
import BuildingDrawer from "./components/buildDrawer";
import MessageIcon from "./components/MessageIcon";
import { Aumentador } from "../objects/aumentar";
import { User } from "../objects/user";
import { generateMap, GameMap } from "./utils/MapGenerator";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import { structures, Structure } from "./utils/StructuresData";
import * as THREE from "three";
import styles from "./page.module.css";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mostrarApear, setMostrarApear] = useState(false);
  const [structure, setStructure] = useState<number | null>(null);
  const cursorPosition = useRef({ x: 0, y: 0 });
  const [progressBar, setProgressBar] = useState<boolean | null>(null);
  const [unit, setUnit] = useState<any>();
  const [quantity, setQuantity] = useState(0);
  const [maxCreacion, setMaxCreacion] = useState(false);
  const [appliedAumentar, setAppliedAumentar] = useState<Aumentador | null>(null);
  const [ayuntamientoMenu, setAyuntamientoMenu] = useState(false);
  const [gameMap, setGameMap] = useState<GameMap>(generateMap(100, 100));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [playerMoney, setPlayerMoney] = useState(5000);
  const [lumberCampArray, setLumberCampArray] = useState<Structure[]>([]);
  const [goldMineArray, setGoldMineArray] = useState<Structure[]>([]);
  const [stoneMineArray, setStoneMineArray] = useState<Structure[]>([]);
  const [ayuntamientoArray, setAyuntamientoArray] = useState<Structure[]>([]);
  const [shipyardArray, setShipyardArray] = useState<Structure[]>([]);
  const [userData, setUserData] = useState<User>({
    id: "",
    name: "",
    username: "",
    password: "",
    level: 1,
    obreros: 3,
    aumentador: [],
  });
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());

  // Verificar autenticación y redirigir si no hay sesión
  useEffect(() => {
    console.log("Estado de la sesión:", { session, status });
    if (status === "loading") return;
    const timer = setTimeout(() => {
      if (status === "unauthenticated") {
        console.log("No autenticado, redirigiendo a /login");
        router.push("/login");
      }
    }, 10000);
    return () => clearTimeout(timer);
  }, [status, router, session]);

  useEffect(() => {
    if (session?.user?.id) {
      console.log("Cargando datos para userId:", session.user.id);
      const fetchUserData = async () => {
        try {
          const userResponse = await fetch(`/api/users/${session.user.id}`);
          console.log("Respuesta de /api/users:", {
            status: userResponse.status,
            ok: userResponse.ok,
          });
          if (!userResponse.ok) {
            throw new Error(`Error al cargar datos del usuario: ${userResponse.statusText}`);
          }
          const instanceResponse = await fetch(`/api/user_instance/${session.user.id}`);
          console.log("Respuesta de /api/user_instance:", {
            status: instanceResponse.status,
            ok: instanceResponse.ok,
          });
          if (!instanceResponse.ok) {
            if (instanceResponse.status === 404) {
              console.log("Instancia no encontrada, creando una nueva...");
              const newInstance = {
                userId: session.user.id,
                buildings: [],
                resources: [{ resource: "money", amount: 5000 }],
              };
              const createResponse = await fetch(`/api/user_instance/${session.user.id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newInstance),
              });
              if (!createResponse.ok) {
                throw new Error("Error al crear instancia");
              }
              console.log("Instancia creada exitosamente");
              const retryResponse = await fetch(`/api/user_instance/${session.user.id}`);
              if (!retryResponse.ok) {
                throw new Error("Error al cargar instancia después de crearla");
              }
              const instance = await retryResponse.json();
              setLumberCampArray(instance.buildings.filter((b: any) => b.type === "lumber"));
              setGoldMineArray(instance.buildings.filter((b: any) => b.type === "gold_mine"));
              setStoneMineArray(instance.buildings.filter((b: any) => b.type === "stone_mine"));
              setAyuntamientoArray(instance.buildings.filter((b: any) => b.type === "ayuntamiento"));
              setShipyardArray(instance.buildings.filter((b: any) => b.type === "shipyard"));
              const money = instance.resources.find((r: any) => r.resource === "money")?.amount || 5000;
              setPlayerMoney(money);
              return;
            }
            throw new Error(`Error al cargar instancia: ${instanceResponse.statusText}`);
          }
          const user = await userResponse.json();
          const instance = await instanceResponse.json();
          console.log("Datos cargados:", { user, instance });
          setLumberCampArray(instance.buildings.filter((b: any) => b.type === "lumber"));
          setGoldMineArray(instance.buildings.filter((b: any) => b.type === "gold_mine"));
          setStoneMineArray(instance.buildings.filter((b: any) => b.type === "stone_mine"));
          setAyuntamientoArray(instance.buildings.filter((b: any) => b.type === "ayuntamiento"));
          setShipyardArray(instance.buildings.filter((b: any) => b.type === "shipyard"));
          const money = instance.resources.find((r: any) => r.resource === "money")?.amount || 5000;
          setPlayerMoney(money);
          setUserData({
            id: session.user.id,
            name: session.user.name || user.fullname,
            username: user.email,
            password: "",
            level: user.level,
            obreros: user.obreros,
            aumentador: [],
          });
        } catch (error) {
          console.error("Error al cargar datos del usuario:", error);
          alert("Error al cargar datos del usuario. Intenta recargar la página.");
        }
      };
      fetchUserData();
    } else {
      console.log("No hay session.user.id, esperando...");
    }
  }, [session]);

  const handleOpenDrawer = () => setDrawerOpen(true);
  const handleCloseDrawer = () => setDrawerOpen(false);

  const handleBuild = async (precio: number) => {
    const newMoney = playerMoney - precio;
    if (newMoney >= 0) {
      setPlayerMoney(newMoney);
      if (session?.user?.id) {
        try {
          const response = await fetch(`/api/user_instance/${session.user.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ resource: "money", amount: newMoney }),
          });
          if (!response.ok) {
            throw new Error("Error al actualizar recursos");
          }
        } catch (error) {
          console.error("Error al actualizar recursos:", error);
        }
      }
      handleCloseDrawer();
    } else {
      alert("No tienes suficiente dinero para construir");
    }
  };

  const handleProfileClick = () => {
    router.push("/welcome");
  };

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      cursorPosition.current = { x: event.clientX, y: event.clientY };
      mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    if (structure) {
      setMostrarApear(true);
      document.body.classList.add("cursor-none");
    } else {
      setMostrarApear(false);
      document.body.classList.remove("cursor-none");
    }
  }, [structure]);

  function checkTerrain(position: THREE.Vector3, structureType: number | null): boolean {
    const tileX = Math.floor(position.x + gameMap.width / 2);
    const tileY = Math.floor(position.z + gameMap.height / 2);
    const tileIndex = tileY * gameMap.width + tileX;
    const tile = gameMap.tiles[tileIndex];
    if (!tile) return false;
    if (structureType === 3) {
      return tile.terrainType === "water";
    }
    return tile.terrainType !== "water";
  }

  async function addStructure(position: THREE.Vector3, structureType: number | null) {
    const tileX = Math.floor(position.x + gameMap.width / 2);
    const tileY = Math.floor(position.z + gameMap.height / 2);
    const selectedStructure = structures.find((s) => s.id === structureType);
    if (!selectedStructure) return;

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

    if (session?.user?.id) {
      try {
        const response = await fetch(`/api/user_instance/${session.user.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ building: newStructure }),
        });
        if (!response.ok) {
          throw new Error("Error al guardar estructura");
        }
      } catch (error) {
        console.error("Error al guardar estructura:", error);
      }
    }
  }

  const handleMapClick = (event: React.MouseEvent) => {
    if (!mostrarApear) return;
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 50, 50);
    camera.lookAt(0, 0, 0);
    raycaster.current.setFromCamera(mouse.current, camera);
    const terrain = new THREE.Mesh(new THREE.PlaneGeometry(gameMap.width, gameMap.height));
    terrain.rotation.x = -Math.PI / 2;
    const intersects = raycaster.current.intersectObject(terrain);
    if (intersects.length > 0) {
      const intersect = intersects[0];
      const position = intersect.point;
      if (checkTerrain(position, structure)) {
        addStructure(position, structure);
      }
    }
    setMostrarApear(false);
    setStructure(null);
  };

  if (status === "loading") {
    return <div className="container mx-auto text-center text-white">Cargando...</div>;
  }

  return (
    <main className={`${styles.main} min-h-screen relative`} onClick={handleMapClick}>
      <button className={styles.signOutButton} onClick={handleProfileClick}>
        Perfil
      </button>
      {ayuntamientoArray.length > 0 && (
        <CreacionMenu
          user={userData}
          setProgressBar={setProgressBar}
          setUnit={setUnit}
          setQuantity={setQuantity}
          quantity={quantity}
        />
      )}
      {progressBar && (
        <Progressbar
          running={progressBar}
          unit={unit!}
          setProgressBar={setProgressBar}
          quantity={quantity}
          ayuntamiento={ayuntamientoArray[0]!}
          setMaxCreacion={setMaxCreacion}
          setQuantity={setQuantity}
          aumentar={appliedAumentar}
        />
      )}
      <MapBuildings
        setAyuntamientoMenu={setAyuntamientoMenu}
        ayunMenu={ayuntamientoMenu}
        gameMap={gameMap}
        lumberCampArray={lumberCampArray}
        goldMineArray={goldMineArray}
        stoneMineArray={stoneMineArray}
        ayuntamientoArray={ayuntamientoArray}
        shipyardArray={shipyardArray}
        structure={structure}
        setStructure={setStructure}
        setLumberCampArray={setLumberCampArray}
        setGoldMineArray={setGoldMineArray}
        setStoneMineArray={setStoneMineArray}
        setAyuntamientoArray={setAyuntamientoArray}
        setShipyardArray={setShipyardArray}
        user={userData}
        setAppliedAumentar={setAppliedAumentar}
        progressBar={progressBar}
      />
      <Container className={`fixed ${styles.uiContainer}`}>
        <div className={styles.moneyWrapper}>
          <div className={styles.moneyDisplay}>Dinero Total: ${playerMoney}</div>
        </div>
        <div className={styles.buildButtonWrapper}>
          <Button variant="contained" color="primary" onClick={handleOpenDrawer}>
            Construir Edificios
          </Button>
          <BuildingDrawer
            open={drawerOpen}
            onClose={handleCloseDrawer}
            onBuild={handleBuild}
            setStructure={setStructure}
          />
        </div>
      </Container>
      <MessageIcon />
    </main>
  );
}