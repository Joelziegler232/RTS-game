export const dynamic = 'force-dynamic';  

import { Suspense } from 'react';
import UnlockAccount from './UnlockAccountClient';

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Cargando...</div>}>
      <UnlockAccount />
    </Suspense>
  );
}