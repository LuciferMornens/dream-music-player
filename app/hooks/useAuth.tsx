import React, { useState, useEffect, useCallback, useContext, createContext } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import type { Profile } from '@/types/database';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, username?: string, fullName?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load user profile
  const loadProfile = useCallback(async (userId: string) => {
    try {
      // Add timeout for profile loading
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      clearTimeout(timeoutId);

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn('Profile loading timed out');
      } else {
        console.error('Error loading profile:', error);
      }
    }
  }, []);

  // Create profile for new user
  const createProfile = useCallback(async (user: User, username?: string, fullName?: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          username,
          full_name: fullName,
          avatar_url: null
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error creating profile:', error);
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    async function getInitialSession() {
      try {
        // Set a timeout to prevent infinite loading
        timeoutId = setTimeout(() => {
          if (mounted) {
            console.warn('Auth initialization timeout');
            setLoading(false);
          }
        }, 10000); // 10 second timeout

        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            await loadProfile(session.user.id);
          }
          
          if (timeoutId) clearTimeout(timeoutId);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          if (timeoutId) clearTimeout(timeoutId);
          setLoading(false);
        }
      }
    }

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            await loadProfile(session.user.id);
          } else {
            setProfile(null);
          }
          
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  // Sign in
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  }, []);

  // Sign up
  const signUp = useCallback(async (
    email: string, 
    password: string, 
    username?: string, 
    fullName?: string
  ) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) return { error };

      // Create profile for new user
      if (data.user && data.user.email_confirmed_at) {
        await createProfile(data.user, username, fullName);
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }, [createProfile]);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setSession(null);
      router.push('/auth/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }, [router]);

  // Update profile
  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) return { error };

      setProfile(data);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }, [user]);

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}