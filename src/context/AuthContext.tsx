import { AuthState, User } from '@/models/types';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { deleteStoredValue, getStoredValue, setStoredValue } from '@/utils/storage';

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const USERS_KEY = 'wellness_mind_users_v1';
const SESSION_KEY = 'wellness_mind_session_v1';

async function readStoredUsers(): Promise<Record<string, { password: string; user: User }>> {
  const raw = await getStoredValue(USERS_KEY);
  return raw ? JSON.parse(raw) : {};
}

async function writeStoredUsers(users: Record<string, { password: string; user: User }>) {
  await setStoredValue(USERS_KEY, JSON.stringify(users));
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedSession = await getStoredValue(SESSION_KEY);
        if (!storedSession) {
          setLoading(false);
          return;
        }

        const sessionUser = JSON.parse(storedSession) as User;
        if (sessionUser?.email) {
          setUser(sessionUser);
          setIsAuthenticated(true);
        }
      } catch {
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const users = await readStoredUsers();
      const savedUser = users[normalizedEmail];

      if (!savedUser || savedUser.password !== password) {
        throw new Error('Invalid email or password');
      }

      setUser(savedUser.user);
      setIsAuthenticated(true);
      await setStoredValue(SESSION_KEY, JSON.stringify(savedUser.user));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(async (email: string, password: string, name: string) => {
    setLoading(true);
    setError(null);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      if (!normalizedEmail || !name.trim()) {
        throw new Error('Please complete all fields');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      const users = await readStoredUsers();
      if (users[normalizedEmail]) {
        throw new Error('Email already registered');
      }

      const newUser: User = {
        id: `user-${Date.now()}`,
        email: normalizedEmail,
        name: name.trim(),
        createdAt: Date.now(),
      };

      users[normalizedEmail] = { password, user: newUser };
      await writeStoredUsers(users);
      setUser(newUser);
      setIsAuthenticated(true);
      await setStoredValue(SESSION_KEY, JSON.stringify(newUser));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Signup failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      await deleteStoredValue(SESSION_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated,
      user,
      loading,
      error,
      login,
      signup,
      logout,
    }),
    [isAuthenticated, user, loading, error, login, signup, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
