// src/app/register/page.tsx
"use client";
import axios, { AxiosError } from 'axios';
import { FormEvent, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

function RegisterPage() {
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullname, setFullname] = useState("");
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(undefined);
    setSuccess(undefined);

    if (!fullname || !email || !password) {
      setError("Por favor, completa todos los campos requeridos");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Por favor, ingresa un email válido");
      return;
    }

    if (fullname.length < 3 || fullname.length > 50) {
      setError("El nombre completo debe tener entre 3 y 50 caracteres");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    try {
      const formData = new FormData();
      formData.append('fullname', fullname);
      formData.append('email', email);
      formData.append('password', password);
      if (profilePicture) formData.append('profilePicture', profilePicture);

      console.log('Enviando datos a /api/auth/signup:', { fullname, email, password, profilePicture });

      const signupResponse = await axios.post('/api/auth/signup', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      console.log('Respuesta de /api/auth/signup:', signupResponse.data);

      const res = await signIn('credentials', {
        email: signupResponse.data.email,
        password,
        redirect: false,
      });

      console.log('Respuesta de signIn:', res);

      if (res?.ok) {
        setSuccess("Cuenta creada exitosamente");
        setEmail("");
        setPassword("");
        setFullname("");
        setProfilePicture(null);
        router.push('/welcome');
      } else {
        console.error('Error en signIn:', res?.error);
        setError(res?.error || 'Error al autenticar el usuario');
      }
    } catch (error) {
      console.error('Error en el registro:', error);
      if (error instanceof AxiosError) {
        const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message;
        console.log('Detalles del error de Axios:', {
          status: error.response?.status,
          data: error.response?.data,
        });
        setTimeout(() => {
          setError(errorMessage);
        }, 2000);
      } else {
        setTimeout(() => {
          setError('Error inesperado al crear la cuenta');
        }, 2000);
      }
    }
  };

  const handleLoginClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push('/login');
  };

  return (
    <main className="container mx-auto flex flex-col justify-center items-center min-h-screen bg-black">
      <h2 className="text-3xl font-bold mb-6 text-blue-500">Registrarte</h2>
      <div className="flex justify-center items-center w-full max-w-md">
        <form onSubmit={handleSubmit} className="w-full max-w-md bg-gray-800 border border-gray-700 p-4 flex flex-col justify-center items-center">
          <div className="w-full mb-4">
            <label htmlFor="fullname" className="text-white mb-1 block">Nombre completo</label>
            <input
              type="text"
              id="fullname"
              placeholder="Nombre completo"
              name="fullname"
              value={fullname}
              onChange={e => setFullname(e.target.value)}
              required
              className="w-full p-2 border border-gray-700 rounded-lg text-white bg-gray-800"
            />
          </div>
          <div className="w-full mb-4">
            <label htmlFor="email" className="text-white mb-1 block">Email</label>
            <input
              type="email"
              id="email"
              placeholder="Email"
              name="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full p-2 border border-gray-700 rounded-lg text-white bg-gray-800"
            />
          </div>
          <div className="w-full mb-4">
            <label htmlFor="password" className="text-white mb-1 block">Contraseña</label>
            <input
              type="password"
              id="password"
              placeholder="Contraseña"
              name="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full p-2 border border-gray-700 rounded-lg text-white bg-gray-800"
            />
          </div>
          <div className="w-full mb-4">
            <label htmlFor="profilePicture" className="text-white mb-1 block">Foto de perfil (opcional)</label>
            <input
              type="file"
              id="profilePicture"
              accept="image/*"
              onChange={(e) => setProfilePicture(e.target.files?.[0] || null)}
              className="w-full p-2 border border-gray-700 rounded-lg text-white bg-gray-800"
            />
          </div>
          <button
            type="submit"
            className="w-full p-2 bg-blue-500 text-white font-bold uppercase duration-200 hover:bg-blue-600 rounded-lg"
          >
            Registrarte
          </button>
          {success && <p className="text-green-500 mt-2">{success}</p>}
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </form>
      </div>
      <p className="text-2xl text-center text-white mt-4">
        ¿Ya tienes una cuenta?{" "}
        <a href="/login" onClick={handleLoginClick} className="underline hover:text-blue-900">
          Iniciar sesión
        </a>
      </p>
    </main>
  );
}

export default RegisterPage;