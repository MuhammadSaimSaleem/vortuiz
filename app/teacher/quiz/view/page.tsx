"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookOpen,
  Clock,
  FileText,
  Filter,
  FlaskConical,
  Globe,
  Layers,
  Search,
  Sigma,
  Star,
  Target,
  TrendingUp,
  Zap,
  ChevronRight,
  Lock,
  PlayCircle,
} from "lucide-react";
import Topbar from "@/components/ui/Topbar";

// ─── Types ────────────────────────────────────────────────────────────────────
type Difficulty = "Beginner" | "Intermediate" | "Advanced";
type Status = "available" | "in-progress" | "completed" | "locked";

interface Quiz {
  id: string;
  title: string;
  subject: string;
  subjectIcon: React.ReactNode;
  subjectColor: string;
  description: string;
  difficulty: Difficulty;
  duration: number; // mins
  questions: number;
  passingScore: number;
  topics: string[];
  status: Status;
  rating: number;
  coverGradient: string;
  level: string;
  assignedTo?: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const quizzes: Quiz[] = [
  {
    id: "advanced-biology",
    title: "Advanced Biology Quiz",
    subject: "Biology",
    subjectIcon: <FlaskConical className="h-4 w-4" />,
    subjectColor: "bg-emerald-100 text-emerald-700",
    description: "A comprehensive assessment covering molecular genetics, evolutionary biology, and complex cellular structures.",
    difficulty: "Advanced",
    duration: 45,
    questions: 30,
    passingScore: 70,
    topics: ["Molecular Genetics", "Evolutionary Theory", "Cell Biology", "Photosynthesis", "Ecology", "Metabolic Pathways"],
    status: "available",
    rating: 4.8,
    coverGradient: "from-blue-900 via-indigo-800 to-blue-700",
    level: "Advanced Level",
    assignedTo: "Alex Johnson",
  },
  {
    id: "algebra-fundamentals",
    title: "Algebra Fundamentals",
    subject: "Mathematics",
    subjectIcon: <Sigma className="h-4 w-4" />,
    subjectColor: "bg-orange-100 text-orange-700",
    description: "Master the core concepts of algebra including equations, inequalities, and functions.",
    difficulty: "Intermediate",
    duration: 30,
    questions: 20,
    passingScore: 65,
    topics: ["Linear Equations", "Quadratics", "Functions", "Inequalities"],
    status: "in-progress",
    rating: 4.6,
    coverGradient: "from-orange-900 via-amber-800 to-yellow-700",
    level: "Intermediate Level",
  },
  {
    id: "world-geography",
    title: "World Geography",
    subject: "Geography",
    subjectIcon: <Globe className="h-4 w-4" />,
    subjectColor: "bg-teal-100 text-teal-700",
    description: "Explore physical geography, countries, capitals, climate zones and human geography concepts.",
    difficulty: "Beginner",
    duration: 25,
    questions: 25,
    passingScore: 60,
    topics: ["Continents", "Climate Zones", "Physical Features", "Human Geography"],
    status: "completed",
    rating: 4.3,
    coverGradient: "from-teal-900 via-cyan-800 to-teal-600",
    level: "Beginner Level",
  },
  {
    id: "cell-biology-intro",
    title: "Cell Biology Intro",
    subject: "Biology",
    subjectIcon: <FlaskConical className="h-4 w-4" />,
    subjectColor: "bg-emerald-100 text-emerald-700",
    description: "Introduction to cell theory, organelles, cell division, and membrane transport.",
    difficulty: "Beginner",
    duration: 20,
    questions: 15,
    passingScore: 60,
    topics: ["Cell Theory", "Organelles", "Mitosis", "Membrane Transport"],
    status: "completed",
    rating: 4.9,
    coverGradient: "from-green-900 via-emerald-800 to-green-700",
    level: "Beginner Level",
  },
  {
    id: "calculus-derivatives",
    title: "Calculus: Derivatives",
    subject: "Mathematics",
    subjectIcon: <Sigma className="h-4 w-4" />,
    subjectColor: "bg-orange-100 text-orange-700",
    description: "Deep dive into differential calculus — limits, derivative rules, and applications.",
    difficulty: "Advanced",
    duration: 60,
    questions: 35,
    passingScore: 75,
    topics: ["Limits", "Derivative Rules", "Chain Rule", "Optimization"],
    status: "locked",
    rating: 4.7,
    coverGradient: "from-rose-900 via-pink-800 to-rose-700",
    level: "Advanced Level",
  },
  {
    id: "literature-analysis",
    title: "Literature Analysis",
    subject: "English",
    subjectIcon: <BookOpen className="h-4 w-4" />,
    subjectColor: "bg-violet-100 text-violet-700",
    description: "Critical reading and literary analysis of prose, poetry, and drama from world literature.",
    difficulty: "Intermediate",
    duration: 40,
    questions: 22,
    passingScore: 65,
    topics: ["Poetry", "Prose Analysis", "Themes", "Literary Devices"],
    status: "available",
    rating: 4.5,
    coverGradient: "from-violet-900 via-purple-800 to-violet-700",
    level: "Intermediate Level",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const difficultyConfig: Record<Difficulty, { color: string; bg: string }> = {
  Beginner:     { color: "text-emerald-700", bg: "bg-emerald-50 border border-emerald-200" },
  Intermediate: { color: "text-amber-700",   bg: "bg-amber-50 border border-amber-200"   },
  Advanced:     { color: "text-rose-700",    bg: "bg-rose-50 border border-rose-200"      },
};

const statusConfig: Record<Status, { label: string; color: string; bg: string }> = {
  available:   { label: "Available",    color: "text-brand-blue",   bg: "bg-brand-light"              },
  "in-progress":{ label: "In Progress", color: "text-amber-700",    bg: "bg-amber-50 border border-amber-200" },
  completed:   { label: "Completed",    color: "text-emerald-700",  bg: "bg-emerald-50 border border-emerald-200" },
  locked:      { label: "Locked",       color: "text-slate-500",    bg: "bg-slate-100"                },
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`h-3 w-3 ${i <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"}`} />
      ))}
      <span className="text-xs text-slate-400 ml-0.5">{rating.toFixed(1)}</span>
    </div>
  );
}

