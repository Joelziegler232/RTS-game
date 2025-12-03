"use client";
import { useState, FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(undefined);
    setSuccess(undefined);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      console.log("Respuesta de signIn:", res);

      if (res?.error) {
        if (res.error === "Tu cuenta está bloqueada. Revisa tu correo para desbloquearla.") {
          setError("Tu cuenta está bloqueada. Usa el botón de abajo para solicitar un enlace de desbloqueo.");
        } else {
          setError(res.error);
        }
        return;
      }

      if (res?.ok) {
        console.log("Inicio de sesión exitoso, redirigiendo a /welcome...");
        router.push("/welcome");
        router.refresh();
      } else {
        setError("Error inesperado al iniciar sesión");
      }
    } catch (error) {
      console.error("Error en handleSubmit:", error);
      setError("Error al iniciar sesión");
    }
  };

  const handleRequestUnlock = async () => {
    setError(undefined);
    setSuccess(undefined);

    if (!email) {
      setError("Por favor, ingresa tu email antes de solicitar el desbloqueo");
      return;
    }

    try {
      const response = await axios.post("/api/auth/request-unlock", { email });
      setSuccess("Correo de desbloqueo enviado. Revisa tu bandeja de entrada.");
    } catch (error: any) {
      console.error("Error en request-unlock:", error);
      setError(error.response?.data?.error || "Error al solicitar el desbloqueo");
    }
  };

  const handleRegisterClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push("/register");
  };

  const handleForgotPasswordClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push("/forgot-password");
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <main className="container mx-auto flex flex-col justify-center items-center min-h-screen bg-black">
      <h2 className="text-3xl font-bold mb-6 text-blue-500">Iniciar Sesión</h2>
      <div className="flex justify-center items-center w-full max-w-md">
        <form onSubmit={handleSubmit} className="w-full max-w-md bg-gray-800 border border-gray-700 p-4 flex flex-col justify-center items-center">
          <div className="w-full mb-4">
            <label htmlFor="email" className="text-white mb-1 block">Email</label>
            <input
              type="email"
              id="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
          <button
            type="submit"
            className="w-full p-2 bg-blue-500 text-white font-bold uppercase duration-200 hover:bg-blue-600 rounded-lg"
          >
            Iniciar Sesión
          </button>
          {error && <p className="text-red-500 mt-2">{error}</p>}
          {success && <p className="text-green-500 mt-2">{success}</p>}
          {error?.includes("cuenta está bloqueada") && (
            <button
              type="button"
              onClick={handleRequestUnlock}
              className="w-full p-2 bg-yellow-500 text-white font-bold uppercase duration-200 hover:bg-yellow-600 rounded-lg mt-2"
            >
              Solicitar Desbloqueo
            </button>
          )}
        </form>
      </div>
      <p className="text-2xl text-center text-white mt-4">
        ¿No tienes una cuenta?{" "}
        <a href="/register" onClick={handleRegisterClick} className="underline hover:text-blue-900">
          Registrarte
        </a>
      </p>
      <p className="text-2xl text-center text-white mt-4">
        ¿Olvidaste tu contraseña?{" "}
        <a href="/forgot-password" onClick={handleForgotPasswordClick} className="underline hover:text-blue-900">
          Recuperar contraseña
        </a>
      </p>
    </main>
  );
};

export default LoginPage;