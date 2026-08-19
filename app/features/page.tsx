"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart2,
  BookOpen,
  ChevronRight,
  EyeOff,
  FolderOpen,
  KeyRound,
  LayoutList,
  LogIn,
  Target,
  Trophy,
  TrendingUp,
  CalendarClock,
} from "lucide-react";
import Navbar from "@/components/ui/NavBar";
import Footer from "@/components/ui/Footer";

// ─── Hooks ────────────────────────────────────────────────────────────────────
function useInView(threshold = 0.12) {
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
      transform: inView ? "translateY(0)" : "translateY(22px)",
      transition: `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

// ─── Quiz builder mockup ──────────────────────────────────────────────────────
function QuizBuilderMockup() {
  const rows = [
    "Databases",
    "Functions",
    "Conditions",
    "Class/instructions",
    "Timers",
    "Controls",
    "Conditions",
    "Circuit",
  ];
  return (
    <div className="mt-5 rounded-xl overflow-hidden border border-border shadow-sm bg-white">
      {/* Teal header bar */}
      <div className="h-8 bg-teal-600 flex items-center px-3 gap-1.5">
        {["bg-red-400","bg-amber-400","bg-green-400"].map(c => (
          <div key={c} className={`h-2 w-2 rounded-full ${c}`} />
        ))}
      </div>
      {/* Content split */}
      <div className="flex">
        {/* Left teal sidebar */}
        <div className="w-20 bg-teal-500/80 shrink-0" />
        {/* Right list */}
        <div className="flex-1 py-2 divide-y divide-slate-100">
          {rows.map((r, i) => (
            <div key={i} className="flex items-center justify-between px-3 py-1.5">
              <span className="text-[10px] text-slate-600">{r}</span>
              <div className="h-1.5 w-10 bg-slate-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Analytics card (dark) ────────────────────────────────────────────────────
function AnalyticsCard() {
  return (
    <div className="rounded-2xl bg-brand-navy p-6 flex flex-col h-full text-white">
      <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center mb-4">
        <BarChart2 className="h-4 w-4 text-white" />
      </div>
      <h3 className="font-bold text-white text-base mb-2">Real-time Analytics</h3>
      <p className="text-sm text-blue-200 leading-relaxed flex-1">
        Instant heatmaps on class performance. Identify &ldquo;Most Missed Questions&rdquo; and pivot your lesson plan mid-session.
      </p>
      {/* Progress bar widget */}
      <div className="mt-6 rounded-xl bg-white/10 border border-white/15 px-4 py-3">
        <p className="text-[9px] font-bold uppercase tracking-widest text-blue-300 mb-2">Active Class Progress</p>
        <div className="h-2 rounded-full bg-white/20 overflow-hidden">
          <div className="h-full w-[68%] rounded-full bg-white/70" />
        </div>
        <p className="text-[10px] text-blue-300 mt-1 text-right">68%</p>
      </div>
    </div>
  );
}

// ─── Learner feature row ──────────────────────────────────────────────────────
const learnerFeatures = [
  {
    icon: <EyeOff className="h-5 w-5" />,
    iconBg: "bg-slate-100 text-slate-500",
    title: "Distraction-Free Interface",
    desc: "A minimalist UI that removes peripheral visual noise, allowing students to focus entirely on the question at hand.",
  },
  {
    icon: <Target className="h-5 w-5" />,
    iconBg: "bg-brand-light text-brand-blue",
    title: "Mastery Mode",
    desc: "An adaptive engine that re-surfaces difficult concepts using spaced repetition principles for long-term retention.",
  },
  {
    icon: <Trophy className="h-5 w-5" />,
    iconBg: "bg-amber-50 text-amber-500",
    title: "Achievements & Badges",
    desc: "Gamified milestones that reward consistency and improvement, turning learning into a rewarding journey.",
  },
  {
    icon: <TrendingUp className="h-5 w-5" />,
    iconBg: "bg-emerald-50 text-emerald-600",
    title: "Performance History",
    desc: "Detailed personal logs with growth trend visualizations. Watch your scores climb as you master new modules.",
  },
];

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="max-w-3xl mx-auto px-6 pt-16 pb-20 text-center">
      <Badge className="mb-6 bg-brand-light text-brand-blue border-0 text-[11px] font-semibold uppercase tracking-widest px-3 py-1 rounded-full">
        All-in-One Assessment Platform
      </Badge>
      <h1 className="text-4xl md:text-5xl font-bold text-brand-navy leading-[1.12] tracking-tight mb-5">
        Designed for the pursuit of flow in learning.
      </h1>
      <p className="text-slate-500 text-base leading-relaxed mb-9 max-w-lg mx-auto">
        Empowering educators with precision tools and students with an environment built for deep focus and long-term mastery.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button asChild className="bg-brand-navy hover:bg-brand-blue text-white font-semibold px-6 h-11 rounded-xl transition-colors text-sm gap-2">
          <Link href="/auth">
            Start Teaching Now <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
        <Button asChild variant="outline" className="border-border text-slate-600 font-semibold px-6 h-11 rounded-xl text-sm gap-2 hover:bg-slate-50">
          <Link href="/take-quiz">
            <LogIn className="h-4 w-4" /> Join a Quiz
          </Link>
        </Button>
      </div>
    </section>
  );
}

// ─── Teacher features ─────────────────────────────────────────────────────────
function TeacherFeatures() {
  return (
    <section className="max-w-6xl mx-auto px-6 pb-24">
      <FadeIn className="mb-10">
        <h2 className="text-2xl font-bold text-brand-dark">Precision Engineering for Teachers</h2>
        <p className="text-sm text-slate-400 mt-2 max-w-sm leading-relaxed">
          Streamline your workflow with tools designed for high-impact pedagogy and departmental collaboration.
        </p>
      </FadeIn>

      {/* Row 1: Quiz Builder (wide) + Analytics (dark) */}
      <div className="grid md:grid-cols-3 gap-5 mb-5">
        {/* Intuitive Quiz Builder — spans 2 */}
        <FadeIn delay={0} className="md:col-span-2 rounded-2xl border border-border bg-white p-7 flex flex-col">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="h-7 w-7 rounded-lg bg-brand-light flex items-center justify-center">
              <LayoutList className="h-3.5 w-3.5 text-brand-blue" />
            </div>
            <h3 className="font-bold text-brand-dark text-base">Intuitive Quiz Builder</h3>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            Our drag-and-drop studio allows for the creation of multi-modal, complex assessments without the technical friction.
          </p>
          <QuizBuilderMockup />
        </FadeIn>

        {/* Real-time Analytics — dark */}
        <FadeIn delay={100}>
          <AnalyticsCard />
        </FadeIn>
      </div>

      {/* Row 2: three equal cards */}
      <div className="grid md:grid-cols-3 gap-5">
        <FadeIn delay={0} className="rounded-2xl border border-border bg-white p-6 flex flex-col gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-brand-light flex items-center justify-center">
              <FolderOpen className="h-3.5 w-3.5 text-brand-blue" />
            </div>
            <h3 className="font-bold text-brand-dark text-sm">Shared Repositories</h3>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            Build collaborative departmental libraries. Maintain consistency across entire grade levels with shared question sets.
          </p>
        </FadeIn>

        <FadeIn delay={80} className="rounded-2xl border border-border bg-white p-6 flex flex-col gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-brand-light flex items-center justify-center">
              <BookOpen className="h-3.5 w-3.5 text-brand-blue" />
            </div>
            <h3 className="font-bold text-brand-dark text-sm">Question Bank</h3>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            Support for MCQs, Fill-in-the-blanks, Audio responses, and Mathematical equations in LaTeX.
          </p>
        </FadeIn>

        <FadeIn delay={160} className="rounded-2xl border border-border bg-white p-6 flex flex-col gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-rose-50 flex items-center justify-center">
              <KeyRound className="h-3.5 w-3.5 text-rose-500" />
            </div>
            <h3 className="font-bold text-brand-dark text-sm">Access Control</h3>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            Unique 6-digit join codes and timed expiration triggers for secure, synchronized exam starts.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}

// ─── Learner features ─────────────────────────────────────────────────────────
function LearnerFeatures() {
  return (
    <section className="bg-slate-50 border-y border-border py-24">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">

        {/* Left — tablet illustration */}
        <FadeIn className="relative">
          <div className="rounded-2xl overflow-hidden bg-linear-to-br from-slate-700 to-slate-900 aspect-4/3 flex items-center justify-center relative">
            {/* Bookshelf background feel */}
            <div className="absolute inset-0 opacity-20"
              style={{ backgroundImage: "repeating-linear-gradient(90deg, rgba(255,255,255,0.1) 0px, rgba(255,255,255,0.1) 8px, transparent 8px, transparent 28px)" }} />
            {/* Tablet */}
            <div className="relative z-10 w-56 h-40 bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden">
              <div className="h-5 bg-brand-navy flex items-center px-2 gap-1">
                {["bg-red-400","bg-amber-400","bg-green-400"].map(c => (
                  <div key={c} className={`h-1.5 w-1.5 rounded-full ${c}`} />
                ))}
              </div>
              <div className="flex-1 p-3 space-y-2">
                <div className="h-2 bg-brand-light rounded w-3/4" />
                <div className="h-2 bg-slate-100 rounded w-1/2" />
                <div className="h-8 bg-teal-50 rounded-lg border border-teal-200 mt-2" />
                <div className="h-2 bg-slate-100 rounded w-2/3" />
                <div className="h-2 bg-brand-navy/20 rounded w-full mt-2" />
              </div>
            </div>
            {/* Stylus hint */}
            <div className="absolute bottom-8 right-8 w-1 h-16 bg-white/30 rounded-full rotate-12" />
          </div>
        </FadeIn>

        {/* Right — feature list */}
        <div>
          <FadeIn>
            <Badge className="mb-5 bg-orange-50 text-orange-500 border-0 text-[11px] font-semibold uppercase tracking-widest px-3 py-1 rounded-full">
              Built for Learners
            </Badge>
            <h2 className="text-3xl font-bold text-brand-dark tracking-tight mb-8">
              Enter the Flow State
            </h2>
          </FadeIn>

          <div className="space-y-7">
            {learnerFeatures.map(({ icon, iconBg, title, desc }, i) => (
              <FadeIn key={title} delay={i * 80} className="flex items-start gap-4">
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${iconBg}`}>
                  {icon}
                </div>
                <div>
                  <p className="text-sm font-bold text-brand-dark mb-1">{title}</p>
                  <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── CTA ─────────────────────────────────────────────────────────────────────
function CTA() {
  return (
    <section className="py-24 px-6 bg-blue-50  ">
      <FadeIn>
        <div className="max-w-3xl mx-auto rounded-3xl bg-brand-navy px-8 py-16 text-center relative overflow-hidden">
          <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-44 h-44 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-brand-blue/20 blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-4">
              Ready to transform your assessment?
            </h2>
            <p className="text-blue-200 text-sm leading-relaxed mb-9 max-w-sm mx-auto">
              Join over 10,000 schools using Vortuiz to foster deeper learning and more effective teaching.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button asChild className="bg-white text-brand-navy hover:bg-blue-50 font-semibold px-7 h-11 rounded-xl text-sm transition-colors">
                <Link href="/auth">Create Free Account</Link>
              </Button>
              <Button asChild className="bg-white text-brand-navy hover:bg-blue-50 font-semibold px-7 h-11 rounded-xl text-sm transition-colors">
                <Link href="/auth">
                  <CalendarClock className="h-4 w-4" /> Schedule a Demo
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-surface text-foreground">
      <Navbar />
      <Hero />
      <TeacherFeatures />
      <LearnerFeatures />
      <CTA />
      <Footer />
    </div>
  );
}