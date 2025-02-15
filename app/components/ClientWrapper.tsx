'use client';
import { ReactNode, useLayoutEffect, useState } from 'react';
import PlayerContextProvider from './PlayerContext';
import MainLayout from './layouts/MainLayout';

export default function ClientWrapper({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Let Next.js loading.tsx handle the loading state
  }

  return (
    <PlayerContextProvider>
      <MainLayout>
        {children}
      </MainLayout>
    </PlayerContextProvider>
  );
}