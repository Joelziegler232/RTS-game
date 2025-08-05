// src/welcome/page.tsx
"use client";
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';

export default function WelcomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirigir a /login si no está autenticado
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' });
  };

  if (status === 'loading') {
    return <p className="text-white text-center">Cargando...</p>;
  }

  if (!session) {
    return null; // El useEffect manejará la redirección
  }

  return (
    <main className="container mx-auto flex flex-col justify-center items-center min-h-screen bg-black" style={{ marginTop: "-100px" }}>
      <h1 className="text-4xl font-bold mb-6 text-blue-500">Bienvenido a RTS Game</h1>
      <div className="text-center text-white flex flex-col items-center">
        {/* Foto de perfil */}
        <div className="mb-4">
          {session.user?.profilePicture ? (
            <img
              src={session.user.profilePicture}
              alt="Foto de perfil"
              className="w-24 h-24 rounded-full border-2 border-gray-700 object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-800 border-2 border-gray-700 flex items-center justify-center text-gray-400">
              Sin imagen
            </div>
          )}
        </div>
        <p className="text-2xl mb-4">Hola, {session.user?.name || 'Usuario'}!</p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/edificios"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-2xl"
          >
            Ir a jugar
          </Link>
          <Link
            href="/panel"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-2xl"
          >
            Ver perfil
          </Link>
        </div>
        <button
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-2xl mt-4"
          onClick={handleSignOut}
        >
          Cerrar sesión
        </button>
        <div className="mt-10">
          {/* Espacio para información futura, como estadísticas */}
        </div>
      </div>
    </main>
  );
}