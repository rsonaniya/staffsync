import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  user: any | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, profile: any) => void;
  logout: () => void;
  updateUserProfile: (profile: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  // 🚀 LAZY INITIALIZATION: Instantly loads state from local storage.
  // No waiting for API calls. No blank white screens.
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("access_token"),
  );
  const [user, setUser] = useState<any | null>(() => {
    const storedUser = localStorage.getItem("user_profile");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // Because we load instantly from storage, the app never has an "initial auth loading" state.
  const isLoading = false;

  // Failsafe redirect: If they manually type /login in the URL but are already logged in
  useEffect(() => {
    if (token && user && window.location.pathname === "/login") {
      navigate("/dashboard");
    }
  }, [token, user, navigate]);

  const login = (accessToken: string, profile: any) => {
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("user_profile", JSON.stringify(profile));
    setToken(accessToken);
    setUser(profile);
    navigate("/dashboard");
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_profile");
    setToken(null);
    setUser(null);
    navigate("/login");
  };

  const updateUserProfile = (profile: any) => {
    localStorage.setItem("user_profile", JSON.stringify(profile));
    setUser(profile);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user, // True only if both exist
        isLoading,
        login,
        logout,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside an AuthProvider");
  return context;
}
