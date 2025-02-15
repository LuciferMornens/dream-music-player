'use client';
import { ReactNode } from 'react';
import Navbar from '../Navbar';
import PlayerBar from '../PlayerBar';
import ToastNotification from '../ToastNotification';
import DeleteConfirmation from '../DeleteConfirmation';
import { useContext } from 'react';
import { PlayerContext } from '../PlayerContext';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { showToast, toastMessage } = useContext(PlayerContext);

  return (
    <div 
      className="min-h-screen flex flex-col bg-surface-950 overflow-hidden"
      role="application"
    >
      {/* Fixed header */}
      <header className="fixed-header" role="banner">
        <Navbar />
      </header>

      {/* Main content with proper spacing */}
      <main
        className="flex-1 pt-14 pb-16 px-4 md:pt-16 md:pb-20 md:px-6 lg:px-8"
        role="main"
        id="main-content"
      >
        {children}
      </main>

      {/* Fixed footer player */}
      <footer className="fixed-player" role="contentinfo">
        <PlayerBar />
      </footer>

      {/* Toast notification */}
      {showToast && (
        <div role="alert" aria-live="polite">
          <ToastNotification message={toastMessage} />
        </div>
      )}

      {/* Delete confirmation dialog */}
      <DeleteConfirmation />
    </div>
  );
}
