'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const pathname = usePathname();
  const { user, profile, signOut, loading } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
  };

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
            <span className="cosmic-text animate-glow">Dream Music</span>
            {/* Hover effect line */}
            <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-neon group-hover:w-full transition-all duration-300" />
          </Link>
          
          <div className="flex items-center space-x-4 md:space-x-8">
            {user && (
              <Link
                href="/"
                className={`relative group overflow-hidden ${
                  pathname === '/' ? 'text-primary-400' : 'text-surface-300'
                }`}
              >
                <span className="relative z-10 text-sm md:text-base font-medium transition-colors duration-300 group-hover:text-primary-400">
                  Library
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
            )}

            {/* User menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 text-sm text-surface-300 hover:text-primary-400 transition-colors duration-300 bg-surface-800/50 rounded-full px-3 py-2 backdrop-blur-sm border border-surface-700 hover:border-primary-500/50"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {(profile?.username || user.email || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden md:block">
                    {profile?.username || profile?.full_name || user.email?.split('@')[0] || 'User'}
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${
                      showUserMenu ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m19 9-7 7-7-7" />
                  </svg>
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-48 bg-surface-800/95 backdrop-blur-lg rounded-xl shadow-2xl border border-surface-700 z-50 overflow-hidden"
                      onBlur={() => setShowUserMenu(false)}
                    >
                      <div className="py-2">
                        <div className="px-4 py-2 text-xs text-surface-400 border-b border-surface-700">
                          <div className="font-medium text-surface-200">
                            {profile?.full_name || 'Dream User'}
                          </div>
                          <div>{user.email}</div>
                        </div>
                        
                        <button
                          onClick={handleSignOut}
                          className="w-full text-left px-4 py-2 text-sm text-surface-300 hover:text-red-400 hover:bg-surface-700/50 transition-colors duration-200 flex items-center space-x-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              !loading && (
                <div className="flex items-center space-x-4">
                  <Link
                    href="/auth/login"
                    className="text-sm font-medium text-surface-300 hover:text-primary-400 transition-colors duration-300"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="text-sm font-medium px-4 py-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-lg hover:from-primary-600 hover:to-accent-600 transition-all duration-300 shadow-lg hover:shadow-primary-500/25"
                  >
                    Sign Up
                  </Link>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}