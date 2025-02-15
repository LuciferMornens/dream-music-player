'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="h-full">
      {/* Animated background gradient */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/20 via-accent-900/20 to-primary-900/20 animate-pulse opacity-50" />
      </div>

      <div className="container mx-auto h-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-full">
            <Link
              href="/"
              className="text-xl md:text-2xl font-bold relative group"
            >
              <span className="cosmic-text animate-glow">MyMusic</span>
              {/* Hover effect line */}
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-neon group-hover:w-full transition-all duration-300" />
            </Link>
            
            <div className="flex items-center space-x-4 md:space-x-8">
              <Link
                href="/"
                className={`relative group overflow-hidden ${
                  pathname === '/' ? 'text-primary-400' : 'text-surface-300'
                }`}
              >
                <span className="relative z-10 text-sm md:text-base font-medium transition-colors duration-300 group-hover:text-primary-400">
                  Home
                </span>
                {/* Animated background effect */}
                <div className={`
                  absolute inset-0 bg-gradient-neon opacity-0 group-hover:opacity-10 
                  transition-opacity duration-300
                `} />
                {/* Bottom line effect */}
                <div className={`
                  absolute bottom-0 left-0 h-0.5 bg-gradient-neon
                  transition-all duration-300 ease-out
                  ${pathname === '/' ? 'w-full' : 'w-0 group-hover:w-full'}
                `} />
              </Link>
            </div>
        </div>
      </div>
    </nav>
  );
}