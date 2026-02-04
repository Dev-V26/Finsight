// src/context/AuthContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api } from "../api/client";

export const AuthContext = createContext(null);

function normalizeUser(payload) {
  // supports different backend response shapes
  return (
    payload?.user ||
    payload?.data?.user ||
    payload?.data ||
    payload?.profile ||
    null
  );
}

function normalizeToken(payload) {
  return payload?.token || payload?.accessToken || payload?.data?.token || null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const fetchMe = async () => {
    try {
      const res = await api.get("/auth/me");
      const u = normalizeUser(res.data);
      setUser(u);
      return u;
    } catch (e) {
      setUser(null);
      return null;
    }
  };

  useEffect(() => {
    // On app start: if token exists, try fetch user
    (async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) await fetchMe();
      } finally {
        setAuthLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ accepts BOTH styles:
  // login({ email, password })  OR login(email, password)
  const login = async (a, b) => {
    const email = typeof a === "string" ? a : a?.email;
    const password = typeof a === "string" ? b : a?.password;

    // ✅ Prevents "email: Required, password: Required" from backend
    if (!email || !password) {
      const err = new Error("Email and password are required.");
      err.normalizedMessage = "Email and password are required.";
      throw err;
    }

    const res = await api.post("/auth/login", { email, password });

    const token = normalizeToken(res.data);
    if (token) localStorage.setItem("token", token);

    // prefer backend "user" if present, otherwise fetch /me
    const u = normalizeUser(res.data);
    if (u) setUser(u);
    else await fetchMe();

    return res.data;
  };

  const logout = async () => {
    try {
      // many backends use POST /auth/logout
      await api.post("/auth/logout");
    } catch (e) {
      // ignore if endpoint doesn't exist (404 etc)
    }

    localStorage.removeItem("token");
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      setUser,
      authLoading,
      login,
      logout,
      fetchMe,
      isAuthenticated: !!user,
    }),
    [user, authLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
