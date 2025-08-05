// src/app/objects/user.ts
import { Aumentador } from "./aumentar";

export interface User {
  id: string; // Cambiado de number a string para coincidir con NextAuth
  name: string;
  username: string;
  password: string;
  level: number;
  aumentador?: Aumentador[];
  obreros: number;
}