// app/reset-password/page.tsx
export const dynamic = 'force-dynamic';   

import { Suspense } from 'react';
import ResetPassword from './ResetPasswordClient';

interface PageProps {
  searchParams: Promise<{ token?: string }>;  
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Cargando...</div>}>
      <ResetPassword />
    </Suspense>
  );
}