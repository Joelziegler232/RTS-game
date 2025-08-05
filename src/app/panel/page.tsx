// src/panel/page.tsx
"use client";
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState, ChangeEvent, FormEvent } from 'react';

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [name, setName] = useState(session?.user?.name || '');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(session?.user?.profilePicture || null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.name) {
      setName(session.user.name);
    }
    if (session?.user?.profilePicture) {
      setPreviewUrl(session.user.profilePicture);
    } else {
      setPreviewUrl(null);
    }
  }, [session]);

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' });
  };

  const handleBackToWelcome = () => {
    router.push('/welcome');
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setError('La imagen no debe exceder 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('Solo se permiten imágenes');
        return;
      }
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!session?.user?.id) {
      setError('No se encontró el ID del usuario');
      return;
    }

    if (name.length < 3 || name.length > 50) {
      setError('El nombre debe tener entre 3 y 50 caracteres');
      return;
    }

    const formData = new FormData();
    if (name !== session.user.name) {
      formData.append('fullname', name);
    }
    if (profilePicture) {
      formData.append('profilePicture', profilePicture);
    }

    try {
      console.log('Enviando solicitud PATCH a /api/users/', session.user.id, { name, hasProfilePicture: !!profilePicture });
      const response = await fetch(`/api/users/${session.user.id}`, {
        method: 'PATCH',
        body: formData,
      });

      console.log('Respuesta recibida:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorMessage = 'Error desconocido';
        if (contentType && contentType.includes('application/json')) {
          const result = await response.json();
          errorMessage = result.error || `Error ${response.status}: ${response.statusText}`;
        } else {
          const text = await response.text();
          console.error('Respuesta no es JSON:', text || 'vacía');
          errorMessage = `Respuesta no válida del servidor: ${text || 'vacía'}`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      setSuccess(result.message || 'Perfil actualizado correctamente');

      // Actualizar la sesión con los datos devueltos por el servidor
      await update({
        name: result.user.name,
        profilePicture: result.user.profilePicture,
      });

      // Actualizar el estado local
      setName(result.user.name);
      setPreviewUrl(result.user.profilePicture);
      setProfilePicture(null); // Limpiar el input de archivo
    } catch (err: any) {
      console.error('Error en handleSubmit:', err);
      setError(err.message || 'Error al actualizar el perfil');
    }
  };

  const handleDeleteProfilePicture = async () => {
    setError(null);
    setSuccess(null);

    if (!session?.user?.id) {
      setError('No se encontró el ID del usuario');
      return;
    }

    try {
      console.log('Enviando solicitud PATCH para eliminar imagen a /api/users/', session.user.id);
      const response = await fetch(`/api/users/${session.user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deleteProfilePicture: true }),
      });

      console.log('Respuesta recibida:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorMessage = 'Error desconocido';
        if (contentType && contentType.includes('application/json')) {
          const result = await response.json();
          errorMessage = result.error || `Error ${response.status}: ${response.statusText}`;
        } else {
          const text = await response.text();
          console.error('Respuesta no es JSON:', text || 'vacía');
          errorMessage = `Respuesta no válida del servidor: ${text || 'vacía'}`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      setSuccess(result.message || 'Foto de perfil eliminada correctamente');

      // Actualizar la sesión y el estado local
      await update({
        name: result.user.name,
        profilePicture: null,
      });
      setPreviewUrl(null);
    } catch (err: any) {
      console.error('Error en handleDeleteProfilePicture:', err);
      setError(err.message || 'Error al eliminar la foto de perfil');
    }
  };

  return (
    <div className="container mx-auto p-4">
      {status === "loading" && <p className="text-white text-center">Cargando...</p>}
      {session && (
        <div className="bg-gray-800 p-4 rounded-lg max-w-md mx-auto">
          <div className="flex justify-start mb-4">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              onClick={handleBackToWelcome}
            >
              Volver
            </button>
          </div>
          <h2 className="text-xl font-bold mb-4 text-white">{name}</h2>
          <p className="text-white mb-2">Email: {session.user.email}</p>
          <div className="mb-4">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Foto de perfil"
                className="w-24 h-24 rounded-full border-2 border-gray-700 object-cover mx-auto"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-800 border-2 border-gray-700 flex items-center justify-center text-gray-400 mx-auto">
                Sin imagen
              </div>
            )}
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="name" className="text-white mb-1 block">Nombre</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border border-gray-700 rounded-lg text-white bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="profilePicture" className="text-white mb-1 block">Foto de perfil</label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  id="profilePicture"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="flex-1 p-2 border border-gray-700 rounded-lg text-white bg-gray-800"
                />
                {previewUrl && (
                  <button
                    type="button"
                    onClick={handleDeleteProfilePicture}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    Eliminar
                  </button>
                )}
              </div>
            </div>
            {error && <p className="text-red-500">{error}</p>}
            {success && <p className="text-green-500">{success}</p>}
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Actualizar perfil
            </button>
          </form>
          <div className="flex justify-center mt-4">
            <button
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              onClick={handleSignOut}
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
      {status === "unauthenticated" && (
        <p className="text-white">
          No estás autenticado.{' '}
          <Link href="/login" className="underline hover:text-blue-500">
            Iniciar sesión
          </Link>
        </p>
      )}
    </div>
  );
}