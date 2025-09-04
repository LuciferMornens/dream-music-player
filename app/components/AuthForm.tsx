'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';

interface AuthFormProps {
  mode: 'login' | 'signup';
}

export function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { signIn, signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let result;
      
      if (mode === 'login') {
        result = await signIn(email, password);
      } else {
        result = await signUp(email, password, username, fullName);
      }

      if (result.error) {
        setError(result.error.message || 'An error occurred');
      } else {
        router.push('/');
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const isLogin = mode === 'login';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-abyss relative overflow-hidden">
      {/* Background Music Vibe Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-primary-500/5 rounded-full blur-3xl bass-thump" />
        <div className="absolute bottom-1/4 right-1/4 w-1/3 h-1/3 bg-accent-500/8 rounded-full blur-2xl beat-bounce" />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-primary-400/3 rounded-full blur-3xl music-pulse" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-elegant rounded-3xl p-8 w-full max-w-md ocean-border relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 120 }}
            className="mb-4 flex items-center justify-center"
          >
            {/* Music Logo with Frequency Bars */}
            <div className="flex items-center space-x-3">
              <div className="frequency-bars">
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
              </div>
              <h1 className="text-4xl font-bold elegant-text music-pulse">
                Dream Music
              </h1>
              <div className="frequency-bars">
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
              </div>
            </div>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-surface-300 treasure-text"
          >
            {isLogin ? 'Welcome back' : 'Join the community'}
          </motion.p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <label htmlFor="email" className="block text-sm font-medium text-surface-300 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl glass border border-primary-500/30 text-white placeholder-surface-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 focus:shadow-ocean-glow transition-all"
              placeholder="Enter your email"
            />
          </motion.div>

          {/* Password */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <label htmlFor="password" className="block text-sm font-medium text-surface-300 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 rounded-xl glass border border-primary-500/30 text-white placeholder-surface-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 focus:shadow-ocean-glow transition-all"
              placeholder="Enter your password"
            />
          </motion.div>

          {/* Additional fields for signup */}
          {!isLogin && (
            <>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <label htmlFor="username" className="block text-sm font-medium text-surface-300 mb-2">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl glass border border-primary-500/30 text-white placeholder-surface-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 focus:shadow-ocean-glow transition-all"
                  placeholder="Choose a username"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
              >
                <label htmlFor="fullName" className="block text-sm font-medium text-surface-300 mb-2">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl glass border border-primary-500/30 text-white placeholder-surface-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 focus:shadow-ocean-glow transition-all"
                  placeholder="Enter your full name"
                />
              </motion.div>
            </>
          )}

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass border border-red-400/50 rounded-xl p-3 text-red-300 text-sm sound-ripple"
            >
              {error}
            </motion.div>
          )}

          {/* Submit button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: isLogin ? 0.6 : 0.8 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="btn-ocean w-full py-3 px-4 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed bass-thump"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                {isLogin ? 'Signing in...' : 'Creating account...'}
              </div>
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </motion.button>

          {/* Switch mode */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: isLogin ? 0.7 : 0.9 }}
            className="text-center"
          >
            <p className="text-surface-400">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => router.push(isLogin ? '/auth/signup' : '/auth/login')}
                className="ocean-text hover:text-primary-300 font-medium transition-colors music-pulse"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}