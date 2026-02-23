import { apiRequest } from "@/lib/api";
import type { BackendUser } from "@/services/mappers";

export type AuthRole = "student" | "instructor" | "admin";

export interface AuthUser {
  id: string;
  email: string;
  role: AuthRole;
  name: string;
  avatar?: string;
  bio?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role?: Exclude<AuthRole, "admin">;
}

export interface UpdateProfilePayload {
  name?: string;
  bio?: string;
  avatar?: string;
}

interface AuthResponse {
  token: string;
  user: {
    id?: string;
    _id?: string;
    email: string;
    role: AuthRole;
    name?: string;
    avatar?: string;
    bio?: string;
    profile?: {
      name?: string;
      avatar?: string;
      bio?: string;
    };
  };
}

function mapAuthUserFromSession(rawUser: AuthResponse["user"]): AuthUser {
  return {
    id: rawUser.id || rawUser._id || "",
    email: rawUser.email,
    role: rawUser.role,
    name: rawUser.name || rawUser.profile?.name || "User",
    avatar: rawUser.avatar || rawUser.profile?.avatar,
    bio: rawUser.bio || rawUser.profile?.bio,
  };
}

function mapAuthUserFromDocument(user: BackendUser): AuthUser {
  return {
    id: user._id,
    email: user.email,
    role: user.role,
    name: user.profile?.name || "User",
    avatar: user.profile?.avatar,
    bio: user.profile?.bio,
  };
}

export async function login(payload: LoginPayload): Promise<{ token: string; user: AuthUser }> {
  const data = await apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: payload,
  });

  return {
    token: data.token,
    user: mapAuthUserFromSession(data.user),
  };
}

export async function register(payload: RegisterPayload): Promise<{ token: string; user: AuthUser }> {
  const data = await apiRequest<AuthResponse>("/auth/register", {
    method: "POST",
    body: payload,
  });

  return {
    token: data.token,
    user: mapAuthUserFromSession(data.user),
  };
}

export async function getCurrentUser(): Promise<AuthUser> {
  const data = await apiRequest<BackendUser>("/auth/me");
  return mapAuthUserFromDocument(data);
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<AuthUser> {
  const data = await apiRequest<BackendUser>("/auth/profile", {
    method: "PUT",
    body: payload,
  });
  return mapAuthUserFromDocument(data);
}
