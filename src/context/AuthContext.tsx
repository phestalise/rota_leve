import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { seedIfNeeded } from '../storage/seed';
import {
  authenticate,
  clearSession,
  createUser,
  getSessionUser,
  saveSession,
  updateUserProfile,
} from '../storage/users';
import { MobilityProfile, User } from '../types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  saveProfile: (profile: MobilityProfile) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      await seedIfNeeded();
      setUser(await getSessionUser());
      setLoading(false);
    })();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const logged = await authenticate(email, password);
    await saveSession(logged.id);
    setUser(logged);
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    const created = await createUser({ name, email, password });
    await saveSession(created.id);
    setUser(created);
  }, []);

  const signOut = useCallback(async () => {
    await clearSession();
    setUser(null);
  }, []);

  const saveProfile = useCallback(
    async (profile: MobilityProfile) => {
      if (!user) return;
      setUser(await updateUserProfile(user.id, profile));
    },
    [user],
  );

  const value = useMemo(
    () => ({ user, loading, signIn, signUp, signOut, saveProfile }),
    [user, loading, signIn, signUp, signOut, saveProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
