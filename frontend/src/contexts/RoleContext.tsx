import React, { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "student" | "instructor" | "admin";

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

const ROLE_STORAGE_KEY = "eduflow_role";
const USER_STORAGE_KEY = "eduflow_user";

function getStoredRole(): UserRole {
  if (typeof window === "undefined") return "student";
  const stored = localStorage.getItem(ROLE_STORAGE_KEY);
  if (stored === "student" || stored === "instructor" || stored === "admin") {
    return stored;
  }

  const rawUser = localStorage.getItem(USER_STORAGE_KEY);
  if (rawUser) {
    try {
      const parsed = JSON.parse(rawUser) as { role?: UserRole };
      if (parsed.role === "student" || parsed.role === "instructor" || parsed.role === "admin") {
        return parsed.role;
      }
    } catch {
      // Ignore malformed local storage and use default role.
    }
  }

  return "student";
}

export const RoleProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRoleState] = useState<UserRole>(() => getStoredRole());

  const setRole = (nextRole: UserRole) => {
    setRoleState(nextRole);
    if (typeof window !== "undefined") {
      localStorage.setItem(ROLE_STORAGE_KEY, nextRole);
    }
  };

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within RoleProvider");
  return ctx;
};
