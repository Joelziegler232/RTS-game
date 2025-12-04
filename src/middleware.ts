
import { default as NextAuthMiddleware } from 'next-auth/middleware';

export default NextAuthMiddleware;

// Configuración del middleware para proteger las rutas
export const config = {
  matcher: ['/welcome', "/edificios/:path*", "/panel/:path*", "/mercado/:path*"]
};
