"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  BarChart2,
  BookOpen,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Compass,
  Grid2X2,
  Languages,
  MoreVertical,
  Palette,
  Scroll,
  Star,
  TrendingUp,
  AlignJustify,
  Sigma,
  FlaskConical,
  History,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface AssignedQuiz {
  id: string;
  tag: string;
  tagVariant: "due" | "open";
  title: string;
  subtitle: string;
  meta?: string;
  metaIsTime?: boolean;
  participants?: number;
}

interface ScoreItem {
  id: string;
  subject: string;
  score: string;
  icon: React.ReactNode;
  iconBg: string;
}

interface CategoryItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  bg: string;
  iconColor: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const assignedQuizzes: AssignedQuiz[] = [
  {
    id: "1",
    tag: "DUE TODAY",
    tagVariant: "due",
    title: "Advanced Organic Chemistry",
    subtitle: "Chapter 4: Molecular Orbitals & Reactions",
    participants: 14,
  },
  {
    id: "2",
    tag: "OPEN NOW",
    tagVariant: "open",
    title: "Data Structures & Algos",
    subtitle: "Sorting Algorithms Efficiency Analysis",
    meta: "45 mins",
    metaIsTime: true,
  },
];

const scores: ScoreItem[] = [
  {
    id: "1",
    subject: "PHYSICS 101",
    score: "Score: 92/100",
    icon: <CheckCircle className="h-4 w-4" />,
    iconBg: "bg-emerald-100 text-emerald-600",
  },
  {
    id: "2",
    subject: "LITERATURE",
    score: "Score: 88/100",
    icon: <Star className="h-4 w-4" />,
    iconBg: "bg-blue-100 text-blue-500",
  },
  {
    id: "3",
    subject: "MATHEMATICS",
    score: "Score: 75/100",
    icon: <TrendingUp className="h-4 w-4" />,
    iconBg: "bg-orange-100 text-orange-500",
  },
];

const categories: CategoryItem[] = [
  { id: "1", label: "Science", icon: <FlaskConical className="h-8 w-8" />, bg: "bg-blue-50", iconColor: "text-brand-blue" },
  { id: "2", label: "Mathematics", icon: <Sigma className="h-8 w-8" />, bg: "bg-orange-50", iconColor: "text-orange-500" },
  { id: "3", label: "Languages", icon: <Languages className="h-8 w-8" />, bg: "bg-emerald-50", iconColor: "text-emerald-600" },
  { id: "4", label: "Arts", icon: <Palette className="h-8 w-8" />, bg: "bg-purple-50", iconColor: "text-purple-500" },
  { id: "5", label: "History", icon: <History className="h-8 w-8" />, bg: "bg-rose-50", iconColor: "text-rose-500" },
  { id: "6", label: "More", icon: <Grid2X2 className="h-8 w-8" />, bg: "bg-slate-100", iconColor: "text-slate-500" },
];

// ─── Join Quiz Banner ─────────────────────────────────────────────────────────
function JoinQuizBanner() {
  const [code, setCode] = useState("");

  return (
    <div className="rounded-2xl bg-brand-dark px-8 py-8 flex flex-col justify-center relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute bottom-0 right-12 w-24 h-24 rounded-full bg-white/5 pointer-events-none" />

      <h2 className="text-xl font-bold text-white mb-1.5 relative z-10">Ready for a challenge?</h2>
      <p className="text-sm text-blue-200 mb-6 relative z-10">
        Enter a join code to start a live session or access a private test.
      </p>
      <div className="flex items-center gap-3 relative z-10">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="ENTER CODE (e.g. QF-88…)"
          className="h-12 bg-white/10 border-white/20 text-white placeholder:text-blue-300/60 placeholder:text-xs placeholder:font-semibold placeholder:tracking-widest focus-visible:ring-white/30 rounded-xl text-sm font-mono"
        />
        <Link href={code ? `/quiz/join/${code}` : "#"}>
          <Button className="h-12 px-6 bg-white text-brand-dark hover:bg-blue-50 font-bold text-sm rounded-xl shrink-0 transition-colors">
            Join Quiz
          </Button>
        </Link>
      </div>
    </div>
  );
}

// ─── Overall Progress ─────────────────────────────────────────────────────────
function OverallProgress() {
  return (
    <div className="rounded-2xl border border-border bg-white p-6 flex flex-col justify-between h-full">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-2">
        Overall Progress
      </p>
      <div>
        <p className="text-3xl font-bold text-brand-dark mb-4">84% Mastery</p>
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-slate-400">Quizzes Completed</span>
          <span className="font-bold text-brand-dark">12/15</span>
        </div>
        <Progress value={80} className="h-2.5 rounded-full bg-slate-100 [&>div]:bg-brand-dark [&>div]:rounded-full" />
        <p className="text-xs text-slate-400 mt-3 italic">You&apos;re in the top 5% this month!</p>
      </div>
    </div>
  );
}

