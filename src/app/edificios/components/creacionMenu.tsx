// src/app/edificios/components/creacionMenu.tsx
import Units from "@/app/generadores/objects/Units";
import { User } from "@/app/objects/user";
import Image from "next/image";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

const units_Array: Units[] = [
  {
    id: 1,
    name: "Aldeano",
    img: <Image key="Aldeano" src="/Aldeano.png" width={60} height={70} alt="png Aldeano" />,
    precio: 100,
    incrementador_time: 200,
    level: 1,
    desbloqueo: 1,
  },
];

export default function CreacionMenu({
  user,
  quantity,
  setProgressBar,
  setUnit,
  setQuantity,
}: {
  user: User;
  quantity: number;
  setProgressBar: Dispatch<SetStateAction<boolean | null>>;
  setUnit: Dispatch<SetStateAction<Units | undefined>>;
  setQuantity: Dispatch<SetStateAction<number>>;
}) {
  const [creacionMenu, setCreacionMenu] = useState(true);

  const CreacionMenuIcons = ({ units, user }: { units: Units; user: User }) => {
    if (user.level >= units.desbloqueo) {
      return (
        <div
          className="sidebar-icon group"
          onClick={() => {
            setProgressBar(true);
            setQuantity(quantity + 1);
            setUnit(units);
          }}
        >
          {units.img}
          <span className="sidebar-name group-hover:scale-100">
            {units.name}
            <br />
            Precio: {units.precio}
            <br />
            Tiempo: {units.incrementador_time}
            <br />
            Cantidad x1
          </span>
        </div>
      );
    } else {
      return (
        <div className="min-lev-req group">
          <i className="opacity-20">{units.img}</i>
          <span className="sidebar-name group-hover:scale-100 opacity-80 flex flex-col">
            <div>{`You must be Level: ${units.desbloqueo} to unlock ${units.name}`}</div>
            <div>{`Current Level: ${user.level}`}</div>
          </span>
        </div>
      );


    }
  };

  return (
    <main>
      <div
        className={`fixed bottom-0 h-[100px] w-screen m-0 flex flex-row bg-transparent shadow-md transition-all duration-300 ${
          creacionMenu ? "translate-y-full" : "translate-y-0"
        }`}
      >
        {units_Array.map((units, index) => (
          <CreacionMenuIcons units={units} user={user} key={index} />
        ))}
      </div>
      <div>
        <button
          className={`fixed bottom-[105px] left-[47%] transition-all duration-300 ${
            creacionMenu ? "translate-y-[105px]" : "translate-y-0"
          }`}
          onClick={() => {
            setCreacionMenu(!creacionMenu);
          }}
        >
          Crear Aldeano
        </button>
      </div>
    </main>
  );
}