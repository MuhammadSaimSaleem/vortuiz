'use client'

import { Suspense } from "react";
import AuthForm from "./AuthForm";
import Navbar from "@/components/ui/NavBar";
import Footer from "@/components/ui/Footer";

export default function AuthPage() {
  return (
    
    <div className="min-h-screen flex flex-col bg-surface">
      <Navbar />

      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-surface">
          <p className="text-slate-500 font-medium animate-pulse">Loading authentication...</p>
        </div>
      }>
        <AuthForm />
      </Suspense>

      <Footer />
    </div>
  );
}