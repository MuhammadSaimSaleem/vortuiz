"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, BookOpen } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import Navbar from "@/components/ui/NavBar";
import Footer from "@/components/ui/Footer";
import { createClient } from "@/lib/supabase/client";

export default function AuthPage() {
  const [role, setRole] = useState<"teacher" | "student" | null>(null);
  const [isOpen, setIsOpen] = useState(false);
    
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [step, setStep] = useState<"1" | "2">("1");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [keep, setKeep] = useState(false);

  const labelRef = useRef<HTMLLabelElement>(null);

  useEffect(() => {
    if (step === "2") {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
    }
  }, [step])

  const handleRoleSelect = (selectedRole: "teacher" | "student") => {
    setRole(selectedRole);
    setIsOpen(true);

    setTimeout(() => {
      labelRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }, 100);
  };

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirm_password: "",
    organization: "",
    department: "",
    subject: "",
    class_size: "",
    student_id: "",
    grade_level: "",
    join_code: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handlePrimaryAction = async () => {

    if (tab === "signup") {
      setStep("2");
      setIsOpen(false);
      return;
    }

    window.location.href = "/students/dashboard";
  };

  const handleCompleteRegistration = async () => {
    const supabase = createClient(); // Use your client helper

    // 1. Get the current logged-in user
    const { data: { user } } = await supabase.auth.getUser();

    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('id')
      .eq('name', formData.organization)
      .maybeSingle();

    if(orgError){
      console.log("Error selecting org:", orgError.message);
      return;
    }

    let finalOrgId;

    // 2. If it doesn't exist, create it
    if (!org) {
      const { data: newOrg, error: createError } = await supabase
        .from('organizations')
        .insert({ name: formData.organization })
        .select()
        .maybeSingle();
      
      if (createError) {
          console.error("Error creating org:", createError.message);
          return;
      }
      finalOrgId = newOrg.id;
    } else {
      finalOrgId = org.id;
    }

    if(!user){
      const { error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (signUpError) {
        console.error("Auth Error:", signUpError.message);
        return;
      } else {
        return;
      }
    }

    // 2. Prepare the data based on the role
    const profileUpdate = {
      id: user.id,
      role: role, // 'teacher' or 'student' from your selection
      name: `${formData.first_name} ${formData.last_name}`,
      organization_id: finalOrgId,
      email: formData.email,
      department: role === 'teacher' ? formData.department : null,
      subject: role === 'teacher' ? formData.subject : null,
      class_size: formData.class_size,
      student_id: formData.student_id,
      grade_level: formData.grade_level,
    };

    // 3. Upsert into Supabase
    const { error } = await supabase
      .from('profiles')
      .upsert(profileUpdate);

    if (error) {
      console.error("Error saving profile:", error.message);
    } else {
      // 4. Redirect to the correct dashboard
      window.location.href = `/${role}/dashboard`;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      
      <Navbar/>

      {/* ── Main ── */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-225 rounded-2xl shadow-xl border border-border flex bg-white transition-all duration-300">

          {step === "1" ? (
            <>
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
                  onClick={() => alert('Coming Soon')}
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
                  onClick={() => alert('Coming Soon')}
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
                    <Input
                      id="first_name"
                      placeholder="John"
                      className="h-10 text-sm border-border focus-visible:ring-brand-blue"
                      value={formData.first_name}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      Last Name
                    </Label>
                    <Input
                      id="last_name"
                      placeholder="Smith"
                      className="h-10 text-sm border-border focus-visible:ring-brand-blue"
                      value={formData.last_name}
                      onChange={handleChange}
                    />
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
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    className="h-10 text-sm border-border focus-visible:ring-brand-blue"
                    value={formData.email}
                    onChange={handleChange}
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
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={tab === 'login' ? "••••••••" : "Create password"}
                      className="h-10 text-sm border-border focus-visible:ring-brand-blue pr-10 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                      value={formData.password}
                      onChange={handleChange}
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
                      id="confirm_password"
                      type={showConfirm ? "text" : "password"}
                      placeholder="Re-enter password"
                      className="h-10 text-sm border-border focus-visible:ring-brand-blue pr-10"
                      value={formData.confirm_password}
                      onChange={handleChange}
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
              <Button
                type="button"
                className="w-full h-11 bg-brand-navy hover:bg-brand-blue font-semibold text-sm rounded-xl transition-colors mt-1"
                onClick={handlePrimaryAction}
              >
                {tab === "login" ? "Log in to Vortuiz" : "Create Account"}
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
          </>
          ) : (
            <div className="flex flex-col p-8 w-full animate-in fade-in slide-in-from-top-4">
              
              <div className="text-center mb-10">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Join our community</h1>
                <p className="text-slate-500 mt-2">Select your role to get started with your customized experience.</p>
              </div>

              {/* Role Selection Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card 
                  className={`cursor-pointer transition-all hover:border-primary ${role === 'teacher' ? 'ring-2 ring-primary border-primary' : ''}`}
                  onClick={() => handleRoleSelect('teacher')}
                >
                  <CardHeader className="space-y-1 flex flex-col items-center justify-center text-center">
                    <div className="p-3 bg-primary/10 rounded-full mb-2">
                      <GraduationCap className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-xl">Teacher</CardTitle>
                    <CardDescription>Share your knowledge and manage classrooms.</CardDescription>
                  </CardHeader>
                </Card>

                <Card 
                  className={`cursor-pointer transition-all hover:border-primary ${role === 'student' ? 'ring-2 ring-primary border-primary' : ''}`}
                  onClick={() => handleRoleSelect('student')}
                >
                  <CardHeader className="space-y-1 flex flex-col items-center justify-center text-center">
                    <div className="p-3 bg-primary/10 rounded-full mb-2">
                      <BookOpen className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-xl">Student</CardTitle>
                    <CardDescription>Access resources and track your learning progress.</CardDescription>
                  </CardHeader>
                </Card>
              </div>

              {/* Collapsible Form Section */}
              <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full space-y-2">
                <CollapsibleContent className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="pt-6 border-t border-slate-100">
                    <h3 className="text-lg font-semibold mb-4 capitalize" >{role ?? "Role"} Details</h3>
                    <form className="grid gap-4 ">
                      {role === 'teacher' ? (
                        <div className="grid gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                          <div className="space-y-2">
                            <Label htmlFor="organization" ref={labelRef}>School or Institution</Label>
                            <Input
                              id="organization"
                              placeholder="e.g. The Universty of Faisalabad"
                              value={formData.organization}
                              onChange={handleChange}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="department">Department</Label>
                              <Input
                                id="department"
                                placeholder="e.g. Science"
                                value={formData.department}
                                onChange={handleChange}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="class_size">Avg. Class Size</Label>
                              <Input
                                id="class_size"
                                type="number"
                                placeholder="30"
                                value={formData.class_size}
                                onChange={handleChange}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="subject">Primary Subject</Label>
                            <Input
                              id="subject"
                              placeholder="e.g. Applied Physics"
                              value={formData.subject}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="grid gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                          <div className="space-y-2">
                            <Label htmlFor="student_id" ref={labelRef}>Student ID / Roll Number</Label>
                            <Input
                              id="student_id"
                              placeholder="e.g. STU-12345"
                              value={formData.student_id}
                              onChange={handleChange}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="grade_level">Year / Grade Level</Label>
                            <Input
                              id="grade_level"
                              placeholder="e.g. Semester 6 or Class 10"
                              value={formData.grade_level}
                              onChange={handleChange}
                            />
                          </div>

                          <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-200 mt-2">
                            <Label htmlFor="join_code" className="text-brand-navy font-bold">Have a Class Code?</Label>
                            <p className="text-[11px] text-slate-500 mb-2">Enter the code provided by your teacher to join a class instantly.</p>
                            <Input
                              id="join_code"
                              placeholder="X7-R92-P"
                              className="uppercase font-mono tracking-widest bg-white"
                              value={formData.join_code}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex flex-col items-center mt-4">
                        <div className="flex gap-4 items-center justify-center">
                          <Button
                            type="button"
                            variant={"outline"}
                            className="w-full max-w-70 h-12 rounded-2xl font-bold shadow-md hover:scale-[1.02] active:scale-[0.98] transition-transform"
                            onClick={() => setStep('1')}
                          >
                            Go Back
                          </Button>
                          <Button
                            type="button"
                            className="w-full max-w-70 bg-brand-navy text-white h-12 rounded-2xl font-bold shadow-md hover:scale-[1.02] active:scale-[0.98] transition-transform"
                            onClick={handleCompleteRegistration}
                          >
                            Finish Onboarding
                          </Button>
                          
                        </div>
                        <p className="text-slate-400 text-[11px] mt-3">
                          By clicking finish, you agree to our Terms of Service.
                        </p>
                    </div>
                    </form>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          )}
        </div>
      </main>

      <Footer/>
    </div>
  );
}