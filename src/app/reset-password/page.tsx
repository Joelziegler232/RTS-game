// src/app/reset-password/page.tsx
"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState<string | null>(null);

useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  setToken(params.get("token"));
}, []);


  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Error al restablecer la contraseña");

      setMessage("Contraseña restablecida con éxito. Redirigiendo al inicio de sesión...");
      setTimeout(() => router.push("/login"), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleBackToLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push("/login");
  };

  return (
    <main className="container mx-auto flex flex-col justify-center items-center min-h-screen bg-black">
      <h2 className="text-3xl font-bold mb-6 text-blue-500">Restablecer Contraseña</h2>
      <div className="flex justify-center items-center w-full max-w-md">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md bg-gray-800 border border-gray-700 p-4 flex flex-col justify-center items-center"
        >
          <div className="w-full mb-4">
            <label htmlFor="password" className="text-white mb-1 block">Nueva Contraseña</label>
            <input
              type="password"
              id="password"
              placeholder="Nueva Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-2 border border-gray-700 rounded-lg text-white bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="w-full mb-4">
            <label htmlFor="confirmPassword" className="text-white mb-1 block">Confirmar Contraseña</label>
            <input
              type="password"
              id="confirmPassword"
              placeholder="Confirmar Contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full p-2 border border-gray-700 rounded-lg text-white bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full p-2 bg-blue-500 text-white font-bold uppercase duration-200 hover:bg-blue-600 rounded-lg"
          >
            Restablecer Contraseña
          </button>
          {message && <p className="text-green-500 mt-2">{message}</p>}
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </form>
      </div>
      <p className="text-2xl text-center text-white mt-4">
        <a href="/login" onClick={handleBackToLogin} className="underline hover:text-blue-900">
          Volver al inicio de sesión
        </a>
      </p>
    </main>
  );
}
