import { ReactNode, createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  getCurrentUser,
  login as loginRequest,
  register as registerRequest,
  updateProfile as updateProfileRequest,
  type AuthUser,
  type LoginPayload,
  type RegisterPayload,
  type UpdateProfilePayload,
} from "@/services/authService";

export type { AuthRole, AuthUser } from "@/services/authService";

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitializing: boolean;
  login: (payload: LoginPayload) => Promise<AuthUser>;
  register: (payload: RegisterPayload) => Promise<AuthUser>;
  refreshUser: () => Promise<AuthUser | null>;
  updateProfile: (payload: UpdateProfilePayload) => Promise<AuthUser>;
  logout: () => void;
}

const TOKEN_STORAGE_KEY = "eduflow_token";
const USER_STORAGE_KEY = "eduflow_user";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
}

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(Boolean(getStoredToken()));

  const saveSession = useCallback((nextToken: string, nextUser: AuthUser) => {
    setToken(nextToken);
    setUser(nextUser);

    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_STORAGE_KEY, nextToken);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
    }
  }, []);

  const clearSession = useCallback(() => {
    setToken(null);
    setUser(null);

    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  }, []);

  const login = async (payload: LoginPayload): Promise<AuthUser> => {
    setIsLoading(true);
    try {
      const data = await loginRequest(payload);
      saveSession(data.token, data.user);
      return data.user;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterPayload): Promise<AuthUser> => {
    setIsLoading(true);
    try {
      const data = await registerRequest(payload);
      saveSession(data.token, data.user);
      return data.user;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async (): Promise<AuthUser | null> => {
    if (!token) return null;
    try {
      const current = await getCurrentUser();
      saveSession(token, current);
      return current;
    } catch {
      clearSession();
      return null;
    }
  };

  const updateProfile = async (payload: UpdateProfilePayload): Promise<AuthUser> => {
    setIsLoading(true);
    try {
      const updated = await updateProfileRequest(payload);
      if (token) {
        saveSession(token, updated);
      }
      return updated;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const hydrateSession = async () => {
      if (!token) {
        setIsInitializing(false);
        return;
      }

      try {
        const current = await getCurrentUser();
        if (!isMounted) return;
        saveSession(token, current);
      } catch {
        if (!isMounted) return;
        clearSession();
      } finally {
        if (isMounted) setIsInitializing(false);
      }
    };

    hydrateSession();
    return () => {
      isMounted = false;
    };
  }, [token, saveSession, clearSession]);

  const value = {
    user,
    token,
    isAuthenticated: Boolean(user && token),
    isLoading,
    isInitializing,
    login,
    register,
    refreshUser,
    updateProfile,
    logout: clearSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
