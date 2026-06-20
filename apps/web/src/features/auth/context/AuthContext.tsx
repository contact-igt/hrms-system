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
  organizationLogin: (input: LoginInput) => Promise<AuthUser>;
  platformLogin: (
    input: Pick<LoginInput, "email" | "password">,
  ) => Promise<AuthUser>;
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

  const organizationLogin = useCallback(async (input: LoginInput) => {
    const nextSession = await authApi.organizationLogin(input);
    setSession(nextSession);
    return nextSession.user;
  }, []);

  const platformLogin = useCallback(
    async (input: Pick<LoginInput, "email" | "password">) => {
      const nextSession = await authApi.platformLogin(input);
      setSession(nextSession);
      return nextSession.user;
    },
    [],
  );

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
      organizationLogin,
      platformLogin,
      acceptSession,
      logout,
    }),
    [
      acceptSession,
      initializing,
      logout,
      organizationLogin,
      platformLogin,
      session,
    ],
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
