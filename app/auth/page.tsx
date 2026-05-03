"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/ui/NavBar";
import Footer from "@/components/ui/Footer";

export default function AuthPage() {
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [keep, setKeep] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      
      <Navbar/>

      {/* ── Main ── */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-225 rounded-2xl shadow-xl border border-border flex min-h-135 bg-white">

          {/* ── Left panel — illustration ── */}
          <div
            className="hidden md:flex w-[44%] shrink-0 relative flex-col justify-end p-8 rounded-l-2xl overflow-hidden"
            style={{
              background: "linear-gradient(160deg, oklch(0.35 0.12 260) 0%, oklch(0.20 0.08 260) 100%)",
            }}
          >
            {/* Abstract blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-white/5" />
              <div className="absolute top-1/3 -right-20 w-48 h-48 rounded-full bg-white/5" />
              <div className="absolute bottom-20 left-10 w-32 h-32 rounded-full bg-white/5" />
            </div>

            {/* Decorative figures (CSS-only illustration) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
              <svg viewBox="0 0 300 320" className="w-64 h-64 opacity-20" fill="white">
                <circle cx="110" cy="80" r="30" />
                <rect x="80" y="115" width="60" height="80" rx="10" />
                <circle cx="190" cy="100" r="24" />
                <rect x="164" y="130" width="52" height="70" rx="10" />
                <rect x="60" y="220" width="180" height="12" rx="6" />
                <rect x="80" y="244" width="140" height="8" rx="4" />
                <rect x="100" y="262" width="100" height="8" rx="4" />
              </svg>
            </div>

            {/* Bottom copy */}
            <div className="relative z-10">
              <h2 className="text-2xl font-bold text-white leading-snug mb-2">
                Master your subjects<br />with cognitive ease.
              </h2>
              <p className="text-sm text-blue-200 leading-relaxed">
                Join 50,000+ learners finding their flow through personalized quizzes and real-time feedback.
              </p>
            </div>
          </div>

          {/* ── Right panel — form ── */}
          <div className="flex-1 flex flex-col justify-center px-8 py-10 rounded-r-2xl overflow-visible">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-blue mb-1">
              {tab === "login" ? "Welcome back" : "Get started"}
            </p>
            <h1 className="text-xl font-bold text-brand-navy mb-1">
              {tab === "login" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-sm text-slate-400 mb-6">
              {tab === "login"
                ? "Enter your details to access your dashboard."
                : "Fill in the details below to join Vortuiz."}
            </p>

            {/* ── Tab switcher ── */}
            <div className="relative flex bg-slate-100 rounded-xl p-1 mb-6">
              {/* Sliding pill */}
              <div
                className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm transition-transform duration-300 ease-in-out"
                style={{ transform: tab === "login" ? "translateX(0)" : "translateX(100%)" }}
              />
              {(["login", "signup"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`relative z-10 flex-1 py-2 text-sm font-semibold rounded-lg transition-colors duration-200 ${
                    tab === t ? "text-brand-navy" : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {t === "login" ? "Login" : "Sign Up"}
                </button>
              ))}
            </div>

            {/* ── SSO buttons ── */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <Button
                variant="outline"
                className="gap-2 text-sm font-medium border-border hover:bg-slate-50"
              >
                {/* Google icon */}
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </Button>
              <Button
                variant="outline"
                className="gap-2 text-sm font-medium border-border hover:bg-slate-50"
              >
                {/* Microsoft icon */}
                <svg className="h-4 w-4" viewBox="0 0 21 21">
                  <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
                  <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
                  <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
                  <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
                </svg>
                Microsoft
              </Button>
            </div>

            {/* ── Divider ── */}
            <div className="relative flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-border" />
              <span className="text-[11px] font-semibold tracking-widest text-slate-400 uppercase">
                or continue with email
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* ── Form fields ── */}
            <div className="transition-all duration-300 ease-in-out">
              {/* Signup-only: name row — uses grid-rows trick so overflow stays visible */}
              <div
                className="grid transition-all duration-300 ease-in-out"
                style={{ gridTemplateRows: tab === "signup" ? "1fr" : "0fr", marginBottom: tab === "signup" ? "1rem" : "0", opacity: tab === "signup" ? 1 : 0 }}
              >
              <div className="overflow-visible min-h-0">
              <div
                className="grid grid-cols-2 gap-3 pb-px"
                style={{ pointerEvents: tab === "signup" ? "auto" : "none" }}
              >
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    First Name
                  </Label>
                  <Input placeholder="John" className="h-10 text-sm border-border focus-visible:ring-brand-blue" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Last Name
                  </Label>
                  <Input placeholder="Smith" className="h-10 text-sm border-border focus-visible:ring-brand-blue" />
                </div>
              </div>
              </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5 mb-4">
                <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Email Address
                </Label>
                <Input
                  type="email"
                  placeholder="name@company.com"
                  className="h-10 text-sm border-border focus-visible:ring-brand-blue"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5 mb-4">
                <div className="flex items-center justify-between">
                  <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Password
                  </Label>
                  {tab === "login" && (
                    <a href="#" className="text-xs font-semibold text-brand-blue hover:underline">
                      Forgot password?
                    </a>
                  )}
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder={tab === 'login' ? "••••••••" : "Create password"}
                    className="h-10 text-sm border-border focus-visible:ring-brand-blue pr-10 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Signup-only: confirm password */}
              <div
                className="grid transition-all duration-300 ease-in-out"
                style={{ gridTemplateRows: tab === "signup" ? "1fr" : "0fr", marginBottom: tab === "signup" ? "1rem" : "0", opacity: tab === "signup" ? 1 : 0 }}
              >
              <div className="overflow-visible min-h-0">
              <div
                className="space-y-1.5 pb-px"
                style={{ pointerEvents: tab === "signup" ? "auto" : "none" }}
              >
                <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Re-enter password"
                    className="h-10 text-sm border-border focus-visible:ring-brand-blue pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              </div>
              </div>

              {/* Keep logged in */}
              {tab === "login" && (
                <div className="flex items-center gap-2 mb-5">
                  <Checkbox
                    id="keep"
                    checked={keep}
                    onCheckedChange={(v) => setKeep(!!v)}
                    className="border-slate-300 data-[state=checked]:bg-brand-navy data-[state=checked]:border-brand-navy"
                  />
                  <label htmlFor="keep" className="text-sm text-slate-500 cursor-pointer select-none">
                    Keep me logged in for 30 days
                  </label>
                </div>
              )}
            </div>

            {/* ── Submit ── */}
            <Button asChild className="w-full h-11 bg-brand-navy hover:bg-hover:bg-brand-bluete font-semibold text-sm rounded-xl transition-colors mt-1">
              <Link href={'/student/dashboard'}>{tab === "login" ? "Log in to Vortuiz" : "Create Account"}</Link>
            </Button>

            {/* ── Footer link ── */}
            <p className="text-center text-sm text-slate-400 mt-5">
              {tab === "login" ? (
                <>
                  New to Vortuiz?{" "}
                  <button
                    onClick={() => setTab("signup")}
                    className="font-semibold text-brand-navy hover:underline"
                  >
                    Create an account
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    onClick={() => setTab("login")}
                    className="font-semibold text-brand-navy hover:underline"
                  >
                    Log in
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </main>

      <Footer/>
    </div>
  );
}