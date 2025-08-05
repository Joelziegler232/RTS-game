// src/app/edificios/components/ayuntamientoMenu.tsx
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { User } from "@/app/objects/user";
import { Aumentador } from "@/app/objects/aumentar";
import { Structure } from "../utils/StructuresData";

export default function AyuntamientoDetails({
  ayuntamiento,
  user,
  setAppliedAumentar,
  progressBar,
}: {
  ayuntamiento: Structure;
  user: User;
  setAppliedAumentar: Dispatch<SetStateAction<Aumentador | null>>;
  progressBar: boolean | null;
}) {
  const [maxObreros, setMaxObreros] = useState(false);
  const [aumentarMenu, setAumentarMenu] = useState(false);
  const [userAumentador, setUserAumentador] = useState(user.aumentador || []);
  const [aumentar, setAumentar] = useState<Aumentador | null>(null);

  useEffect(() => {
    if ((ayuntamiento.obreros ?? 0) >= (ayuntamiento.maxObreros ?? 0) || user.obreros === 0) {
      setMaxObreros(true);
    } else {
      setMaxObreros(false);
    }
  }, [ayuntamiento.obreros, ayuntamiento.maxObreros, user.obreros]);

  const handleObreroClick = () => {
    if (user.obreros > 0 && (ayuntamiento.obreros ?? 0) < (ayuntamiento.maxObreros ?? 0)) {
      ayuntamiento.obreros = (ayuntamiento.obreros ?? 0) + 1;
      user.obreros -= 1;
    }
  };

  const handleAumentarClick = (index: number) => {
    if (progressBar) {
      setAppliedAumentar(userAumentador[index]);
      const newAumentador = [...userAumentador];
      newAumentador[index] = { ...newAumentador[index], quantity: newAumentador[index].quantity - 1 };
      setAumentar(newAumentador[index]);
      setUserAumentador(newAumentador);
    }
  };

  const AumentarMenu = ({
    aumentar,
    index,
  }: {
    aumentar: Aumentador;
    index: number;
  }) => {
    return (
      <div
        className="hover:cursor-pointer"
        onClick={() => handleAumentarClick(index)}
      >
        {aumentar.img}
        <span>
          {aumentar.name} <br />
          Incremento de: {aumentar.aumentar} <br />
          Cantidad: {aumentar.quantity}
        </span>
      </div>
    );
  };

  return (
    <div className="ayuntamiento-menu">
      {ayuntamiento.name}
      <br />
      Producción Actual: {ayuntamiento.producing ?? ""}
      <br />
      Tiempo: {/* lógica para el tiempo */}
      <br />
      Capacidad Máxima: {ayuntamiento.maxCap ?? 0}
      <br />
      Nivel: {ayuntamiento.level ?? 1}
      <br />
      Obreros: {ayuntamiento.obreros ?? 0} <br />
      <button onClick={handleObreroClick}>Destinar Obreros</button> <br />
      {maxObreros && "Máximo de obreros"} <br />
      {aumentar ? `Aumentar: ${aumentar.name}` : "Aumentar:"}
      <br />
      <button onClick={() => setAumentarMenu(!aumentarMenu)}>Incrementar</button>
      {aumentarMenu && userAumentador.map((aumentar, index) => <AumentarMenu aumentar={aumentar} index={index} key={index} />)}
    </div>
  );
}