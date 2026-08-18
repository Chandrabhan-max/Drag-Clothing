import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../api/axios";

const AuthContext = createContext(null);

const normalizeUser = (rawUser) => {
  if (!rawUser) return null;

  return {
    ...rawUser,

    // Always keep role in lowercase on frontend
    role: rawUser.role
      ? String(rawUser.role).toLowerCase()
      : null,
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // =========================================================
  // RESTORE USER ON PAGE LOAD
  // =========================================================
  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    console.log("🔐 AuthProvider loaded");
    console.log("🔑 Access token exists:", !!token);

    if (!token) {
      setLoading(false);
      return;
    }

    const loadCurrentUser = async () => {
      try {
        console.log("🔥 Calling GET /auth/me");

        const res = await api.get("/auth/me");

        console.log("✅ /auth/me response:", res.data);

        const currentUser = normalizeUser(
          res.data?.data ?? res.data
        );

        console.log(
          "👤 Normalized current user:",
          currentUser
        );

        setUser(currentUser);
      } catch (error) {
        console.error(
          "❌ /auth/me failed:",
          error?.response?.data || error
        );

        await logout();
      } finally {
        setLoading(false);
      }
    };

    loadCurrentUser();
  }, []);

  // =========================================================
  // LOGIN
  // =========================================================
  const login = async (email, password) => {
    console.log("🔐 Login started:", email);

    const res = await api.post("/auth/login", {
      email,
      password,
    });

    console.log(
      "✅ Login response:",
      res.data
    );

    const accessToken =
      res.data?.data?.accessToken ??
      res.data?.accessToken;

    const refreshToken =
      res.data?.data?.refreshToken ??
      res.data?.refreshToken;

    if (!accessToken) {
      throw new Error(
        "Login succeeded but access token was not returned."
      );
    }

    localStorage.setItem(
      "accessToken",
      accessToken
    );

    if (refreshToken) {
      localStorage.setItem(
        "refreshToken",
        refreshToken
      );
    }

    console.log(
      "✅ Tokens stored in localStorage"
    );

    // Fetch logged-in user
    const me = await api.get("/auth/me");

    console.log(
      "✅ /auth/me after login:",
      me.data
    );

    const currentUser = normalizeUser(
      me.data?.data ?? me.data
    );

    console.log(
      "👤 Final logged-in user:",
      currentUser
    );

    setUser(currentUser);

    return currentUser;
  };

  // =========================================================
  // LOGOUT
  // =========================================================
  const logout = async () => {
    try {
      const token = localStorage.getItem(
        "accessToken"
      );

      if (token) {
        await api.post("/auth/logout");
      }
    } catch (error) {
      console.warn(
        "Logout API failed:",
        error?.response?.data || error
      );
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      setUser(null);

      console.log(
        "🚪 User logged out"
      );
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};