// ─── QuizCard ─────────────────────────────────────────────────────────────────
function QuizCard({ quiz }: { quiz: Quiz }) {
  const diff   = difficultyConfig[quiz.difficulty];
  const status = statusConfig[quiz.status];
  const isLocked = quiz.status === "locked";

  return (
    <Link href={isLocked ? "#" : `/student/quiz/view/${quiz.id}`}
      className={`group block rounded-2xl border border-border bg-white overflow-hidden transition-all duration-200
        ${isLocked ? "opacity-60 cursor-not-allowed" : "hover:shadow-lg hover:-translate-y-0.5"}`}>
      {/* Cover */}
      <div className={`relative h-28 bg-linear-to-br ${quiz.coverGradient} overflow-hidden`}>
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "radial-gradient(circle at 30% 70%, white 0%, transparent 50%), radial-gradient(circle at 80% 20%, white 0%, transparent 40%)" }} />
        {/* Level badge */}
        <div className="absolute top-3 left-3">
          <span className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm border border-white/30 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
            <Star className="h-2.5 w-2.5 fill-white" />
            {quiz.level.toUpperCase()}
          </span>
        </div>
        {/* Status */}
        <div className="absolute top-3 right-3">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${status.bg} ${status.color}`}>
            {status.label}
          </span>
        </div>
        {/* Lock overlay */}
        {isLocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <Lock className="h-6 w-6 text-white/80" />
          </div>
        )}
        {/* Play hover */}
        {!isLocked && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
            <PlayCircle className="h-10 w-10 text-white drop-shadow-lg" />
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="flex items-center gap-1.5 mb-2">
          <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${quiz.subjectColor}`}>
            {quiz.subjectIcon}{quiz.subject}
          </span>
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${diff.bg} ${diff.color}`}>
            {quiz.difficulty}
          </span>
        </div>

        <h3 className="text-sm font-bold text-brand-dark leading-tight mb-1 group-hover:text-brand-navy transition-colors">
          {quiz.title}
        </h3>
        <p className="text-xs text-brand-subtitle leading-relaxed line-clamp-2 mb-3">{quiz.description}</p>

        <StarRating rating={quiz.rating} />

        {/* Stats row */}
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border">
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Clock className="h-3 w-3" />{quiz.duration}m
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <FileText className="h-3 w-3" />{quiz.questions} Qs
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Target className="h-3 w-3" />{quiz.passingScore}%
          </div>
          <ChevronRight className="h-3.5 w-3.5 text-slate-300 ml-auto group-hover:text-brand-blue transition-colors group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function QuizPage() {
  const [search,     setSearch]     = useState("");
  const [filterDiff, setFilterDiff] = useState("all");
  const [filterSubj, setFilterSubj] = useState("all");
  const [filterStat, setFilterStat] = useState("all");

  const subjects = [...new Set(quizzes.map(q => q.subject))];

  const filtered = quizzes.filter(q => {
    const matchSearch = !search.trim() || q.title.toLowerCase().includes(search.toLowerCase()) || q.subject.toLowerCase().includes(search.toLowerCase());
    const matchDiff   = filterDiff === "all" || q.difficulty === filterDiff;
    const matchSubj   = filterSubj === "all" || q.subject === filterSubj;
    const matchStat   = filterStat === "all" || q.status === filterStat;
    return matchSearch && matchDiff && matchSubj && matchStat;
  });

  const available   = quizzes.filter(q => q.status === "available").length;
  const inProgress  = quizzes.filter(q => q.status === "in-progress").length;
  const completed   = quizzes.filter(q => q.status === "completed").length;

  return (
    <div className="min-h-full bg-surface p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark tracking-tight">My Quizzes</h1>
          <p className="text-sm text-brand-subtitle mt-0.5">Select a quiz to begin your assessment.</p>
        </div>
        <Link href="/quiz/view/quiz">
          <Button className="bg-brand-navy hover:bg-brand-blue text-white font-semibold text-sm rounded-xl h-10 px-5 gap-2 transition-colors">
            <Zap className="h-4 w-4" /> Start New Quiz
          </Button>
        </Link>
      </div>

      {/* Stat chips */}
      <div className="flex items-center gap-3">
        {[
          { icon: <Layers className="h-3.5 w-3.5" />,   label: `${quizzes.length} Total`,      color: "bg-brand-light text-brand-navy" },
          { icon: <PlayCircle className="h-3.5 w-3.5" />,label: `${available} Available`,       color: "bg-blue-50 text-blue-700"       },
          { icon: <TrendingUp className="h-3.5 w-3.5" />,label: `${inProgress} In Progress`,    color: "bg-amber-50 text-amber-700"     },
          { icon: <Target className="h-3.5 w-3.5" />,    label: `${completed} Completed`,       color: "bg-emerald-50 text-emerald-700" },
        ].map(chip => (
          <span key={chip.label} className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${chip.color}`}>
            {chip.icon}{chip.label}
          </span>
        ))}
      </div>

      {/* Search + filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-50 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search quizzes…"
            className="h-9 pl-9 text-sm bg-white border-border focus-visible:ring-brand-blue rounded-xl" />
        </div>
        <Select value={filterSubj} onValueChange={setFilterSubj}>
          <SelectTrigger className="h-9 text-sm border-border rounded-xl w-36 focus:ring-brand-blue">
            <Filter className="h-3.5 w-3.5 text-slate-400 mr-1.5 shrink-0" /><SelectValue placeholder="Subject" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="all">All Subjects</SelectItem>
            {subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterDiff} onValueChange={setFilterDiff}>
          <SelectTrigger className="h-9 text-sm border-border rounded-xl w-40 focus:ring-brand-blue">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="Beginner">Beginner</SelectItem>
            <SelectItem value="Intermediate">Intermediate</SelectItem>
            <SelectItem value="Advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStat} onValueChange={setFilterStat}>
          <SelectTrigger className="h-9 text-sm border-border rounded-xl w-40 focus:ring-brand-blue">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="locked">Locked</SelectItem>
          </SelectContent>
        </Select>
        {(filterDiff !== "all" || filterSubj !== "all" || filterStat !== "all" || search) && (
          <button onClick={() => { setSearch(""); setFilterDiff("all"); setFilterSubj("all"); setFilterStat("all"); }}
            className="text-xs font-semibold text-brand-blue hover:opacity-70 transition-opacity">
            Clear filters
          </button>
        )}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="h-14 w-14 rounded-2xl bg-brand-light flex items-center justify-center">
            <Search className="h-7 w-7 text-brand-blue" />
          </div>
          <p className="text-sm font-semibold text-brand-dark">No quizzes found</p>
          <p className="text-xs text-brand-subtitle">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(quiz => <QuizCard key={quiz.id} quiz={quiz} />)}
        </div>
      )}
    </div>
  );
}