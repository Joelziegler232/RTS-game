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
  const [showPassword, setShowPassword] = useState(false);
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

    const trimmedName = fullname.trim();
if (trimmedName.length < 3 || trimmedName.length > 20) {
  setError("El nombre debe tener entre 3 y 20 caracteres");
  return;
}
if (!/^[a-zA-Z0-9_]+$/.test(trimmedName)) {
  setError("Solo letras, números y guiones bajos");
  return;
}

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    try {
      const formData = new FormData();
      formData.append('fullname', fullname.trim());
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
              placeholder="Nombre completo unico"
              name="fullname"
              value={fullname}
              onChange={e => setFullname(e.target.value)}
              required
              className="w-full p-2 border border-gray-700 rounded-lg text-white bg-gray-800 focus:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-600"
            />
            <p className="text-yellow-400 text-xs mt-1 text-center">
  Solo letras, números y guiones bajos • Máx 20 caracteres
</p>
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
              className="w-full p-2 border border-gray-700 rounded-lg text-white bg-gray-800 focus:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-600"
            />
          </div>
          <div className="w-full mb-4 relative">
            <label htmlFor="password" className="text-white mb-1 block">Contraseña</label>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              placeholder="Contraseña"
              name="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full p-2 border border-gray-700 rounded-lg text-white bg-gray-800 focus:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-600"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-2 top-10 text-black hover:text-gray-600 focus:outline-none"
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                {showPassword ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                )}
              </svg>
            </button>
          </div>
          <div className="w-full mb-4">
            <label htmlFor="profilePicture" className="text-white mb-1 block">Foto de perfil (opcional)</label>
            <input
              type="file"
              id="profilePicture"
              accept="image/*"
              onChange={(e) => setProfilePicture(e.target.files?.[0] || null)}
              className="w-full p-2 border border-gray-700 rounded-lg text-white bg-gray-800 focus:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-600"
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