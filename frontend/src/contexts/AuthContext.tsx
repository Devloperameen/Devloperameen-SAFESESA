import { ReactNode, createContext, useContext, useState } from "react";
import { apiRequest } from "@/lib/api";

export type AuthRole = "student" | "instructor" | "admin";

export interface AuthUser {
  id: string;
  email: string;
  role: AuthRole;
  name: string;
  avatar?: string;
  bio?: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role?: Exclude<AuthRole, "admin">;
}

interface AuthResponse {
  token: string;
  user: AuthUser;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<AuthUser>;
  register: (payload: RegisterPayload) => Promise<AuthUser>;
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

  const saveSession = (nextToken: string, nextUser: AuthUser) => {
    setToken(nextToken);
    setUser(nextUser);

    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_STORAGE_KEY, nextToken);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
    }
  };

  const clearSession = () => {
    setToken(null);
    setUser(null);

    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  };

  const login = async (payload: LoginPayload): Promise<AuthUser> => {
    setIsLoading(true);
    try {
      const data = await apiRequest<AuthResponse>("/auth/login", {
        method: "POST",
        body: payload,
      });
      saveSession(data.token, data.user);
      return data.user;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterPayload): Promise<AuthUser> => {
    setIsLoading(true);
    try {
      const data = await apiRequest<AuthResponse>("/auth/register", {
        method: "POST",
        body: payload,
      });
      saveSession(data.token, data.user);
      return data.user;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(user && token),
    isLoading,
    login,
    register,
    logout: clearSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
