"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useTheme } from "next-themes";
import { Button } from "./button";
import Link from "next/link";
import Logo from "./Logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  LogOut,
  Settings,
  Sun,
  Moon,
  Laptop,
} from "lucide-react";
import { useProfile } from "@/contexts/ProfileContext";
import { Profile } from "@/lib/data";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Features", href: "/features" },
  { label: "Teachers", href: "/teachers" },
  { label: "Students", href: "/students" },
  { label: "Pricing", href: "/pricing" },
];

// ─── Profile Dropdown ─────────────────────────────────────────────────────────
function ProfileMenu({ profile, onLogout }: { profile: Profile; onLogout: () => void }) {
  const { setTheme } = useTheme();
  const avatarUrl = profile.avatar_url ?? undefined;
  const email = profile.email ?? "educator@vortuiz.com";
  const initial = (profile.full_name?.charAt(0) ?? email.charAt(0)).toUpperCase();
  const role = profile.role;

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-9 w-9 rounded-full select-none focus-visible:ring-0"
        >
          <Avatar className="h-9 w-9 border border-border">
            <AvatarImage src={avatarUrl} alt="Profile picture" />
            <AvatarFallback className="bg-brand-navy text-white text-xs font-semibold">
              {initial}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        className="w-56 mt-2" 
        align="end" 
        forceMount
      >
        {/* Email */}
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-xs font-medium leading-none text-slate-400">
              Signed in as
            </p>
            <p className="text-sm font-medium leading-none truncate text-brand-navy max-w-47.5">
              {email}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Dashboard */}
        <DropdownMenuItem asChild className="cursor-pointer gap-2">
          <Link href={`/${role}s/dashboard`}>
            <LayoutDashboard className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </DropdownMenuItem>

        {/* Settings */}
        <DropdownMenuItem asChild className="cursor-pointer gap-2">
          <Link href="/settings">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Theme */}
        <DropdownMenuLabel className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1.5">
          Theme
        </DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className="cursor-pointer gap-2 pl-4"
        >
          <Sun className="h-3.5 w-3.5" />
          <span className="text-sm">Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className="cursor-pointer gap-2 pl-4"
        >
          <Moon className="h-3.5 w-3.5" />
          <span className="text-sm">Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className="cursor-pointer gap-2 pl-4"
        >
          <Laptop className="h-3.5 w-3.5" />
          <span className="text-sm">System</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Log out */}
        <DropdownMenuItem
          onClick={onLogout}
          className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 gap-2"
        >
          <LogOut className="h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
export default function Navbar() {
  const { profile, isLoading } = useProfile();
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Scroll shadow
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);


  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-border"
          : "bg-white border-b border-border"
      }`}
    >
      <div className="max-w-300 mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/"><Logo /></Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-7 text-sm text-slate-500 font-medium">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="hover:text-brand-navy transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Auth controls */}
        <div className="flex items-center gap-3">
          {pathname !== "/auth" && !isLoading && (
            profile ? (
              <>
                <Button
                  asChild
                  size="sm"
                  className="hidden sm:flex bg-brand-navy hover:bg-brand-blue text-white font-semibold rounded-lg text-sm gap-1.5 h-9 px-4 transition-colors"
                >
                  {/* Safely fallback to /dashboard if role hasn't loaded yet */}
                  <Link href={`/${profile.role}s/dashboard`}>
                    <LayoutDashboard className="h-3.5 w-3.5" />
                    Dashboard
                  </Link>
                </Button>
                <ProfileMenu profile={profile} onLogout={handleLogout} />
              </>
            ) : (
              <>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-sm font-medium text-slate-600"
                >
                  <Link href="/auth?mode=login">Login</Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  className="bg-brand-navy hover:bg-brand-blue text-white text-sm font-semibold rounded-lg px-3 py-4 transition-colors"
                >
                  <Link href="/auth?mode=signup">Get Started</Link>
                </Button>
              </>
            )
          )}
        </div>
      </div>
    </header>
  );
}