import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { tokenManager, api, APIError } from "./api-client";

export type Role = "admin" | "lecturer" | "student";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "STUDENT" | "LECTURER" | "ADMIN";
  matricNumber?: string;
  staffId?: string;
  avatarUrl?: string | null;
}

interface RoleContextValue {
  role: Role;
  user: User | null;
  loading: boolean;
  setRole: (r: Role) => void;
  setUser: (u: User | null) => void;
  logout: () => void;
  checkSession: () => Promise<void>;
}

const RoleContext = createContext<RoleContextValue>({
  role: "lecturer",
  user: null,
  loading: true,
  setRole: () => {},
  setUser: () => {},
  logout: () => {},
  checkSession: async () => {},
});

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>("lecturer");
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const setRole = (r: Role) => {
    setRoleState(r);
  };

  const setUser = (u: User | null) => {
    setUserState(u);
    if (u) {
      // Map backend uppercase role to frontend lowercase role
      const mappedRole = u.role.toLowerCase() as Role;
      setRoleState(mappedRole);
    } else {
      setRoleState("student");
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout").catch(() => {});
    } finally {
      tokenManager.clearToken();
      setUserState(null);
      setRoleState("student");
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  };

  const checkSession = async () => {
    const token = tokenManager.getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await api.get<{ data: { user: User } }>(`/auth/me?t=${Date.now()}`);
      if (response?.data?.user) {
        setUser(response.data.user);
      } else {
        setUser(null);
      }
    } catch (error: any) {
      console.error("Session check failed:", error);
      // Only clear token if the error is explicitly a 401 Unauthorized response
      const isUnauthorized = (error instanceof APIError && error.status === 401) || error?.status === 401;
      if (isUnauthorized) {
        tokenManager.clearToken();
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  return (
    <RoleContext.Provider
      value={{
        role,
        user,
        loading,
        setRole,
        setUser,
        logout,
        checkSession,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export const useRole = () => useContext(RoleContext);
