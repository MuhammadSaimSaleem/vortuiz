'use client'

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart2,
  Pencil,
  Play,
  Users,
  Zap,
  LayoutDashboard,
} from "lucide-react";
import Navbar from "@/components/ui/NavBar";
import Footer from "@/components/ui/Footer";

// ─── Hooks ────────────────────────────────────────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function FadeIn({ children, delay = 0, className = "" }: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  const { ref, inView } = useInView();
  return (
    <div ref={ref} className={className} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? "translateY(0)" : "translateY(24px)",
      transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

// ─── Stats ────────────────────────────────────────────────────────────────────
const stats = [
  { value: "50k+",  label: "TEACHERS ACTIVE"  },
  { value: "12M",   label: "QUIZZES TAKEN"     },
  { value: "99.9%", label: "UPTIME RECORD"     },
  { value: "4.9/5", label: "USER RATING"       },
];

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="max-w-6xl mx-auto px-6 pt-16 pb-20 grid md:grid-cols-2 gap-10 items-center">
      <div>
        <Badge className="mb-5 bg-brand-light text-brand-blue border-0 text-[11px] font-semibold uppercase tracking-widest px-3 py-1 rounded-full">
          Educator Portal
        </Badge>
        <h1 className="text-4xl md:text-5xl font-bold text-brand-navy leading-[1.12] tracking-tight mb-5">
          Empower Your Classroom.
        </h1>
        <p className="text-slate-500 text-base leading-relaxed mb-8 max-w-md">
          Transform the way you evaluate student performance. Vortuiz provides professional-grade tools to design, deploy, and analyze assessments with absolute precision and ease.
        </p>
        <div className="flex flex-wrap items-center gap-3 mb-7">
          <Button asChild className="bg-brand-navy hover:bg-brand-blue text-white font-semibold px-5 h-11 rounded-xl transition-colors text-sm gap-2">
            <Link href="/dashboard">
              <LayoutDashboard className="h-4 w-4" />
              Go to Dashboard
            </Link>
          </Button>
          <Button asChild variant="outline" className="border-border text-slate-600 font-semibold px-5 h-11 rounded-xl text-sm gap-2 hover:bg-slate-50">
            <Link href="/auth">
              <Play className="h-3.5 w-3.5 fill-current" />
              Watch Demo
            </Link>
          </Button>
        </div>
      </div>

      {/* Right — UI illustration */}
      <div className="relative">
        <div className="rounded-2xl overflow-hidden bg-teal-600/80 aspect-4/3 flex items-end justify-center relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-28 h-28 rounded-full bg-teal-300/40 flex items-center justify-center">
              <Users className="h-16 w-16 text-white/60" />
            </div>
          </div>
          <div className="absolute bottom-6 right-6 left-16 bg-white/95 rounded-xl p-3 shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-2 w-2 rounded-full bg-red-400" />
              <div className="h-2 w-2 rounded-full bg-amber-400" />
              <div className="h-2 w-2 rounded-full bg-green-400" />
              <span className="text-[9px] text-slate-400 ml-1">Vortuiz</span>
            </div>
            <div className="space-y-1.5">
              {["", "", ""].map((_, i) => (
                <div key={i} className={`rounded h-2 ${i === 0 ? "bg-brand-navy w-3/4" : i === 1 ? "bg-slate-200 w-1/2" : "bg-slate-100 w-2/3"}`} />
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <div className="flex-1 rounded-lg bg-teal-100 p-2">
                <div className="h-1.5 bg-teal-400 rounded w-3/4 mb-1" />
                <div className="h-1.5 bg-teal-200 rounded w-1/2" />
              </div>
              <div className="flex-1 rounded-lg bg-slate-50 p-2">
                <div className="h-1.5 bg-slate-300 rounded w-2/3 mb-1" />
                <div className="h-1.5 bg-slate-200 rounded w-1/3" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Stats bar ────────────────────────────────────────────────────────────────
function StatsBar() {
  return (
    <section className="border-y border-border bg-surface py-10">
      <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {stats.map(({ value, label }) => (
          <div key={label}>
            <p className="text-3xl font-bold text-brand-navy">{value}</p>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mt-1">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Mockup card ─────────────────────────────────────────────────────────────
function QuizBuilderMockup() {
  return (
    <div className="mt-4 rounded-xl border border-border bg-slate-50 p-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-brand-navy">Statistics</span>
        <div className="h-4 w-16 bg-slate-200 rounded" />
      </div>
      {["Databases", "Functions"].map((label, i) => (
        <div key={label} className="flex items-center gap-2">
          <div className={`h-3 w-3 rounded-full border-2 ${i === 1 ? "border-brand-blue bg-brand-blue" : "border-slate-300"}`} />
          <span className="text-[11px] text-slate-600">{label}</span>
        </div>
      ))}
      <div className="flex items-center gap-2">
        <div className="h-3 w-3 rounded-full border-2 border-slate-300" />
        <span className="text-[11px] text-slate-400">Choose template</span>
      </div>
    </div>
  );
}

// ─── Chart mockup ─────────────────────────────────────────────────────────────
function ChartMockup() {
  const bars = [40, 65, 55, 80, 70, 90, 75];
  return (
    <div className="rounded-2xl bg-teal-600 p-5 h-full flex flex-col justify-end min-h-45">
      <div className="flex items-end gap-2 h-24">
        {bars.map((h, i) => (
          <div key={i} className="flex-1 rounded-t-sm bg-white/30 transition-all"
            style={{ height: `${h}%` }} />
        ))}
      </div>
      <div className="mt-3 rounded-lg bg-white/10 border border-white/20 p-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-white/70 font-medium">Class Average</span>
          <span className="text-[10px] text-white font-bold">73%</span>
        </div>
        <div className="h-1.5 bg-white/20 rounded-full">
          <div className="h-1.5 bg-white rounded-full w-3/4" />
        </div>
      </div>
    </div>
  );
}

// ─── Features ─────────────────────────────────────────────────────────────────
function Features() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20">
      <FadeIn className="text-center mb-14">
        <Badge className="mb-4 bg-brand-light text-brand-blue border-0 text-[11px] font-semibold uppercase tracking-widest px-3 py-1 rounded-full">
          Why Vortuiz
        </Badge>
        <h2 className="text-3xl md:text-4xl font-bold text-brand-navy leading-tight">
          Built for the modern educator
        </h2>
      </FadeIn>

      <div className="grid md:grid-cols-3 gap-6">
        <FadeIn delay={0} className="rounded-2xl border border-border bg-white p-7 flex flex-col">
          <div className="h-9 w-9 rounded-xl bg-brand-light flex items-center justify-center mb-5">
            <Pencil className="h-4 w-4 text-brand-blue" />
          </div>
          <h3 className="font-bold text-brand-navy text-base mb-2">Smart Quiz Builder</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Create professional assessments in minutes with our intuitive drag-and-drop builder. Support for MCQ, short answer, essay, and more.
          </p>
          <QuizBuilderMockup />
        </FadeIn>

        <FadeIn delay={80} className="rounded-2xl border border-border bg-white p-7 flex flex-col">
          <div className="h-9 w-9 rounded-xl bg-brand-light flex items-center justify-center mb-5">
            <Zap className="h-4 w-4 text-brand-blue" />
          </div>
          <h3 className="font-bold text-brand-navy text-base mb-2">Instant Grading</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Automate the tedious work. Get instant results for objective questions and focus your energy on providing qualitative feedback for long-form answers.
          </p>
        </FadeIn>

        <FadeIn delay={80} className="rounded-2xl border border-border bg-white p-7 flex flex-col">
          <div className="h-9 w-9 rounded-xl bg-brand-light flex items-center justify-center mb-5">
            <BarChart2 className="h-4 w-4 text-brand-blue" />
          </div>
          <h3 className="font-bold text-brand-navy text-base mb-2">Real-time Analytics</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Monitor student progress live. Identify knowledge gaps with heatmaps and detailed item analysis. Understand exactly where your classroom stands before the final exam.
          </p>
        </FadeIn>

        <FadeIn delay={160}>
          <ChartMockup />
        </FadeIn>
      </div>
    </section>
  );
}

// ─── CTA ─────────────────────────────────────────────────────────────────────
function CTA() {
  return (
    <section className="bg-brand-navy py-24 px-6">
      <FadeIn>
        <div className="max-w-2xl mx-auto text-center relative">
          <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-44 h-44 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-brand-blue/20 blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-4">
              Ready to empower your classroom?
            </h2>
            <p className="text-blue-200 text-sm leading-relaxed mb-9 max-w-md mx-auto">
              Join thousands of educators who are elevating their teaching with Vortuiz&apos;s flow-optimized assessment tools.
            </p>
            <Button asChild className="bg-white text-brand-navy hover:bg-blue-50 font-bold px-8 h-12 rounded-xl text-sm transition-colors">
              <Link href="/auth">Create Teacher Account</Link>
            </Button>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TeachersPage() {
  return (
    <div className="min-h-screen bg-surface text-foreground flex flex-col justify-between">
      <div>
        <Navbar />
        <Hero />
        <StatsBar />
        <Features />
        <CTA />
      </div>
      <Footer />
    </div>
  );
}