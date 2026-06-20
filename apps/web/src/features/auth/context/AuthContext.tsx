/* eslint-disable react-refresh/only-export-components */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { authApi } from "../api/auth.api";
import type {
  AuthSession,
  AuthUser,
  LoginInput,
} from "../types/auth.types";

type AuthContextValue = {
  accessToken: string | null;
  user: AuthUser | null;
  initializing: boolean;
  login: (input: LoginInput) => Promise<AuthUser>;
  acceptSession: (session: AuthSession) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [initializing, setInitializing] = useState(true);

  const acceptSession = useCallback((nextSession: AuthSession) => {
    setSession(nextSession);
  }, []);

  useEffect(() => {
    let active = true;

    authApi
      .refresh()
      .then((nextSession) => {
        if (active) {
          setSession(nextSession);
        }
      })
      .catch(() => {
        if (active) {
          setSession(null);
        }
      })
      .finally(() => {
        if (active) {
          setInitializing(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    const nextSession = await authApi.login(input);
    setSession(nextSession);
    return nextSession.user;
  }, []);

  const logout = useCallback(async () => {
    const token = session?.accessToken ?? null;
    setSession(null);
    await authApi.logout(token).catch(() => undefined);
  }, [session?.accessToken]);

  const value = useMemo<AuthContextValue>(
    () => ({
      accessToken: session?.accessToken ?? null,
      user: session?.user ?? null,
      initializing,
      login,
      acceptSession,
      logout,
    }),
    [acceptSession, initializing, login, logout, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
