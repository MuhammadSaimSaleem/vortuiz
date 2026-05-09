"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUserRole } from "@/contexts/UserRoleContext";
import {
  AlignJustify,
  BarChart2,
  BookOpen,
  BookText,
  Box,
  HelpCircle,
  LogOut,
  PencilLine,
  Star,
} from "lucide-react";
import Logo from "./Logo";
import { createClient } from "@/lib/supabase/client";

const teacherNavItems = [
  { icon: AlignJustify, label: "Dashboard", href: "/teachers/dashboard" },
  { icon: BookOpen, label: "View Quiz", href: "/teachers/quiz/view" },
  { icon: PencilLine, label: "Quiz Builder", href: "/teachers/quiz/create" },
  { icon: BookText, label: "Student Directory", href: "/teachers/student-directory" },
  { icon: BarChart2, label: "Performance Analytics", href: "/teachers/analytics" },
  { icon: Box, label: "Resource Library", href: "/teachers/resource-library" },
];

const studentNavItems = [
  { icon: AlignJustify, label: "Dashboard", href: "/students/dashboard" },
  { icon: BookOpen, label: "View Quiz", href: "/students/quiz/view" },
  { icon: BarChart2, label: "Performance Analytics", href: "/students/analytics" },
  { icon: Box, label: "Resource Library", href: "/students/resource-library" },
  { icon: Star, label: "Achievements", href: "/students/achievements" },
];

export function Sidebar() {
  const { role, toggleRole } = useUserRole();
  const pathname = usePathname();

  const navItems = role === "teacher" ? teacherNavItems : studentNavItems;

  const router = useRouter();

  const handleLogoClick = () => {
    const nextRole = role === "teacher" ? "student" : "teacher";
    
    toggleRole(); 
    
    router.push(`/${nextRole}s/dashboard`);
  };

  const handleLogOut = async () => {
    const supabase = createClient();

    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error("Error logging out:", error.message);
    } else {
      // 2. Redirect the user to the login page or home
      router.push("/auth");
      router.refresh(); // Clears any server-side cached data
    }
  }

  return (
    <aside className="inset-y-0 left-0 z-20 w-full h-full md:w-64 flex flex-col border-r border-slate-200 bg-white">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 border-b border-slate-100 px-4">
        <button onClick={handleLogoClick} type="button">
          <Logo />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 mt-6 space-y-0.5 p-3">
        {navItems.map(({ icon: Icon, label, href }) => {
          const isActive = label === "Dashboard" 
          ? pathname === href 
          : pathname.startsWith(href);

          return (
            <Link
              key={label}
              href={href}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-50 text-[#1e3a6e] border-l-2 border-[#1e3a6e] rounded-l-none"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-slate-100 p-3 space-y-0.5">
        <Link
          href="/help"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700"
        >
          <HelpCircle className="h-4 w-4" />
          Help Center
        </Link>
        <button 
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50"
          onClick={handleLogOut}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}