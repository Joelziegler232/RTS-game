// Importa el middleware de next-auth
import { default as NextAuthMiddleware } from 'next-auth/middleware';

// Exporta el middleware por defecto de next-auth
export default NextAuthMiddleware;

// Configuración del middleware para proteger las rutas
export const config = {
  // Define el patrón de las rutas que deseas proteger
  matcher: ['/welcome', "/edificios/:path*", "/panel/:path*"]
};
