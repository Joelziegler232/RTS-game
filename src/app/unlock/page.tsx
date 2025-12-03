"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function UnlockAccount() {
  const [token, setToken] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Obtener token solo en cliente
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    if (!t) {
      setError("Token inválido o faltante");
    } else {
      setToken(t);
    }
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!token) {
      setError("Token inválido o faltante");
      return;
    }

    try {
      const response = await fetch("/api/auth/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Error al desbloquear la cuenta");

      setMessage("Cuenta desbloqueada con éxito. Redirigiendo al inicio de sesión...");
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
      <h2 className="text-3xl font-bold mb-6 text-blue-500">Desbloquear Cuenta</h2>
      <div className="flex justify-center items-center w-full max-w-md">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md bg-gray-800 border border-gray-700 p-4 flex flex-col justify-center items-center"
        >
          <p className="text-white mb-4">Haz clic en el botón para desbloquear tu cuenta.</p>
          <button
            type="submit"
            className="w-full p-2 bg-blue-500 text-white font-bold uppercase duration-200 hover:bg-blue-600 rounded-lg"
          >
            Desbloquear Cuenta
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
