import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type UserRole = "provider" | "customer" | "admin";

export interface AuthUser {
  name: string;
  role: UserRole;
}

interface AuthContextValue {
  user: AuthUser | null;
  login: (user: AuthUser) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  login: () => {},
  logout: () => {},
  isAuthenticated: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem("arabati_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  function login(u: AuthUser) {
    setUser(u);
    localStorage.setItem("arabati_user", JSON.stringify(u));
  }

  function logout() {
    setUser(null);
    localStorage.removeItem("arabati_user");
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
