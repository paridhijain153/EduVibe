import { createContext, useCallback, useContext, useEffect, useState } from "react";


import { Auth } from "./store";







const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const refresh = useCallback(() => {
    setUser(Auth.current());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const logout = useCallback(() => {
    Auth.logout();
    refresh();
  }, [refresh]);

  return (
    <AuthContext.Provider value={{ user, refresh, logout }}>{children}</AuthContext.Provider>);

}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}