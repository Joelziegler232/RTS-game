import Image from 'next/image';
export interface Structure {
  id: number;
  name: string;
  type: 'lumber' | 'gold_mine' | 'stone_mine' | 'ayuntamiento' | 'shipyard' | 'mill' | 'house' | 'barracks' | 'mercado'; 
  img?: JSX.Element;
  spriteImage?: string;
  cost: {
    gold?: number;
    money?: number;
    food?: number;
    lumber?: number;
    stone?: number;
  };
  width?: number;
  height?: number;
  produccion_hora?: number;
  obreros?: number;
  level?: number;
  desbloqueo: number;
  maxObreros?: number;
  maxCapacity?: number;
  aumentar?: boolean;
  position?: { x: number; y: number };
  updateTime?: Date;
  capacity?: number;
  aldeanos_por_casa?: number;
  requiredVillagers?: number;
  description?: string;
}


export interface Generadores extends Structure {
  type: 'lumber' | 'gold_mine' | 'stone_mine' | 'mill';
  produccion_hora: number;
  obreros: number;           
  maxObreros: number;
  maxCapacity: number;
  capacity: number;
  updateTime: Date;
}

export const structures: Structure[] = [
  {
    id: 1,
    name: 'Fábrica de madera',
    type: 'lumber',
    img: <Image src='/madera_generador.png' width={20} height={20} alt='Generador de madera' />,
    spriteImage: '/madera_generador.png',
    cost: { money: 100, lumber: 50 },
    produccion_hora: 720,
    level: 1,
    desbloqueo: 2,
    maxObreros: 5,
    maxCapacity: 200,
    requiredVillagers: 1,
  },
  {
    id: 2,
    name: 'Ayuntamiento',
    type: 'ayuntamiento',
    img: <Image src='/casa_oracion.png' width={20} height={20} alt='Ayuntamiento' />,
    spriteImage: '/casa_oracion.png',
    cost: {},
    desbloqueo: 1,
    requiredVillagers: 0,
  },
  {
    id: 3,
    name: 'Puerto',
    type: 'shipyard',
    img: <Image src='/port.png' width={20} height={20} alt='Astillero' />,
    spriteImage: '/port.png',
    cost: { money: 300, lumber: 80 },
    desbloqueo: 4,
    requiredVillagers: 2,
  },
  {
    id: 4,
    name: 'Mina de oro',
    type: 'gold_mine',
    img: <Image src='/gold_mine.png' width={20} height={20} alt='Mina de oro' />,
    spriteImage: '/gold_mine.png',
    cost: { money: 150, lumber: 70 },
    produccion_hora: 720,
    level: 1,
    desbloqueo: 3,
    maxObreros: 3,
    maxCapacity: 200,
    requiredVillagers: 1,
  },
  {
    id: 5,
    name: 'Mina de piedra',
    type: 'stone_mine',
    img: <Image src='/stone_mine.png' width={20} height={20} alt='Mina de piedra' />,
    spriteImage: '/stone_mine.png',
    cost: { money: 120, lumber: 60 },
    produccion_hora: 720,
    level: 1,
    desbloqueo: 3,
    maxObreros: 3,
    maxCapacity: 200,
    requiredVillagers: 1,
  },
  {
    id: 6,
    name: 'Molino',
    type: 'mill',
    img: <Image src='/molino.png' width={20} height={20} alt='Molino' />,
    spriteImage: '/molino.png',
    cost: { money: 200, lumber: 100 },
    produccion_hora: 720,
    level: 1,
    desbloqueo: 2,
    maxObreros: 5,
    maxCapacity: 200,
    requiredVillagers: 1,
  },
  {
    id: 7,
    name: 'Casa',
    type: 'house',
    img: <Image src='/casaD.png' width={20} height={20} alt='Casa' />,
    spriteImage: '/casaD.png',
    cost: { money: 150, lumber: 50 },
    aldeanos_por_casa: 5,
    desbloqueo: 2,
    requiredVillagers: 1,
  },
  {
    id: 8,
    name: 'Cuartel',
    type: 'barracks',
    img: <Image src='/cuartel.png' width={20} height={20} alt='Cuartel' />,
    spriteImage: '/cuartel.png',
    cost: { money: 300, lumber: 100 },
    desbloqueo: 3,
    requiredVillagers: 2,
  },

{
  id: 9,
  name: "Mercado",
  type: "mercado",
  spriteImage: "/mercado.png",
  cost: { gold: 200, money: 1000 },
  desbloqueo: 4,
  produccion_hora: 0,
  obreros: 0,
  maxObreros: 0,
  capacity: 0,
  maxCapacity: 0,
  level: 1,
  aumentar: false,
},

];

export const structuresForBackend = structures.map(({ img, ...rest }) => rest);