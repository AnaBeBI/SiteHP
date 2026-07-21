'use client';

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export interface Profile {
  id: string;
  nome: string;
  cargo: string;
  especialidade: string | null;
  tipo_cargo: 'Externo' | 'Interno' | 'Geral';
  hierarquia: 'Chefe' | null;
  is_admin: boolean;
}

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  canAccess: (section: string) => boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null, profile: null, loading: true,
  signOut: async () => {},
  canAccess: () => false,
});

export function useAuth() {
  return useContext(AuthContext);
}

const LAUDOS_BLOCKED = ['Estagiário', 'Tec. Enfermagem'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/profile/me');
      if (!res.ok) { setProfile(null); return; }
      const data = await res.json();
      setProfile(data as Profile | null);
    } catch (e) {
      console.error('[auth] fetchProfile error:', e);
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile();
        } else {
          setProfile(null);
        }
      } catch (e) {
        console.error('[auth] onAuthStateChange error:', e);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile, supabase.auth]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    router.push('/login');
  }, [supabase.auth, router]);

  const canAccess = useCallback((section: string): boolean => {
    if (!profile) return false;
    if (profile.is_admin) return true;
    if (section === 'laudos') return !LAUDOS_BLOCKED.includes(profile.cargo);
    if (section === 'psiquiatria') return profile.especialidade === 'Psiquiatra';
    return true;
  }, [profile]);

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, canAccess }}>
      {children}
    </AuthContext.Provider>
  );
}
