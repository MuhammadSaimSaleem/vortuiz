"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  BarChart2,
  BrainCircuit,
  CheckCircle2,
  Circle,
  EyeOff,
  Medal,
  Star,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import Navbar from "@/components/ui/NavBar";
import Footer from "@/components/ui/Footer";
import { HiOutlineSparkles } from "react-icons/hi2";

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

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  const [code, setCode] = useState("");

  return (
    <section className="max-w-6xl mx-auto px-6 pt-16 pb-20 grid md:grid-cols-2 gap-10 items-center">
      {/* Left */}
      <div>
        <Badge className="mb-5 bg-brand-light text-brand-blue border-0 text-[11px] font-semibold uppercase tracking-widest px-3 py-1 rounded-full">
          Unlock Your Potential
        </Badge>
        <h1 className="text-4xl md:text-5xl font-bold text-brand-navy leading-[1.12] tracking-tight mb-5">
          Study Smarter, Not Harder.
        </h1>
        <p className="text-slate-500 text-base leading-relaxed mb-8 max-w-md">
          Experience a focused learning environment designed to help you master any subject with ease. Join millions of students reaching their flow state.
        </p>

        {/* Join code input */}
        <div className="bg-white border border-border rounded-2xl p-4 shadow-sm max-w-sm">
          <label className="text-[10px] font-bold uppercase tracking-widest text-brand-subtitle block mb-1.5">
            Enter Class Code
          </label>
          <div className="flex gap-2">
            <Input
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="e.g. QF-9921"
              className="h-10 text-sm border-border focus-visible:ring-brand-blue rounded-xl flex-1 font-mono"
            />
            <Button asChild className="bg-brand-navy hover:bg-brand-blue text-white font-bold text-sm h-10 px-4 rounded-xl transition-colors shrink-0">
              <Link href={code ? `/take-quiz/${code}` : "#"}>
                Join Quiz
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Right — photo/illustration */}
      <div className="relative">
        <div className="rounded-2xl overflow-hidden aspect-4/3 bg-linear-to-br from-slate-200 to-slate-300 relative">
          {/* Abstract students illustration */}
          <div className="absolute inset-0 bg-linear-to-br from-amber-50 to-slate-100 flex items-center justify-center">
            <div className="grid grid-cols-3 gap-3 p-6 w-full">
              {[
                "bg-teal-400", "bg-blue-400", "bg-orange-400",
                "bg-purple-400","bg-rose-400", "bg-green-400",
              ].map((c, i) => (
                <div key={i} className={`${c} rounded-full h-12 w-12 flex items-center justify-center mx-auto opacity-80`}>
                  <Users className="h-6 w-6 text-white" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Floating achievement notification */}
        <div className="absolute bottom-4 left-4 right-8 bg-white rounded-xl shadow-xl border border-border p-3 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <Zap className="h-4 w-4 text-amber-500" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-brand-navy">New Achievement Unlocked!</p>
            <p className="text-[10px] text-brand-subtitle">30 Day Mastery Streak Reached!</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Mastery features ─────────────────────────────────────────────────────────
function MasteryFeatures() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-24">
      <FadeIn className="text-center mb-14">
        <h2 className="text-3xl font-bold text-brand-navy tracking-tight mb-3">
          Mastery Built for You
        </h2>
        <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
          Our features are designed to minimize cognitive load and maximize memory retention.
        </p>
      </FadeIn>

      {/* Row 1 */}
      <div className="grid md:grid-cols-3 gap-5 mb-5">
        {/* Mastery Mode — spans 2 cols */}
        <FadeIn delay={0} className="md:col-span-2 rounded-2xl border border-border bg-white p-7 flex flex-col relative overflow-hidden">
          {/* Decorative star */}
          <div className="absolute right-2 bottom-2 opacity-5">
            <HiOutlineSparkles className="h-50 w-50 text-black"/>
          </div>
          <div className="h-9 w-9 rounded-xl bg-brand-light flex items-center justify-center mb-5">
            <BrainCircuit className="h-4 w-4 text-brand-blue" />
          </div>
          <h3 className="font-bold text-brand-navy text-xl mb-2">Mastery Mode</h3>
          <p className="text-sm text-slate-400 leading-relaxed mb-5">
            Our adaptive practice engine analyzes your performance in real-time, focusing on your weak spots to ensure true long-term retention.
          </p>
          <div className="flex flex-wrap gap-2">
            {["Spaced Repetition", "AI-Driven Insights", "Personalized Paths"].map(tag => (
              <span key={tag} className="text-[11px] font-semibold bg-brand-light text-brand-blue px-3 py-1.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </FadeIn>

        {/* Achievements — dark */}
        <FadeIn delay={100} className="rounded-2xl bg-brand-navy p-7 flex flex-col text-white items-center text-center">
          <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center mb-4">
            <Trophy className="h-6 w-6 text-white" />
          </div>
          <h3 className="font-bold text-white text-base mb-2">Achievements</h3>
          <p className="text-sm text-blue-200 leading-relaxed mb-5">
            Gamify your learning journey with badges and rewards that matter.
          </p>
          {/* Badge icons */}
          <div className="flex -space-x-2">
            {[
              { bg: "bg-orange-400", icon: <Star className="h-4 w-4" /> },
              { bg: "bg-teal-400",   icon: <Medal className="h-4 w-4" /> },
              { bg: "bg-purple-400", icon: <Trophy className="h-4 w-4" /> },
            ].map((b, i) => (
              <div key={i} className={`h-9 w-9 rounded-full ${b.bg} flex items-center justify-center text-white border-2 border-brand-navy`}>
                {b.icon}
              </div>
            ))}
          </div>
        </FadeIn>
      </div>

      {/* Row 2 */}
      <div className="grid md:grid-cols-3 gap-5">
        {/* Zero Distractions */}
        <FadeIn delay={0} className="rounded-2xl border border-border bg-slate-50 p-7 flex flex-col">
          <div className="h-9 w-9 rounded-xl bg-white border border-border flex items-center justify-center mb-5 shadow-sm">
            <EyeOff className="h-4 w-4 text-brand-navy" />
          </div>
          <h3 className="font-bold text-brand-navy text-base mb-2">Zero Distractions</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            A minimalist UI focused entirely on the content. No ads, no pop-ups, just pure flow.
          </p>
        </FadeIn>

        {/* Visualized Progress */}
        <FadeIn delay={80} className="rounded-2xl border border-border bg-white p-7 flex flex-col">
          <div className="h-9 w-9 rounded-xl bg-brand-light flex items-center justify-center mb-5">
            <BarChart2 className="h-4 w-4 text-brand-blue" />
          </div>
          <h3 className="font-bold text-brand-navy text-base mb-2">Visualized Progress</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Watch your knowledge grow with intuitive charts and detailed category breakdowns.
          </p>
        </FadeIn>

        {/* Mini progress bars illustration */}
        <FadeIn delay={160} className="rounded-2xl border border-border bg-white p-7 flex flex-col justify-center gap-3">
          {[
            { label: "Biology",  pct: 88, color: "bg-brand-navy" },
            { label: "Math",     pct: 62, color: "bg-teal-500"   },
            { label: "History",  pct: 74, color: "bg-purple-500" },
          ].map(({ label, pct, color }) => (
            <div key={label}>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-slate-600">{label}</span>
                <span className="text-slate-400">{pct}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          ))}
        </FadeIn>
      </div>
    </section>
  );
}

// ─── Quiz preview ─────────────────────────────────────────────────────────────
function QuizPreview() {
  const [selected, setSelected] = useState<string | null>("atp");
  const options = [
    { id: "pyruvate", label: "Pyruvate" },
    { id: "atp",      label: "ATP"      },
    { id: "glucose",  label: "Glucose-6-Phosphate" },
  ];

  return (
    <section className="max-w-6xl mx-auto px-6 pb-24">
      <FadeIn>
        <div className="max-w-md mx-auto">
          {/* Progress bar */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden">
              <div className="h-full w-1/3 rounded-full bg-brand-navy" />
            </div>
          </div>

          {/* Quiz card */}
          <div className="rounded-2xl border border-border bg-white shadow-lg overflow-hidden">
            {/* Card header */}
            <div className="px-6 pt-5 pb-4 border-b border-border flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-subtitle">Biology 101</p>
                <p className="text-sm font-bold text-brand-navy">Cellular Respiration Quiz</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-subtitle">
                <span className="text-brand-blue">⏱</span> 12:45
              </div>
            </div>

            <div className="px-6 py-5">
              <p className="text-sm font-semibold text-brand-dark mb-5 leading-relaxed">
                What is the primary product of glycolysis that enters the Krebs cycle?
              </p>

              <div className="space-y-3 mb-6">
                {options.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setSelected(opt.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all text-left
                      ${selected === opt.id
                        ? "border-brand-blue bg-brand-light text-brand-navy"
                        : "border-border bg-white text-slate-600 hover:border-slate-300"}`}
                  >
                    {selected === opt.id
                      ? <CheckCircle2 className="h-4 w-4 text-brand-blue shrink-0" />
                      : <Circle className="h-4 w-4 text-slate-300 shrink-0" />
                    }
                    {opt.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" className="text-slate-400 font-semibold text-xs">
                  Previous
                </Button>
                <Button className="bg-brand-navy hover:bg-brand-blue text-white font-bold text-sm h-9 px-6 rounded-xl transition-colors">
                  Submit Answer
                </Button>
              </div>
            </div>
          </div>

          {/* Testimonial */}
          <p className="text-center text-sm text-slate-400 italic mt-6 leading-relaxed">
            &ldquo;The interface is so clean, I actually find myself studying longer than I planned.&rdquo;
          </p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <div className="h-6 w-6 rounded-full bg-linear-to-br from-brand-navy to-brand-blue" />
            <span className="text-xs font-semibold text-slate-500">Alex Chen, Medical Student</span>
          </div>
        </div>
      </FadeIn>
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
              Ready to Master Your Next Exam?
            </h2>
            <p className="text-blue-200 text-sm leading-relaxed mb-9 max-w-md mx-auto">
              Join the Vortuiz community today and experience the difference of focused, distraction-free learning.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button asChild className="bg-white text-brand-navy hover:bg-blue-50 font-bold px-7 h-11 rounded-xl text-sm transition-colors">
                <Link href="/auth">Create Free Account</Link>
              </Button>
              <Button asChild variant="outline" className="border-white/30 text-white font-semibold px-7 h-11 rounded-xl text-sm">
                <Link href="/features">Explore Features</Link>
              </Button>
            </div>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function StudentsPage() {
  return (
    <div className="min-h-screen bg-surface text-foreground">
      <Navbar />
      <Hero />
      <MasteryFeatures />
      <QuizPreview />
      <CTA />
      <Footer />
    </div>
  );
}