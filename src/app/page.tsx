// src/page.tsx
"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Mensaje troll en la consola del navegador
    console.log(
      '%cEl maldito game😈',
      'color: red; font-size: 20px; font-weight: bold;'
    );

    // Redirigir a /welcome después de 3 segundos
    const timer = setTimeout(() => {
      router.push('/welcome');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className="container mx-auto flex flex-col justify-center items-center min-h-screen bg-black text-white">
      <h1 className="text-4xl font-bold mb-6 text-red-500">¡Lento pero seguro!</h1>
      <p className="text-2xl mb-4"> 😈</p>
      <p className="text-xl">Espera...</p>
      <div className="mt-6 animate-bounce">👻</div>
    </main>
  );
}