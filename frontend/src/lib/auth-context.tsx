"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { api, setToken, clearToken, ApiError } from "@/lib/api";
import { User } from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
    full_name: string;
    email: string;
    password: string;
    role: string;
    village_id: string;
    department_id?: string;
  }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function roleHome(role: string): string {
  if (role === "government_officer") return "/officer";
  if (role === "village_admin") return "/admin";
  return "/citizen";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  async function refreshUser() {
    try {
      const me = await api.get<User>("/api/auth/me");
      setUser(me);
    } catch {
      setUser(null);
    }
  }

  useEffect(() => {
    (async () => {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("gs_token")
          : null;
      if (token) {
        await refreshUser();
      }
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function login(email: string, password: string) {
    const res = await api.post<{ access_token: string }>("/api/auth/login", {
      email,
      password,
    });
    setToken(res.access_token);
    const me = await api.get<User>("/api/auth/me");
    setUser(me);
    router.push(roleHome(me.role));
  }

  async function register(payload: {
    full_name: string;
    email: string;
    password: string;
    role: string;
    village_id: string;
    department_id?: string;
  }) {
    const res = await api.post<{ access_token: string }>(
      "/api/auth/register",
      payload
    );
    setToken(res.access_token);
    const me = await api.get<User>("/api/auth/me");
    setUser(me);
    router.push(roleHome(me.role));
  }

  function logout() {
    clearToken();
    setUser(null);
    router.push("/login");
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export { ApiError };
