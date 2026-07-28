import { useMemo } from "react";
import type { ReactNode } from "react";
import { AuthContext } from "./AuthContext";
import { useAuth } from "../hooks/useAuth";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  const value = useMemo(() => ({ user, loading }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
