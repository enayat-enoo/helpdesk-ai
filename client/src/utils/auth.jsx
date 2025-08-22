import React, { createContext, useContext, useEffect, useState } from "react";
import api from "./api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("hd_user");
    return raw ? JSON.parse(raw) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("hd_token") || null);

  useEffect(() => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  }, [token]);

  const login = (obj) => {
    setUser(obj.user);
    setToken(obj.token);
    localStorage.setItem("hd_user", JSON.stringify(obj.user));
    localStorage.setItem("hd_token", obj.token);
    api.defaults.headers.common["Authorization"] = `Bearer ${obj.token}`;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("hd_user");
    localStorage.removeItem("hd_token");
    delete api.defaults.headers.common["Authorization"];
  };

  return <AuthContext.Provider value={{ user, token, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
