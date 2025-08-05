"use client";
import React from "react";
import { SessionProvider } from "next-auth/react";

interface Props {
  children: React.ReactNode;
}

function Providers({ children }: Props) {
  // Proveedor de sesión de NextAuth para gestionar la autenticación
  return <SessionProvider>{children}</SessionProvider>;
}

export default Providers;