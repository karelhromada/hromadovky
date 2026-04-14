import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  street: string | null;
  city: string | null;
  zip: string | null;
  last_delivery: string | null;
  last_payment: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile(data);
      } else {
        // Profile missing — first login (typically OAuth). Create from auth metadata.
        const { data: userData } = await supabase.auth.getUser();
        const authUser = userData.user;
        if (authUser) {
          const meta = (authUser.user_metadata ?? {}) as Record<string, unknown>;
          const fullName = typeof meta.full_name === 'string' ? meta.full_name : '';
          const [metaFirst, ...metaRest] = fullName.split(' ');
          const firstName =
            (typeof meta.first_name === 'string' && meta.first_name) ||
            (typeof meta.given_name === 'string' && meta.given_name) ||
            metaFirst ||
            '';
          const lastName =
            (typeof meta.last_name === 'string' && meta.last_name) ||
            (typeof meta.family_name === 'string' && meta.family_name) ||
            metaRest.join(' ') ||
            '';

          const { data: inserted, error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: authUser.id,
              email: authUser.email ?? null,
              first_name: firstName || null,
              last_name: lastName || null,
            })
            .select()
            .maybeSingle();

          if (insertError) throw insertError;
          setProfile(inserted);
        }
      }
    } catch {
      // Keep profile null on failure; UI handles missing profile gracefully.
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
