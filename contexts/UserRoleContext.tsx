"use client";

import { UserRole } from "@/lib/data";
import { createContext, useContext, useState, ReactNode } from "react";

interface UserRoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  toggleRole: () => void;
  isTeacher: boolean;
  isStudent: boolean;
}

const UserRoleContext = createContext<UserRoleContextType | undefined>(undefined);

export const UserRoleProvider = ({ children }: { children: ReactNode }) => {
  // Default to student for safety, or fetch from your Supabase auth session
  const [role, setRole] = useState<UserRole>("student");

  const isTeacher = role === "teacher";
  const isStudent = role === "student";

  const toggleRole = () => {
    setRole((prev) => (prev === "teacher" ? "student" : "teacher"));
  };

  return (
    <UserRoleContext.Provider value={{ role, setRole, toggleRole, isTeacher, isStudent }}>
      {children}
    </UserRoleContext.Provider>
  );
};

export const useUserRole = () => {
  const context = useContext(UserRoleContext);
  if (context === undefined) {
    throw new Error("useUserRole must be used within a UserRoleProvider");
  }
  return context;
};