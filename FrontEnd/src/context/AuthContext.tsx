import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  AccountStatus,
  UserRole,
  Gender,
  EmploymentType,
  DocumentCategory,
} from "../types/enums";

// ==========================================
// 1. TYPED INTERFACES
// ==========================================

export interface ShiftDetails {
  id: number;
  name: string;
  start_time: string;
  end_time: string;
  grace_period_minutes: number;
  working_days: number[];
  is_active: boolean;
}

export interface LocationDetails {
  id: number;
  name: string;
  city: string;
  address: string | null;
  state: string;
  country: string;
  timezone: string;
  is_active: boolean;
}

export interface EmploymentDetails {
  id: number;
  user_id: number;
  department: string;
  designation: string;
  employment_type: EmploymentType;
  reporting_manager_id: number | null;
  joining_date: string;
  probation_period_months: number;
  leave_policy_id: number;
  shift_id: number;
  location_id: number;
  shift: ShiftDetails;
  location: LocationDetails;
}

export interface PayrollDetails {
  id: number;
  annual_ctc: number;
  basic_salary: number;
  hra: number;
  special_allowance: number;
  currency: string;
  bank_name: string;
  account_number: string;
  ifsc: string;
  account_holder_name: string | null;
  pan_number: string | null;
  aadhaar_number: string | null;
  uan_number: string | null;
}

export interface UserDocument {
  category: DocumentCategory;
  display_name: string;
  file_name: string;
  file_url: string;
  file_public_id: string;
}

export interface LeaveBalance {
  id: number;
  user_id: number;
  leave_type_id: number;
  allocated_days: number;
  used_days: number;
  available_balance: number;
  calendar_year: number;
}

export interface UserProfile {
  id: number;
  is_email_verified: boolean;
  first_name: string;
  last_name: string | null;
  email: string;
  personal_email: string | null;
  phone: string | null;
  date_of_birth: string | null;
  gender: Gender | null;
  residential_address: string | null;
  current_address: string | null;
  timezone: string;
  profile_image_url: string | null;
  profile_image_public_id: string | null;
  emergency_contact_name: string | null;
  emergency_contact_relationship: string | null;
  emergency_contact_phone: string | null;
  role: UserRole;
  account_status: AccountStatus;
  onboarding_step: number;
  employment_details: EmploymentDetails | null;
  payroll_details: PayrollDetails | null;
  documents: UserDocument[];
  leave_balances: LeaveBalance[];
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, profile: UserProfile) => void;
  logout: () => void;
  updateUserProfile: (profile: UserProfile) => void;
}

// ==========================================
// 2. CONTEXT IMPLEMENTATION
// ==========================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("access_token"),
  );
  const [user, setUser] = useState<UserProfile | null>(() => {
    const storedUser = localStorage.getItem("user_profile");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const isLoading = false;

  useEffect(() => {
    if (token && user && window.location.pathname === "/login") {
      navigate("/dashboard");
    }
  }, [token, user, navigate]);

  const login = (accessToken: string, profile: UserProfile) => {
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

  const updateUserProfile = (profile: UserProfile) => {
    localStorage.setItem("user_profile", JSON.stringify(profile));
    setUser(profile);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
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
