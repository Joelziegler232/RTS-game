import Link from 'next/link';
import { useSession } from 'next-auth/react';

function Navbar() {
  // Obtener la sesión del usuario
  const { data: session } = useSession();

  return (
    <nav className='bg-zinc-600 p-8'>
      <div className='flex justify-between container mx-auto'>
        {/* Enlace al inicio */}
        <Link href="/">
          <a className='font-bold text-xl'>RTS</a>
        </Link>

        {/* Menú de navegación */}
        <ul className='flex gap-x-2'>
          {/* Si no hay sesión → mostrar Login y Register */}
          {!session && (
            <>
              <li>
                <Link href="/login" passHref>
                  <a className='px-4 py-2 bg-blue-500 text-white rounded'>Login</a>
                </Link>
              </li>
              <li>
                <Link href="/register" passHref>
                  <a className='px-4 py-2 bg-blue-500 text-white rounded'>Register</a>
                </Link>
              </li>
            </>
          )}

          {/* Botón Home siempre visible */}
          <li>
            <Link href="/welcome" passHref>
              <a className='px-4 py-2 bg-blue-500 text-white rounded'>Home</a>
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;