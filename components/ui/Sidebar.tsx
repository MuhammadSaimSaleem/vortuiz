"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useUserRole } from "@/contexts/UserRoleContext";
import {
  AlignJustify,
  BarChart2,
  BookOpen,
  BookText,
  Box,
  HelpCircle,
  LogOut,
  Notebook,
  Star,
  TrendingUp,
  Zap,
} from "lucide-react";

// Helper to convert label to URL-friendly path
const getPath = (label: string) => {
  if (label === "Dashboard") return "/dashboard";
  if (label === "Quiz Builder") return "/quiz/create";
  return `/${label.toLowerCase().replace(/\s+/g, "-")}`;
};

const teacherNavItems = [
  { icon: AlignJustify, label: "Dashboard" },
  { icon: BookOpen, label: "Quiz Builder" },
  { icon: BookText, label: "Student Directory" },
  { icon: BarChart2, label: "Analytics" },
  { icon: Box, label: "Resource Library" },
];

const studentNavItems = [
  { icon: AlignJustify, label: "Dashboard" },
  { icon: BookOpen, label: "Take Quiz" },
  { icon: Notebook, label: "Study Materials" },
  { icon: TrendingUp, label: "Performance" },
  { icon: Star, label: "Achievements" },
];

export function Sidebar() {
  const { role, toggleRole } = useUserRole();
  const pathname = usePathname();

  const navItems = role === "teacher" ? teacherNavItems : studentNavItems;

  return (
    <aside className="inset-y-0 left-0 z-20 w-full h-full md:w-64 flex flex-col border-r border-slate-200 bg-white">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 border-b border-slate-100 px-4">
        <Button
          onClick={toggleRole}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1e3a6e]"
        >
          <Zap className="h-4 w-4 text-white" />
        </Button>
        <div>
          <p className="text-lg font-bold text-slate-800 leading-none">Vortuiz</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 mt-6 space-y-0.5 p-3">
        {navItems.map(({ icon: Icon, label }) => {
          const href = getPath(label);
          const isActive = pathname === href;

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
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50">
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}