// ─── Assigned Quizzes ─────────────────────────────────────────────────────────
function AssignedQuizzes() {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-brand-light flex items-center justify-center">
            <Scroll className="h-3.5 w-3.5 text-brand-blue" />
          </div>
          <h2 className="text-base font-bold text-brand-dark">Assigned Quizzes</h2>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/quizzes" className="text-xs font-semibold text-slate-400 hover:text-brand-blue transition-colors">
            View All
          </Link>
          <Link href="/performance" className="flex items-center gap-1.5 text-xs font-semibold text-brand-blue hover:opacity-80 transition-opacity">
            <TrendingUp className="h-3.5 w-3.5" />
            Performance
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {assignedQuizzes.map((quiz) => (
          <div key={quiz.id} className="rounded-2xl border border-border bg-white p-5 flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <Badge
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border-0 ${
                  quiz.tagVariant === "due"
                    ? "bg-orange-100 text-orange-600"
                    : "bg-blue-100 text-brand-blue"
                }`}
              >
                {quiz.tag}
              </Badge>
              <Button variant="ghost" size="icon" className="h-7 w-7 -mt-1 -mr-1 text-slate-300">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>

            <div>
              <p className="font-bold text-brand-dark text-base leading-tight mb-1">{quiz.title}</p>
              <p className="text-xs text-slate-400">{quiz.subtitle}</p>
            </div>

            <div className="flex items-center justify-between mt-auto">
              {quiz.participants ? (
                <div className="flex items-center gap-1.5">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="bg-brand-dark text-white text-[9px]">U</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-slate-400 font-medium">+{quiz.participants}</span>
                </div>
              ) : quiz.meta ? (
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Clock className="h-3.5 w-3.5" />
                  {quiz.meta}
                </div>
              ) : (
                <span />
              )}
              <Link href={`/quiz/${quiz.id}/take`}>
                <Button className="bg-brand-dark hover:bg-brand-blue text-white text-xs font-bold h-9 px-5 rounded-xl transition-colors">
                  Take Now
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Performance Scores ───────────────────────────────────────────────────────
function PerformanceScores() {
  return (
    <div className="rounded-2xl border border-border bg-white overflow-hidden">
      {scores.map((item, i) => (
        <div
          key={item.id}
          className={`flex items-center gap-4 px-5 py-4 ${i !== scores.length - 1 ? "border-b border-border" : ""}`}
        >
          <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${item.iconBg}`}>
            {item.icon}
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{item.subject}</p>
            <p className="text-sm font-bold text-brand-dark">{item.score}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Browse Quiz Library ─────────────────────────────────────────────────────
function BrowseLibrary() {
  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-brand-light flex items-center justify-center">
            <BookOpen className="h-3.5 w-3.5 text-brand-blue" />
          </div>
          <h2 className="text-base font-bold text-brand-dark">Browse Quiz Library</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8 border-border rounded-lg">
            <ChevronLeft className="h-4 w-4 text-slate-400" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8 border-border rounded-lg">
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-4">
        {categories.map((cat) => (
          <Link key={cat.id} href={`/library/${cat.label.toLowerCase()}`} className="flex flex-col items-center gap-3 group">
            <div
              className={`w-full aspect-square rounded-2xl ${cat.bg} flex items-center justify-center transition-transform group-hover:scale-105`}
            >
              <span className={cat.iconColor}>{cat.icon}</span>
            </div>
            <span className="text-sm font-medium text-slate-600 group-hover:text-brand-dark transition-colors">
              {cat.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="mt-12 border-t border-border py-6 px-6 flex items-center justify-between">
      <p className="text-xs text-slate-400">© 202 QuizStudio. Elevating the learning experience.</p>
      <nav className="flex items-center gap-5 text-xs text-slate-400">
        {["Privacy Policy", "Terms of Service", "Student Handbook"].map((item) => (
          <Link key={item} href="#" className="hover:text-brand-dark transition-colors">
            {item}
          </Link>
        ))}
      </nav>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function StudentDashboard() {
  return (
    <div className="flex min-h-screen bg-surface flex-1 flex-col">
      <main className="flex-1 px-6 py-6 space-y-7">
        {/* Hero row: join banner + progress */}
        <div className="grid grid-cols-[1fr_300px] gap-5">
          <JoinQuizBanner />
          <OverallProgress />
        </div>

        {/* Quizzes + scores */}
        <div className="grid grid-cols-[1fr_280px] gap-5 items-start">
          <AssignedQuizzes />
          <PerformanceScores />
        </div>

        {/* Library */}
        <BrowseLibrary />
      </main>

      <Footer />
    </div>
  );
}