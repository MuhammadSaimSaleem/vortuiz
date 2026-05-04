"use client";

import { useState } from "react";
import Navbar from "@/components/ui/NavBar";
import Footer from "@/components/ui/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, BookOpen } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
} from "@/components/ui/collapsible";

export default function RolesPage() {
  const [role, setRole] = useState<"teacher" | "student" | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleRoleSelect = (selectedRole: "teacher" | "student") => {
    setRole(selectedRole);
    setIsOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="p-8">
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
                  <h3 className="text-lg font-semibold mb-4 capitalize">{role} Details</h3>
                  <form className="grid gap-4 ">
                    {role === 'teacher' ? (
                      <div className="grid gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="space-y-2">
                          <Label htmlFor="organization">School or Institution</Label>
                          <Input id="organization" placeholder="e.g. The Universty of Faisalabad" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="department">Department</Label>
                            <Input id="department" placeholder="e.g. Science" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="class-size">Avg. Class Size</Label>
                            <Input id="class-size" type="number" placeholder="30" />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="subject">Primary Subject</Label>
                          <Input id="subject" placeholder="e.g. Applied Physics" />
                        </div>
                      </div>
                    ) : (
                      <div className="grid gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="space-y-2">
                          <Label htmlFor="student-id">Student ID / Roll Number</Label>
                          <Input id="student-id" placeholder="e.g. STU-12345" />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="grade-level">Year / Grade Level</Label>
                          <Input id="grade-level" placeholder="e.g. Semester 6 or Class 10" />
                        </div>

                        <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-200 mt-2">
                          <Label htmlFor="join-code" className="text-brand-navy font-bold">Have a Class Code?</Label>
                          <p className="text-[11px] text-slate-500 mb-2">Enter the code provided by your teacher to join a class instantly.</p>
                          <Input 
                            id="join-code" 
                            placeholder="X7-R92-P" 
                            className="uppercase font-mono tracking-widest bg-white"
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col items-center mt-4">
                      <Button 
                        className="w-full max-w-70 bg-brand-navy text-white h-12 rounded-2xl font-bold shadow-md hover:scale-[1.02] active:scale-[0.98] transition-transform"
                      >
                        Finish Onboarding
                      </Button>
                      <p className="text-slate-400 text-[11px] mt-3">
                        By clicking finish, you agree to our Terms of Service.
                      </p>
                  </div>
                  </form>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}