import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../api/axiosInstance";

interface AuthContextType {
  user: any | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, profile: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function initializeAuth() {
      const storedToken = localStorage.getItem("access_token");
      const storedUser = localStorage.getItem("user_profile");

      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        // Validate token against backend to ensure it's still alive
        const response = await axiosInstance.get("/auth/me", {
          headers: { Authorization: `Bearer ${storedToken}` },
        });

        setToken(storedToken);
        setUser(response.data);
        localStorage.setItem("user_profile", JSON.stringify(response.data));

        // If user manually navigates to login while already authenticated, kick them to dashboard
        if (window.location.pathname === "/login") {
          navigate("/dashboard");
        }
      } catch (err) {
        // Interceptor cleans tokens out if the API call returns 401
        console.error("Token verification failed:", err);
      } finally {
        setIsLoading(false);
      }
    }

    initializeAuth();
  }, [navigate]);

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

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated: !!user, isLoading, login, logout }}
    >
      {!isLoading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside an AuthProvider");
  return context;
}
