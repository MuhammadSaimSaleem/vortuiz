"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart2,
  BookOpen,
  CheckCircle,
  ChevronRight,
  Cpu,
  Globe,
  GraduationCap,
  PhoneCall,
  Hash,
  Layers,
  LayoutDashboard,
  Play,
  Shield,
  Sparkles,
  Target,
  Trophy,
  Headset,
  Zap,
} from "lucide-react";
import Link from "next/link";

// ─── Animated counter ────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1200, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

// ─── Intersection observer hook ──────────────────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// ─── Section fade-in wrapper ──────────────────────────────────────────────────
function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ─── Trusted logos ────────────────────────────────────────────────────────────
const logos = ["EDUVERSE", "SCHOLARLY", "UNIVERSITY OF FAISALABAD", "KNOWLEDGE.CO", "CAMPUS+"];

// ─── Features data ────────────────────────────────────────────────────────────
const educatorFeatures = [
  { icon: Zap, title: "Reduce Grading Time", desc: "Automated grading for most question types lets you focus on providing meaningful feedback instead of manual labor." },
  { icon: Target, title: "Adaptive Feedback", desc: "Set conditional responses that guide students based on their specific incorrect answers." },
  { icon: Layers, title: "Shared Repositories", desc: "Collaborate with department colleagues to create standardized test banks and resources." },
];

