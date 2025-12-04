'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import MapBuildings from './components/mapBuildings';
import CreacionMenu from './components/creacionMenu';
import Progressbar from './components/progressbar';
import BuildDrawer from './components/buildDrawer';
import MessageIcon from './components/MessageIcon';
import { User } from '../objects/user';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import { Structure } from './utils/StructuresData';
import Image from 'next/image';
import styles from './page.module.css';
import BattleModal from './components/BattleModal';
import { useMemo, useCallback } from "react";
import BattleResultModal from './components/BattleResultModal';
import { motion } from "framer-motion";


export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [structure, setStructure] = useState<number | null>(null);
  const [progressBar, setProgressBar] = useState<boolean | null>(null);
  const [unit, setUnit] = useState<any>();
  
  const [quantity, setQuantity] = useState(0);
  const [ayuntamientoMenu, setAyuntamientoMenu] = useState(false);

  const [gameMap, setGameMap] = useState<string[][] | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [playerGold, setPlayerGold] = useState(500);
  const [playerMoney, setPlayerMoney] = useState(5000);
  const [playerFood, setPlayerFood] = useState(200);
  const [playerLumber, setPlayerLumber] = useState(200);
  const [playerStone, setPlayerStone] = useState(50);

  const [playerVillagers, setPlayerVillagers] = useState(0);
  const [playerPopulationCap, setPlayerPopulationCap] = useState(0);
  const [playerLevel, setPlayerLevel] = useState(1);

  const [lumberCampArray, setLumberCampArray] = useState<Structure[]>([]);
  const [goldMineArray, setGoldMineArray] = useState<Structure[]>([]);
  const [stoneMineArray, setStoneMineArray] = useState<Structure[]>([]);
  const [millArray, setMillArray] = useState<Structure[]>([]);
  const [houseArray, setHouseArray] = useState<Structure[]>([]);
  const [ayuntamientoArray, setAyuntamientoArray] = useState<Structure[]>([]);
  const [barracksArray, setBarracksArray] = useState<Structure[]>([]);
  const [shipyardArray, setShipyardArray] = useState<Structure[]>([]);
  const [marketArray, setMarketArray] = useState<Structure[]>([]);


  const [units, setUnits] = useState<any[]>([]);
  const soldierCount = units.filter(u => u.type === "soldier").length;
  const [battleEnemy, setBattleEnemy] = useState<any | null>(null);
  const [battleOpen, setBattleOpen] = useState(false);
  const [battleLoading, setBattleLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

const [showResult, setShowResult] = useState(false);
const [lastReport, setLastReport] = useState<any>(null);

const [showAttackAlert, setShowAttackAlert] = useState(false);
const [latestAttack, setLatestAttack] = useState<any>(null);

const totalPopulation = playerVillagers + 
  (lumberCampArray.reduce((sum, b) => sum + (b.obreros || 0), 0) +
   goldMineArray.reduce((sum, b) => sum + (b.obreros || 0), 0) +
   stoneMineArray.reduce((sum, b) => sum + (b.obreros || 0), 0) +
   millArray.reduce((sum, b) => sum + (b.obreros || 0), 0)) +
  soldierCount;


  const [userData, setUserData] = useState<User>({
  id: '',
  name: '',
  username: '',
  password: '',
  level: 1,
  obreros: 0,
  aumentador: [],
  profilePicture: '/default-profile.png',

  poblacion: 0,
  poblacionLibre: 0,
  maxPoblacion: 0,
});

  const [pendingBuildCost, setPendingBuildCost] = useState<{
    gold?: number;
    money?: number;
    food?: number;
    lumber?: number;
    stone?: number;
  } | null>(null);

  useEffect(() => {
    console.log('Estado de la sesión:', { session, status });
    if (status === 'loading') return;

    const timer = setTimeout(() => {
      if (status === 'unauthenticated') {
        console.log('No autenticado, redirigiendo a /login');
        router.push('/login');
      }
    }, 10000);

    return () => clearTimeout(timer);
  }, [status, router, session]);

useEffect(() => {
  const handleEnemyFound = (e: CustomEvent) => {
    const enemy = e.detail;
    if (!enemy) return;

    console.log("Enemigo encontrado:", enemy);
    setBattleEnemy(enemy);
    setBattleOpen(true);
    setBattleLoading(false);
  };

  window.removeEventListener('enemyFound', handleEnemyFound as EventListener);
  window.addEventListener('enemyFound', handleEnemyFound as EventListener);

  return () => {
    window.removeEventListener('enemyFound', handleEnemyFound as EventListener);
  };
}, []);

useEffect(() => {
  const handleBattleResult = (e: any) => {
    const report = e.detail;
    if (!report) return;

    setLastReport(report);
    setShowResult(true);

    
    const reload = async () => {
      if (!session?.user?.id) return;
      try {
        const res = await fetch(`/api/user_instance/${session.user.id}`);
        if (res.ok) {
          const data = await res.json();
          setUnits(data.units || []);
          setPlayerFood(data.resources.find((r: any) => r.resource === "food")?.amount || 0);
         
          window.dispatchEvent(new CustomEvent("playerPopulationUpdate", {
            detail: {
              villagers: data.population.villagers,
              soldiers: data.population.soldiers,
              maxPopulation: data.population.maxPopulation,
            },
          }));
        }
      } catch (err) {
        console.error("Error recargando tras batalla");
      }
    };

    reload();
  };

  window.addEventListener("battleResult", handleBattleResult);
  return () => window.removeEventListener("battleResult", handleBattleResult);
}, [session?.user?.id]);

  useEffect(() => {
    if (!session?.user?.id) {
      console.log('No hay session.user.id, esperando...');
      return;
    }

    console.log('Cargando datos para userId:', session.user.id);

    const fetchUserData = async () => {
      try {
        const userResponse = await fetch(`/api/users/${session.user.id}`);
        if (!userResponse.ok) throw new Error('Error al cargar datos del usuario');

        const user = await userResponse.json();
        console.log('Datos del usuario cargados:', user);

        const instanceResponse = await fetch(`/api/user_instance/${session.user.id}`);

        if (!instanceResponse.ok) {
          if (instanceResponse.status === 404) {
            console.log('Instancia no existe. Creando nueva…');

            const newInstance = {
              userId: session.user.id,
              buildings: [],
              resources: [
                { resource: 'gold', amount: 500 },
                { resource: 'money', amount: 5000 },
                { resource: 'food', amount: 200 },
                { resource: 'lumber', amount: 200 },
                { resource: 'stone', amount: 50 },
              ],
              population: { villagers: 0, maxPopulation: 0 },
              map: { grid: Array(100).fill(null).map(() => Array(100).fill('plains')) },
              location: { x: 0, y: 0 },
              units: [],
              aumentadores: [],
              level: 1,
            };

            const createResponse = await fetch(`/api/user_instance/${session.user.id}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(newInstance),
            });

            if (!createResponse.ok) throw new Error('Error al crear instancia');

            console.log('Instancia creada correctamente.');

            const retryResponse = await fetch(`/api/user_instance/${session.user.id}`);
            if (!retryResponse.ok) throw new Error('Error al recargar instancia creada');

            const instance = await retryResponse.json();

            setGameMap(instance.map.grid);
            setLumberCampArray([]);
            setGoldMineArray([]);
            setStoneMineArray([]);
            setMillArray([]);
            setHouseArray([]);
            setAyuntamientoArray([]);
            setBarracksArray([]);
            setShipyardArray([]);
            setUnits([]);

            setPlayerGold(instance.resources.find((r: any) => r.resource === 'gold')?.amount || 0);
            setPlayerMoney(instance.resources.find((r: any) => r.resource === 'money')?.amount || 0);
            setPlayerFood(instance.resources.find((r: any) => r.resource === 'food')?.amount || 0);
            setPlayerLumber(instance.resources.find((r: any) => r.resource === 'lumber')?.amount || 0);
            setPlayerStone(instance.resources.find((r: any) => r.resource === 'stone')?.amount || 0);

            setPlayerVillagers(0);
            setPlayerPopulationCap(0);
            setPlayerLevel(1);

           setUserData({
  id: session.user.id,
  name: session.user.name || user.fullname || '',
  username: user.email || '',
  password: '',
  level: Number(instance.level),
  obreros: Number(instance.population?.villagers) || 0,
  aumentador: [],
  profilePicture: session.user.profilePicture || user.profilePicture || '/default-profile.png',

  poblacion: instance.population?.villagers || 0,
  poblacionLibre: instance.population?.villagers || 0, 
  maxPoblacion: instance.population?.maxPopulation || 0,
});
        
        if (instance.battleReports && instance.battleReports.length > 0) {
          const lastReport = instance.battleReports[0];
          const attackTime = new Date(lastReport.timestamp);
          const hoursSinceAttack = (Date.now() - attackTime.getTime()) / (1000 * 60 * 60);

          if (hoursSinceAttack < 24) {
            setLatestAttack(lastReport);
            setShowAttackAlert(true);
          }
        }

            return;
          }

          throw new Error('Error al cargar instancia');
        }

        const instance = await instanceResponse.json();
        console.log('Datos cargados:', instance);

        setGameMap(instance.map?.grid);
        const ayuntamientos = instance.buildings.filter((b: any) => b.type === 'ayuntamiento');

        setLumberCampArray(instance.buildings.filter((b: any) => b.type === 'lumber'));
        setGoldMineArray(instance.buildings.filter((b: any) => b.type === 'gold_mine'));
        setStoneMineArray(instance.buildings.filter((b: any) => b.type === 'stone_mine'));
        setMillArray(instance.buildings.filter((b: any) => b.type === 'mill'));
        setHouseArray(instance.buildings.filter((b: any) => b.type === 'house'));
        setAyuntamientoArray(instance.buildings.filter((b: any) => b.type === 'ayuntamiento'));
        setBarracksArray(instance.buildings.filter((b: any) => b.type === 'barracks'));
        setShipyardArray(instance.buildings.filter((b: any) => b.type === 'shipyard'));
        setMarketArray(instance.buildings.filter((b: any) => b.type === "mercado") || []);

        setUnits(instance.units || []);

        type ResourceItem = { resource: string; amount: number };

        setPlayerGold(Number(instance.resources.find((r: ResourceItem) => r.resource === 'gold')?.amount) || 500);
        setPlayerMoney(Number(instance.resources.find((r: ResourceItem) => r.resource === 'money')?.amount) || 5000);
        setPlayerFood(Number(instance.resources.find((r: ResourceItem) => r.resource === 'food')?.amount) || 200);
        setPlayerLumber(Number(instance.resources.find((r: ResourceItem) => r.resource === 'lumber')?.amount) || 200);
        setPlayerStone(Number(instance.resources.find((r: ResourceItem) => r.resource === 'stone')?.amount) || 50);

      const villagersFromBackend = instance.population?.villagers || 0;
setPlayerVillagers(villagersFromBackend);

        setPlayerPopulationCap(Number(instance.population?.maxPopulation) || 0);
        setPlayerLevel(Number(instance.level) || 1);

        setUserData({
  id: session.user.id,
  name: session.user.name || user.fullname || '',
  username: user.email || '',
  password: '',
  level: Number(instance.level),
  obreros: Number(instance.population?.villagers) || 0,
  aumentador: [],
  profilePicture: session.user.profilePicture || user.profilePicture || '/default-profile.png',

  poblacion: instance.population?.villagers || 0,
  poblacionLibre: instance.population?.villagers || 0, 
  maxPoblacion: instance.population?.maxPopulation || 0,
});
        
        if (instance.battleReports && instance.battleReports.length > 0) {
          const ultimoAtaque = instance.battleReports[0];
          const tiempo = new Date(ultimoAtaque.timestamp).getTime();
          const haceMenosDe24h = Date.now() - tiempo < 24 * 60 * 60 * 1000;

          if (haceMenosDe24h) {
            setLatestAttack(ultimoAtaque);
            setShowAttackAlert(true);
          }
        }

      } catch (error) {
        console.error('Error al cargar datos del usuario:', error);
        alert('Error al cargar datos. Recarga la página.');
      }
    };

    fetchUserData();
  }, [session]);

  useEffect(() => {
    const handleLevelUpdate = (e: any) => {
      setPlayerLevel(e.detail);
    };

    window.addEventListener("playerLevelUpdated", handleLevelUpdate);

    return () => {
      window.removeEventListener("playerLevelUpdated", handleLevelUpdate);
    };
  }, []);

  
  useEffect(() => {
    const handler = async (e: any) => {
      const cost = e?.detail?.cost || pendingBuildCost;
      if (!cost || !session?.user?.id) {
        setPendingBuildCost(null);
        return;
      }

     
      const newGold = Number(playerGold) - (cost.gold || 0);
      const newMoney = Number(playerMoney) - (cost.money || 0);
      const newFood = Number(playerFood) - (cost.food || 0);
      const newLumber = Number(playerLumber) - (cost.lumber || 0);
      const newStone = Number(playerStone) - (cost.stone || 0);

      setPlayerGold(newGold);
      setPlayerMoney(newMoney);
      setPlayerFood(newFood);
      setPlayerLumber(newLumber);
      setPlayerStone(newStone);

      
      try {
        await fetch(`/api/user_instance/${session.user.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resources: [
              { resource: 'gold', amount: newGold },
              { resource: 'money', amount: newMoney },
              { resource: 'food', amount: newFood },
              { resource: 'lumber', amount: newLumber },
              { resource: 'stone', amount: newStone },
            ],
          }),
        });
      } catch (err) {
        console.error('Error persistiendo recursos tras colocación:', err);
      } finally {
        setPendingBuildCost(null);
      }
    };

    window.addEventListener('buildingPlaced', handler);
    return () => window.removeEventListener('buildingPlaced', handler);
  }, [
    pendingBuildCost,
    playerGold,
    playerMoney,
    playerFood,
    playerLumber,
    playerStone,
    session?.user?.id,
  ]);

 
  // =============================
  //   RECURSOS POR SEGUNDOS
  // =============================

useEffect(() => {
  if (!session?.user?.id) return;

  const interval = setInterval(() => {
    let goldPerSec = 0;
    let lumberPerSec = 0;
    let stonePerSec = 0;
    let foodPerSec = 0;

    goldMineArray.forEach(m => {
      const base = m.produccion_hora || 0;
      const workers = m.obreros || 0;
      goldPerSec += (base + base * 0.5 * workers) / 3600;
    });

    stoneMineArray.forEach(m => {
      const base = m.produccion_hora || 0;
      const workers = m.obreros || 0;
      stonePerSec += (base + base * 0.5 * workers) / 3600;
    });

    millArray.forEach(m => {
      const base = m.produccion_hora || 0;
      const workers = m.obreros || 0;
      foodPerSec += (base + base * 0.5 * workers) / 3600;
    });

    lumberCampArray.forEach(m => {
      const base = m.produccion_hora || 0;
      const workers = m.obreros || 0;
      lumberPerSec += (base + base * 0.5 * workers) / 3600;
    });

    if (goldPerSec > 0) setPlayerGold(p => p + goldPerSec);
    if (lumberPerSec > 0) setPlayerLumber(p => p + lumberPerSec);
    if (stonePerSec > 0) setPlayerStone(p => p + stonePerSec);
    if (foodPerSec > 0) setPlayerFood(p => p + foodPerSec);

  }, 1000);

  return () => clearInterval(interval);
}, [session, goldMineArray, stoneMineArray, millArray, lumberCampArray]);

// Guardar recursos al cerrar pestaña
useEffect(() => {
  const saveResources = () => {
    if (!session?.user?.id) return;

    fetch(`/api/user_instance/${session.user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resources: [
          { resource: 'gold', amount: Math.floor(playerGold) },
          { resource: 'money', amount: Math.floor(playerMoney) },
          { resource: 'food', amount: Math.floor(playerFood) },
          { resource: 'lumber', amount: Math.floor(playerLumber) },
          { resource: 'stone', amount: Math.floor(playerStone) },
        ],
      }),
    });
  };

  const saveInterval = setInterval(saveResources, 120000);

  window.addEventListener('beforeunload', saveResources);

  return () => {
    clearInterval(saveInterval);
    window.removeEventListener('beforeunload', saveResources);
  };
}, [session, playerGold, playerLumber, playerStone, playerFood, playerMoney]);

useEffect(() => {
  const handleBattleResult = async (e: any) => {
    const report = e.detail;
    if (!report) return;

    // Cerramos modal
    setBattleOpen(false);
    setBattleEnemy(null);
    setBattleLoading(false);

    try {
      const res = await fetch(`/api/user_instance/${session?.user?.id}`);
      if (!res.ok) throw new Error("Error al recargar datos");

      const freshData = await res.json();

     

      setPlayerVillagers(freshData.population?.villagers || 0);
      setPlayerPopulationCap(freshData.population?.maxPopulation || 0);

      // Recursos
      const r = freshData.resources || [];
      setPlayerGold(r.find((x: any) => x.resource === "gold")?.amount || 0);
      setPlayerFood(r.find((x: any) => x.resource === "food")?.amount || 0);
      setPlayerLumber(r.find((x: any) => x.resource === "lumber")?.amount || 0);
      setPlayerStone(r.find((x: any) => x.resource === "stone")?.amount || 0);
      setPlayerMoney(r.find((x: any) => x.resource === "money")?.amount || 0);

      setLumberCampArray(freshData.buildings?.filter((b: any) => b.type === "lumber") || []);
setGoldMineArray(freshData.buildings?.filter((b: any) => b.type === "gold_mine") || []);
setStoneMineArray(freshData.buildings?.filter((b: any) => b.type === "stone_mine") || []);
setMillArray(freshData.buildings?.filter((b: any) => b.type === "mill") || []);
setHouseArray(freshData.buildings?.filter((b: any) => b.type === "house") || []);
setAyuntamientoArray(freshData.buildings?.filter((b: any) => b.type === "ayuntamiento") || []);
setBarracksArray(freshData.buildings?.filter((b: any) => b.type === "barracks") || []);
setShipyardArray(freshData.buildings?.filter((b: any) => b.type === "shipyard") || []);
setMarketArray(freshData.buildings?.filter((b: any) => b.type === "mercado") || []);

      
      window.dispatchEvent(new CustomEvent("instanceUpdated", { detail: freshData }));

    } catch (err) {
      console.error("Error recargando tras batalla:", err);
    }

    
    window.dispatchEvent(new CustomEvent("showBattleReport", { detail: report }));
  };

  window.addEventListener("battleResult", handleBattleResult);
  return () => window.removeEventListener("battleResult", handleBattleResult);
}, [session?.user?.id]);


// =============================
//  SINCRONIZACIÓN TOTAL CON BACKEND
// =============================
useEffect(() => {
  const updateFromBackend = (e: any) => {
    const data = e.detail;
    if (!data) return;

    
    setPlayerVillagers(data.population?.villagers || 0);
    setPlayerPopulationCap(data.population?.maxPopulation || 0);
        setUnits(data.units || []);                  
    setPlayerVillagers(data.population?.villagers || 0);
    setPlayerPopulationCap(data.population?.maxPopulation || 0);

    setLumberCampArray(data.buildings?.filter((b: any) => b.type === "lumber") || []);
setGoldMineArray(data.buildings?.filter((b: any) => b.type === "gold_mine") || []);
setStoneMineArray(data.buildings?.filter((b: any) => b.type === "stone_mine") || []);
setMillArray(data.buildings?.filter((b: any) => b.type === "mill") || []);
setHouseArray(data.buildings?.filter((b: any) => b.type === "house") || []);
setAyuntamientoArray(data.buildings?.filter((b: any) => b.type === "ayuntamiento") || []);
setBarracksArray(data.buildings?.filter((b: any) => b.type === "barracks") || []);
setShipyardArray(data.buildings?.filter((b: any) => b.type === "shipyard") || []);
setMarketArray(data.buildings?.filter((b: any) => b.type === "mercado") || []);

    setPlayerFood(data.resources?.find((r: any) => r.resource === "food")?.amount || 0);
    setPlayerGold(data.resources?.find((r: any) => r.resource === "gold")?.amount || 0);
    setPlayerLumber(data.resources?.find((r: any) => r.resource === "lumber")?.amount || 0);
    setPlayerStone(data.resources?.find((r: any) => r.resource === "stone")?.amount || 0);
  };

  window.addEventListener("instanceUpdated", updateFromBackend);
  return () => window.removeEventListener("instanceUpdated", updateFromBackend);
}, []);

  // =============================
  //        BUILDING HANDLER
  // =============================
  const handleOpenDrawer = () => setDrawerOpen(true);
  const handleCloseDrawer = () => setDrawerOpen(false);

 const handleBuild = useCallback((cost: {
  gold?: number;
  money?: number;
  food?: number;
  lumber?: number;
  stone?: number;
}) => {

  if (structure === 2 && ayuntamientoArray.length > 0) {
    alert('Solo puedes construir un ayuntamiento.');
    handleCloseDrawer();
    setStructure(null);
    setPendingBuildCost(null);
    return;
  }

  const newGold = Number(playerGold) - (cost.gold || 0);
  const newMoney = Number(playerMoney) - (cost.money || 0);
  const newFood = Number(playerFood) - (cost.food || 0);
  const newLumber = Number(playerLumber) - (cost.lumber || 0);
  const newStone = Number(playerStone) - (cost.stone || 0);

  if (newGold >= 0 && newMoney >= 0 && newFood >= 0 && newLumber >= 0 && newStone >= 0) {
    setPendingBuildCost(cost);
    handleCloseDrawer();
  } else {
    alert('No tienes suficientes recursos.');
    setStructure(null);
    setPendingBuildCost(null);
    handleCloseDrawer();
  }

}, [
  playerGold,
  playerMoney,
  playerFood,
  playerLumber,
  playerStone,
  structure,
  ayuntamientoArray.length
]);

  const searchBattle = async () => {
  if (isSearching) return;
  if (soldierCount === 0) {
    alert("Necesitas al menos 1 soldado para buscar batalla");
    return;
  }

  setIsSearching(true);
  setBattleEnemy(null);
  setBattleOpen(false);

  try {
    const res = await fetch('/api/battle/find', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: session?.user?.id })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Error buscando enemigo");
      return;
    }

    if (!data.enemy) {
      alert("No hay enemigos disponibles en este momento");
      return;
    }

    window.dispatchEvent(new CustomEvent('enemyFound', { detail: data.enemy }));

  } catch (err) {
    console.error(err);
    alert("Error de conexión");
  } finally {
    setIsSearching(false);
  }
};

  const handleProfileClick = () => {
    router.push('/welcome');
  };

  if (status === 'loading') {
    return <div className="container mx-auto text-center text-white">Cargando...</div>;
  }

 const handleAttack = async () => {
  if (!battleEnemy || !session?.user?.id) return;
  setBattleLoading(true);

  try {
    const soldiersToSend = units.filter(u => u.type === 'soldier').length;

    const res = await fetch('/api/battle/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        attackerId: session.user.id,
        defenderId: battleEnemy.userId,
        troops: { soldiers: soldiersToSend }
      })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || 'Error al iniciar batalla');
      setBattleLoading(false);
      return;
    }

   
    window.dispatchEvent(new CustomEvent('battleResult', { detail: data.report }));

   
    setBattleOpen(false);
    setBattleEnemy(null);

  } catch (err) {
    console.error('handleAttack error:', err);
    alert('Error al atacar.');
  } finally {
    setBattleLoading(false);
  }
};



  return (
    <main className={`${styles.main} min-h-screen relative`}>

      {/* =============================
          PERFIL (AVATAR)
      ============================= */}
      <div className={styles.profileAvatar} onClick={handleProfileClick}>
        {session?.user?.profilePicture ? (
          <Image
            src={session.user.profilePicture}
            alt="Foto de perfil"
            width={40}
            height={40}
            className={styles.avatarImage}
          />
        ) : (
          <div className={styles.avatarPlaceholder}>???</div>
        )}
      </div>

      {/* =============================
          RESOURCE BAR
      ============================= */}
      <div className={styles.resourceBar}>
  <div className={styles.populationItem}>
  Población: {totalPopulation}/{playerPopulationCap}
</div>

  <div className={styles.levelItem}>
    Nivel: {playerLevel}
  </div>

  <div className={styles.resourceItem}>Soldados: {soldierCount}</div>
<div className={styles.resourceItem}>
  Aldeanos Disponibles: {playerVillagers}
</div>



  <div className={styles.resourceItem}>Madera: {Math.floor(playerLumber)}</div>
  <div className={styles.resourceItem}>Comida: {Math.floor(playerFood)}</div>
  <div className={styles.resourceItem}>Piedras: {Math.floor(playerStone)}</div>
  <div className={styles.resourceItem}>Oro: {Math.floor(playerGold)}</div>
  <div className={styles.resourceItem}>Dinero: {Math.floor(playerMoney)}</div>
</div>


      {/* =============================
          MENÚ DE CREACIÓN (AYUNTAMIENTO)
      ============================= */}
      {ayuntamientoArray.length > 0 && ayuntamientoMenu && (
        <CreacionMenu
          user={userData}
          setProgressBar={setProgressBar}
          setUnit={setUnit}
          setQuantity={setQuantity}
          quantity={quantity}
          playerPopulationCap={playerPopulationCap}
          playerVillagers={playerVillagers}
          playerLevel={playerLevel}
          playerFood={playerFood}
          setPlayerFood={setPlayerFood}
          ayunMenu={ayuntamientoMenu}
          lumberCampArray={lumberCampArray}
  goldMineArray={goldMineArray}
  stoneMineArray={stoneMineArray}
  millArray={millArray}
  soldierCount={soldierCount}
        />
      )}

      {/* =============================
          BARRA DE PROGRESO 
      ============================= */}
      {progressBar && (
        <Progressbar
          running={progressBar}
          unit={unit!}
          setProgressBar={setProgressBar}
          quantity={quantity}
          ayuntamiento={ayuntamientoArray[0]!}
          setQuantity={setQuantity}
          userId={session?.user?.id || ''}
          setPlayerVillagers={setPlayerVillagers}
          setUnits={setUnits}
           setPlayerFood={setPlayerFood} 
        />
      )}

      {/* =============================
          MAPA + EDIFICIOS + UNIDADES
      ============================= */}
      <MapBuildings
  setAyuntamientoMenu={setAyuntamientoMenu}
  ayunMenu={ayuntamientoMenu}
  gameMap={gameMap}

  lumberCampArray={lumberCampArray}
goldMineArray={goldMineArray}
stoneMineArray={stoneMineArray}
millArray={millArray}
houseArray={houseArray}
ayuntamientoArray={ayuntamientoArray}
barracksArray={barracksArray}
shipyardArray={shipyardArray}

  structure={structure}
  setStructure={setStructure}

  setLumberCampArray={setLumberCampArray}
  setGoldMineArray={setGoldMineArray}
  setStoneMineArray={setStoneMineArray}
  setMillArray={setMillArray}
  setHouseArray={setHouseArray}
  setAyuntamientoArray={setAyuntamientoArray}
  setBarracksArray={setBarracksArray}
  setShipyardArray={setShipyardArray}

  user={userData}
  setAppliedAumentar={() => {}}
  progressBar={progressBar}
  units={units}
  setUnits={setUnits}
  playerFood={playerFood}
  setPlayerFood={setPlayerFood}
  
 marketArray={marketArray}
  setMarketArray={setMarketArray}
/>


    <BattleModal
  open={battleOpen}
  onClose={() => {
    setBattleOpen(false);
    setBattleEnemy(null);
  }}
  enemy={battleEnemy}
  onAttack={handleAttack}
  loading={battleLoading}
  onSearchAgain={() => {
    setBattleOpen(false);
    setBattleEnemy(null);
    searchBattle(); 
  }}
/>


      {/* =============================
          CONSTRUCCIÓN DE EDIFICIOS
      ============================= */}
      <Container className={`fixed ${styles.uiContainer}`}>
        <div className={styles.buildButtonWrapper}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setDrawerOpen(true)}
          >
            Construir Edificios
          </Button>

      {/* CARTEL de ataque */}
      {showAttackAlert && latestAttack && (
        <div className="fixed inset-0 bg-black/95 z-60 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 15 }}
            className="relative bg-gradient-to-b from-red-900 via-black to-red-950 border-8 border-red-600 rounded-3xl p-12 max-w-3xl text-center shadow-2xl"
          >
            

            <h1 className="text-8xl font-black text-red-500 mb-10 drop-shadow-2xl">
              ¡FUISTE ATACADO!
            </h1>

            <div className="space-y-6 text-3xl text-white">
              {latestAttack.attackerWins ? (
                <>
                  <p className="text-5xl text-orange-400 font-bold">
                    {latestAttack.attackerName || "Un enemigo"} te saqueó
                  </p>
                  <p>Perdiste <strong className="text-red-400">{latestAttack.losses}</strong> soldados</p>
                  {Object.entries(latestAttack.stolenResources).length > 0 && (
                    <div className="bg-red-900/50 rounded-2xl p-6 mt-6">
                      <p className="text-4xl mb-4 text-yellow-300">Te robaron:</p>
                      {Object.entries(latestAttack.stolenResources).map(([res, amt]: any) => (
                        amt > 0 && (
                          <p key={res} className="text-3xl">
                            - <strong>{amt}</strong> {res.charAt(0).toUpperCase() + res.slice(1)}
                          </p>
                        )
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-6xl text-green-400 font-bold animate-bounce">
                  ¡RECHAZASTE EL ATAQUE!
                </p>
              )}
            </div>

            <button
              onClick={() => setShowAttackAlert(false)}
              className="mt-12 px-24 py-8 bg-red-700 hover:bg-red-600 text-white text-5xl font-black rounded-full shadow-2xl transition-all transform hover:scale-110"
            >
              CERRAR
            </button>
          </motion.div>
        </div>
      )}

<BattleResultModal
  open={showResult}
  report={lastReport}
  onClose={() => {
    setShowResult(false);
    setLastReport(null);
  }}
/>
          <BuildDrawer
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            onBuild={handleBuild}
            setStructure={setStructure}
            playerLevel={playerLevel}
            ayuntamientoArray={ayuntamientoArray}
          />
        </div>
      </Container>

      {/* =============================
          ÍCONO DE MENSAJES
      ============================= */}
      <MessageIcon />
    </main>
  );
}