const learnerFeatures = [
  { icon: Sparkles, title: "Engaging Interface", desc: 'Experience a "flow state" with our distraction-free, high-performance quiz engine built for focus.' },
  { icon: BarChart2, title: "Mastery Mode", desc: 'Re-take quizzes in "practice mode" where questions adapt to focus on your weakest areas.' },
  { icon: Trophy, title: "Achievements & Progress", desc: "Visual rewards and streaks keep you motivated as you advance through the curriculum." },
];

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-border" : "bg-white border-b border-border"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <span className="font-bold text-lg text-brand-dark tracking-tight">Vortuiz</span>
        <nav className="hidden md:flex items-center gap-7 text-sm text-slate-500 font-medium">
          {["Features", "Teachers", "Students", "Pricing"].map((item) => (
            <a key={item} href="#" className="hover:text-brand-dark transition-colors">{item}</a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm" className="text-sm font-medium text-slate-600"><Link href={'/auth'}>Login</Link></Button>
          <Button asChild size="sm" className="bg-brand-dark hover:bg-brand-blue text-white text-sm font-semibold rounded-lg transition-colors">
            <Link href={'/auth'}>Get Started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="max-w-6xl mx-auto px-6 pt-16 pb-20 grid md:grid-cols-2 gap-10 items-center">
      {/* Left */}
      <div>
        <Badge className="mb-5 bg-brand-light text-brand-blue border-0 text-[11px] font-semibold uppercase tracking-widest px-3 py-1 rounded-full">
          ✦ Learning Innovation
        </Badge>
        <h1 className="text-4xl md:text-5xl font-bold text-brand-dark leading-[1.12] tracking-tight mb-5">
          Empower Learning Through Interactive Assessments
        </h1>
        <p className="text-slate-500 text-base leading-relaxed mb-8 max-w-md">
          Vortuiz bridges the gap between instruction and mastery. Create engaging quizzes in minutes, track progress in real-time, and foster a state of cognitive flow.
        </p>
        <div className="flex items-center gap-3 mb-7">
          <Button asChild className="bg-brand-dark hover:bg-brand-blue text-white font-semibold px-5 h-11 rounded-xl transition-colors text-sm">
            <Link href={'/auth'}>Start Your Free Trial</Link>
          </Button>
          <Button asChild variant="outline" className="border-border text-slate-600 font-semibold px-5 h-11 rounded-xl text-sm gap-2 hover:bg-slate-50">
            <Link href={'/auth'}>
              <Play className="h-3.5 w-3.5 fill-current" />
              See How It Works
            </Link>
          </Button>
        </div>
        <div className="flex items-center gap-2.5">
          {/* Avatar stack */}
          <div className="flex -space-x-2">
            {["bg-blue-400", "bg-indigo-400", "bg-violet-400"].map((c, i) => (
              <div key={i} className={`h-7 w-7 rounded-full ${c} border-2 border-white flex items-center justify-center text-white text-[10px] font-bold`}>
                {["A", "B", "C"][i]}
              </div>
            ))}
          </div>
          <span className="text-xs text-slate-400 font-medium">Join 50k+ Educators Worldwide</span>
        </div>
      </div>

      {/* Right — dark UI card mockup */}
      <div className="relative">
        <div className="relative rounded-2xl overflow-hidden bg-slate-900 shadow-2xl border border-slate-700 aspect-4/3">
          {/* Glowing circle */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-44 h-44">
              <div className="absolute inset-0 rounded-full border-2 border-cyan-400/60" style={{ boxShadow: "0 0 40px 8px rgba(34,211,238,0.18)" }} />
              <div className="absolute inset-6 rounded-full border border-cyan-400/30" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-1 h-14 bg-cyan-400/80 rounded-full rotate-[-30deg] origin-bottom -translate-y-7" />
              </div>
            </div>
          </div>
          {/* Bottom bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-slate-800/90 backdrop-blur-sm border-t border-slate-700 px-4 py-2.5">
            <p className="text-xs text-slate-300 font-mono truncate">Solar Transit: Verify Entry/Photons</p>
          </div>
        </div>

        {/* Floating live insight card */}
        <div className="absolute -bottom-4 -left-6 bg-white rounded-xl shadow-xl border border-border p-3 flex items-center gap-3 min-w-45">
          <div className="h-8 w-8 rounded-lg bg-brand-light flex items-center justify-center shrink-0">
            <BarChart2 className="h-4 w-4 text-brand-blue" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-brand-dark">Live Insight</p>
            <p className="text-[11px] text-slate-400">83% Class Participation</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Trusted by ───────────────────────────────────────────────────────────────
function TrustedBy() {
  return (
    <section className="border-y border-border bg-slate-50 py-10">
      <p className="text-center text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-7">
        Trusted by Educators at
      </p>
      <div className="max-w-4xl mx-auto px-6 flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
        {logos.map((logo) => (
          <span key={logo} className="text-sm font-bold tracking-wider text-slate-400 hover:text-slate-600 transition-colors cursor-default">
            {logo}
          </span>
        ))}
      </div>
    </section>
  );
}

// ─── Features section ─────────────────────────────────────────────────────────
function Features() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-24">
      <FadeIn className="text-center mb-14">
        <h2 className="text-3xl font-bold text-brand-dark tracking-tight mb-3">
          Precision-Engineered Learning Tools
        </h2>
        <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
          Our features are designed to minimize administrative friction and maximize cognitive engagement.
        </p>
      </FadeIn>

      {/* Row 1: Quiz Builder + card + Instant Access */}
      <div className="grid md:grid-cols-3 gap-5 mb-5">
        {/* Quiz Builder */}
        <FadeIn delay={0} className="rounded-2xl border border-border bg-white p-7 flex flex-col">
          <div className="h-9 w-9 rounded-xl bg-brand-light flex items-center justify-center mb-5">
            <BookOpen className="h-4 w-4 text-brand-blue" />
          </div>
          <h3 className="font-bold text-brand-dark text-base mb-2">Intuitive Quiz Builder</h3>
          <p className="text-sm text-slate-400 leading-relaxed flex-1">
            Create diverse question types from multiple choice to fill-in-the-blanks with our drag-and-drop interface. Powered by AI suggestions to help you build assessments faster.
          </p>
          <a href="#" className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-brand-blue hover:gap-2 transition-all">
            Explore Builder <ChevronRight className="h-3 w-3" />
          </a>
        </FadeIn>

        {/* Center mockup card */}
        <FadeIn delay={80} className="rounded-2xl border border-border bg-slate-50 p-6 flex flex-col justify-center gap-3">
          <div className="rounded-xl border border-border bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-medium text-slate-600">Option A: Photosynthesis</p>
          </div>
          <div className="rounded-xl border-2 border-brand-blue bg-brand-light px-4 py-3 shadow-sm">
            <p className="text-xs font-semibold text-brand-blue">Open B: Respiration</p>
          </div>
          <div className="rounded-xl border border-border bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-medium text-slate-400">Option C: ···</p>
          </div>
        </FadeIn>

        {/* Instant Access Codes */}
        <FadeIn delay={160} className="rounded-2xl bg-brand-dark p-7 flex flex-col text-white">
          <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center mb-5">
            <Hash className="h-4 w-4 text-white" />
          </div>
          <h3 className="font-bold text-white text-base mb-2">Instant Access Codes</h3>
          <p className="text-sm text-blue-200 leading-relaxed flex-1">
            No accounts needed for students. Generate a unique Join Code and start your session in seconds. Perfectly secure, effortlessly simple.
          </p>
          <div className="mt-6 rounded-xl bg-white/10 border border-white/20 px-5 py-3 text-center">
            <span className="font-mono font-bold text-xl tracking-widest text-white">XJ7–99K</span>
          </div>
        </FadeIn>
      </div>

      {/* Row 2: Analytics + integrations grid */}
      <div className="grid md:grid-cols-3 gap-5">
        {/* Real-time Analytics */}
        <FadeIn delay={0} className="rounded-2xl border border-border bg-white p-7 flex flex-col">
          <div className="h-9 w-9 rounded-xl bg-brand-light flex items-center justify-center mb-5">
            <BarChart2 className="h-4 w-4 text-brand-blue" />
          </div>
          <h3 className="font-bold text-brand-dark text-base mb-2">Real-time Analytics</h3>
          <p className="text-sm text-slate-400 leading-relaxed flex-1">
            Watch results flow in live. Identify knowledge gaps instantly with heatmaps and difficulty distribution charts.
          </p>
        </FadeIn>

        {/* Integration tiles */}
        <FadeIn delay={80} className="rounded-2xl border border-border bg-slate-50 p-5 grid grid-cols-2 gap-3">
          {[
            { icon: CheckCircle, label: "Auto-grading", color: "text-emerald-500", bg: "bg-emerald-50" },
            { icon: Globe, label: "Timed Tests", color: "text-brand-blue", bg: "bg-brand-light" },
            { icon: Shield, label: "Safe Browser", color: "text-violet-500", bg: "bg-violet-50" },
            { icon: LayoutDashboard, label: "LMS Export", color: "text-orange-500", bg: "bg-orange-50" },
          ].map(({ icon: Icon, label, color, bg }) => (
            <div key={label} className="rounded-xl border border-border bg-white p-3 flex flex-col gap-2">
              <div className={`h-7 w-7 rounded-lg ${bg} flex items-center justify-center`}>
                <Icon className={`h-3.5 w-3.5 ${color}`} />
              </div>
              <p className="text-xs font-semibold text-slate-600">{label}</p>
            </div>
          ))}
        </FadeIn>

        {/* Seamless Integration */}
        <FadeIn delay={160} className="rounded-2xl border border-border bg-white p-7 flex flex-col">
          <h3 className="font-bold text-brand-dark text-base mb-2">Seamless Integration</h3>
          <p className="text-sm text-slate-400 leading-relaxed flex-1">
            Vortuiz works where you work. Export grades directly to Canvas, Google Classroom, and Moodle with a single click.
          </p>
          <Button className="mt-5 bg-brand-dark hover:bg-brand-blue text-white text-xs font-semibold rounded-lg h-9 self-start px-4 transition-colors">
            View All Integrations
          </Button>
        </FadeIn>
      </div>
    </section>
  );
}

// ─── For Educators / For Learners ─────────────────────────────────────────────
function AudienceSplit() {
  return (
    <section className="border-t border-border bg-slate-50 py-24">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16">
        {/* Educators */}
        <FadeIn>
          <Badge className="mb-5 bg-brand-light text-brand-blue border-0 text-[11px] font-semibold uppercase tracking-widest px-3 py-1 rounded-full gap-1.5">
            <GraduationCap className="h-3 w-3" /> For Educators
          </Badge>
          <h2 className="text-2xl font-bold text-brand-dark tracking-tight mb-8">
            Master Your Classroom Insight
          </h2>
          <div className="space-y-7">
            {educatorFeatures.map(({ icon: Icon, title, desc }, i) => (
              <FadeIn key={title} delay={i * 80} className="flex gap-4">
                <div className="h-8 w-8 rounded-xl bg-brand-light flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="h-4 w-4 text-brand-blue" />
                </div>
                <div>
                  <p className="text-sm font-bold text-brand-dark mb-1">{title}</p>
                  <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </FadeIn>

        {/* Learners */}
        <FadeIn delay={120}>
          <Badge className="mb-5 bg-orange-50 text-orange-500 border-0 text-[11px] font-semibold uppercase tracking-widest px-3 py-1 rounded-full gap-1.5">
            <Cpu className="h-3 w-3" /> For Learners
          </Badge>
          <h2 className="text-2xl font-bold text-brand-dark tracking-tight mb-8">
            Study Smarter, Not Harder
          </h2>
          <div className="space-y-7">
            {learnerFeatures.map(({ icon: Icon, title, desc }, i) => (
              <FadeIn key={title} delay={120 + i * 80} className="flex gap-4">
                <div className="h-8 w-8 rounded-xl bg-orange-50 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="h-4 w-4 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-brand-dark mb-1">{title}</p>
                  <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ─── CTA ─────────────────────────────────────────────────────────────────────
function CTA() {
  return (
    <section className="py-24 px-6">
      <FadeIn>
        <div className="max-w-3xl mx-auto rounded-3xl bg-brand-dark px-8 py-16 text-center relative overflow-hidden">
          {/* Decorative blobs */}
          <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-44 h-44 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-brand-blue/20 blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-4">
              Ready to revolutionize your classroom?
            </h2>
            <p className="text-blue-200 text-sm leading-relaxed mb-9 max-w-sm mx-auto">
              Join thousands of educators who are transforming the way they assess and engage their students with Vortuiz.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 mb-5">
              <Button asChild className="bg-white text-brand-dark hover:bg-blue-50 font-semibold px-6 h-11 rounded-xl text-sm transition-colors">
                <Link href={'/auth'}>Start Your Journey Today</Link>
              </Button>
              <Button asChild variant="outline" className="border-white/30 text-black hover:text-white hover:bg-white/10 font-semibold px-6 h-11 rounded-xl text-sm">
                <Link href={'/auth'}>Schedule a Demo</Link>
              </Button>
            </div>
            <p className="text-[11px] text-blue-300">No credit card required. Cancel anytime.</p>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="border-t border-border bg-white py-8 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <p className="font-bold text-brand-dark text-base mb-0.5">Vortuiz</p>
          <p className="text-xs text-slate-400">© 2026 Vortuiz. Empowering learners globally.</p>
        </div>
        <nav className="flex flex-wrap items-center gap-5 text-xs text-slate-400">
          {["Privacy Policy", "Terms of Service", "Help Center", "Contact Us"].map((item) => (
            <a key={item} href="#" className="hover:text-slate-600 transition-colors">{item}</a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <a href="#" className="h-8 w-8 rounded-lg border border-border flex items-center justify-center text-slate-400 hover:text-brand-dark hover:border-brand-dark transition-colors">
            <Headset className="h-3.5 w-3.5" />
          </a>
          <a href="#" className="h-8 w-8 rounded-lg border border-border flex items-center justify-center text-slate-400 hover:text-brand-dark hover:border-brand-dark transition-colors">
            <PhoneCall className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface text-foreground">
      <Navbar />
      <Hero />
      <TrustedBy />
      <Features />
      <AudienceSplit />
      <CTA />
      <Footer />
    </div>
  );
}