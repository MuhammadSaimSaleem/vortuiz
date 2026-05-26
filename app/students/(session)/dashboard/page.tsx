"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  BookOpen,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  HelpCircle,
  MoreVertical,
  Scroll,
  Star,
  TrendingUp,
} from "lucide-react";
import * as LucideIcons from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface AssignedQuiz {
  id: string;
  tag: string;
  tagVariant: "due" | "open";
  title: string;
  subtitle: string;
  // full quizzes schema fields
  difficulty: string | null;
  durationMinutes: number | null;
  passingScore: number | null;
  questionCount: number;
  coverGradient: string | null;
  topics: string[] | null;
  joinCode: string | null;
  meta?: string;
  metaIsTime?: boolean;
  participants?: number;
  // from quiz_affiliations
  affiliationStatus: string;
  assignedAt: string;
}

// Row returned when joining quiz_affiliations → quizzes
interface QuizAffiliationRow {
  student_id: string;
  quiz_id: string;
  assigned_at: string;
  status: string;
  quizzes: {
    id: string;
    name: string;
    subtitle: string | null;
    difficulty: string | null;
    duration_minutes: number | null;
    passing_score: number | null;
    question_count: number;
    participant_count: number;
    cover_gradient: string | null;
    topics: string[] | null;
    join_code: string | null;
    closed_at: string | null;
    status: string;
  };
}

interface ScoreItem {
  id: string;
  subject: string;
  score: string;
  icon: React.ReactNode;
  iconBg: string;
}

interface StudentData {
  id: string;
  user_id: string;
  top_percentile: number | null;
  overall_percentile: number | null;
  accuracy_rate: number | null;
  top_subject: string | null;
}

interface SubjectScore {
  id: string;
  score: number;
  recorded_at: string;
  subjects: {
    name: string;
    code: string;
  };
}

// ─── Subject interfaces ──────────────────────────────────────────────────────
interface SubjectItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon_name: string | null;
  color_theme: string | null;
  isEnrolled: boolean;
}

// ─── Score icon helpers ────────────────────────────────────────────────────────
function getScoreIcon(pct: number): { icon: React.ReactNode; iconBg: string } {
  if (pct >= 90)
    return { icon: <CheckCircle className="h-4 w-4" />, iconBg: "bg-emerald-100 text-emerald-600" };
  if (pct >= 75)
    return { icon: <Star className="h-4 w-4" />, iconBg: "bg-blue-100 text-blue-500" };
  return { icon: <TrendingUp className="h-4 w-4" />, iconBg: "bg-orange-100 text-orange-500" };
}

// ─── Quiz tag helper ───────────────────────────────────────────────────────────
function deriveQuizTag(quiz: { closed_at: string | null }): {
  tag: string;
  tagVariant: "due" | "open";
} {
  const now = new Date();
  const closedAt = quiz.closed_at ? new Date(quiz.closed_at) : null;
  if (closedAt && closedAt > now && closedAt < new Date(now.getTime() + 24 * 60 * 60 * 1000)) {
    return { tag: "DUE TODAY", tagVariant: "due" };
  }
  return { tag: "OPEN NOW", tagVariant: "open" };
}

// ─── Join Quiz Banner ─────────────────────────────────────────────────────────
function JoinQuizBanner() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleJoin = useCallback(async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;

    setLoading(true);
    try {
      const { data: quiz, error } = await supabase
        .from("quizzes")
        .select("id, status, closed_at")
        .eq("join_code", trimmed)
        .maybeSingle();

      if (error) {
        toast.error("Something went wrong", { description: error.message });
        return;
      }

      if (!quiz) {
        toast.error("Invalid code", { description: "No quiz found with that join code." });
        return;
      }

      if (quiz.status === "draft") {
        toast.error("Quiz not available", { description: "This quiz hasn't been published yet." });
        return;
      }

      if (quiz.closed_at && new Date(quiz.closed_at) < new Date()) {
        toast.error("Quiz closed", { description: "This quiz is no longer accepting submissions." });
        return;
      }

      router.push(`/quiz/${quiz.id}/take`);
    } catch {
      toast.error("Something went wrong", { description: "Please try again." });
    } finally {
      setLoading(false);
    }
  }, [code, router, supabase]);

  return (
    <div className="rounded-2xl bg-brand-navy px-8 py-8 flex flex-col justify-center relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute bottom-0 right-12 w-24 h-24 rounded-full bg-white/5 pointer-events-none" />

      <h2 className="text-xl font-bold text-white mb-1.5 relative">Ready for a challenge?</h2>
      <p className="text-sm text-blue-200 mb-6 relative">
        Enter a join code to start a live session or access a private test.
      </p>
      <div className="flex items-center gap-3 relative">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleJoin()}
          placeholder="ENTER CODE (e.g. QF-88…)"
          className="h-12 bg-white/10 border-white/20 text-white placeholder:text-blue-300/60 placeholder:text-xs placeholder:font-semibold placeholder:tracking-widest focus-visible:ring-white/30 rounded-xl text-sm font-mono"
        />
        <Button
          onClick={handleJoin}
          disabled={loading || !code.trim()}
          className="h-12 px-6 bg-white text-brand-navy hover:bg-blue-50 font-bold text-sm rounded-xl shrink-0 transition-colors disabled:opacity-60"
        >
          {loading ? "Checking…" : "Join Quiz"}
        </Button>
      </div>
    </div>
  );
}

// ─── Overall Progress ─────────────────────────────────────────────────────────
interface OverallProgressProps {
  studentData: StudentData | null;
  completedCount: number;
  totalCount: number;
  loading: boolean;
}

function OverallProgress({ studentData, completedCount, totalCount, loading }: OverallProgressProps) {
  const masteryPct =
    studentData?.accuracy_rate != null
      ? Math.round(studentData.accuracy_rate * 100)
      : totalCount > 0
      ? Math.round((completedCount / totalCount) * 100)
      : 0;

  const progressValue = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const topPct = studentData?.top_percentile ?? studentData?.overall_percentile;

  return (
    <div className="rounded-2xl border border-border bg-white p-6 flex flex-col justify-between h-full">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-2">
        Overall Progress
      </p>
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-2.5 w-full" />
          <Skeleton className="h-3 w-48" />
        </div>
      ) : (
        <div>
          <p className="text-3xl font-bold text-brand-navy mb-4">{masteryPct}% Mastery</p>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-slate-400">Quizzes Completed</span>
            <span className="font-bold text-brand-navy">
              {completedCount}/{totalCount}
            </span>
          </div>
          <Progress
            value={progressValue}
            className="h-2.5 rounded-full bg-slate-100 [&>div]:bg-brand-navy [&>div]:rounded-full"
          />
          {topPct != null && (
            <p className="text-xs text-slate-400 mt-3 italic">
              You&apos;re in the top {topPct}% this month!
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Assigned Quizzes ─────────────────────────────────────────────────────────
interface AssignedQuizzesProps {
  quizzes: AssignedQuiz[];
  loading: boolean;
  totalCount?: number;
}

function AssignedQuizzes({ quizzes, loading, totalCount }: AssignedQuizzesProps) {
  const visibleQuizzes = quizzes.slice(0, 4);
  const total = totalCount ?? quizzes.length;
  const hasMore = total > 4;

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-brand-light flex items-center justify-center">
            <Scroll className="h-3.5 w-3.5 text-brand-blue" />
          </div>
          <h2 className="text-base font-bold text-brand-navy">Assigned Quizzes</h2>
          {!loading && hasMore && (
            <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-brand-navy text-white text-[11px] font-bold">
              {total}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <Link href="/quizzes" className="text-xs font-semibold text-slate-400 hover:text-brand-blue transition-colors">
            View All
          </Link>
          <Link href="/students/analytics" className="flex items-center gap-1.5 text-xs font-semibold text-brand-blue hover:opacity-80 transition-opacity">
            <TrendingUp className="h-3.5 w-3.5" />
            Performance
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {loading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border bg-white p-5 space-y-3">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-9 w-24 ml-auto" />
            </div>
          ))
        ) : visibleQuizzes.length === 0 ? (
          <div className="col-span-2 rounded-2xl border border-dashed border-border bg-white p-8 text-center text-slate-400 text-sm">
            No quizzes assigned right now. Check back soon!
          </div>
        ) : (
          visibleQuizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="rounded-2xl border border-border overflow-hidden flex flex-col"
              style={{
                background: quiz.coverGradient
                  ? `linear-gradient(to left, ${quiz.coverGradient.replace(/^linear-gradient\([^,]+,\s*/, "").replace(/\)$/, "")})`
                  : "linear-gradient(to left, #0f172a, #1e293b)", // Clean dark-mode fallback (Slate 900 to 800)
              }}
>
              {/* Card header */}
              <div className="flex items-start justify-between px-5 pt-5 pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border-0 ${
                      quiz.tagVariant === "due"
                        ? "bg-orange-100 text-orange-600"
                        : "bg-blue-100 text-brand-blue"
                    }`}
                  >
                    {quiz.tag}
                  </Badge>
                  {quiz.difficulty && (
                    <Badge className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border-0 bg-slate-100 text-slate-500 capitalize">
                      {quiz.difficulty}
                    </Badge>
                  )}
                  {/* Affiliation status badge */}
                  <Badge
                    className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border-0 capitalize ${
                      quiz.affiliationStatus === "assigned"
                        ? "bg-violet-100 text-violet-600"
                        : quiz.affiliationStatus === "in_progress"
                        ? "bg-amber-100 text-amber-600"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {quiz.affiliationStatus.replace("_", " ")}
                  </Badge>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 -mt-1 -mr-1 text-slate-300">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>

              {/* Title + subtitle */}
              <div className="px-5 pb-3">
                <p className="font-bold text-brand-navy text-base leading-tight mb-1">{quiz.title}</p>
                <p className="text-xs text-black">{quiz.subtitle}</p>
              </div>

              {/* Topics */}
              {quiz.topics && quiz.topics.length > 0 && (
                <div className="px-5 pb-3 flex flex-wrap gap-1.5">
                  {quiz.topics.slice(0, 3).map((topic) => (
                    <span
                      key={topic}
                      className="text-[10px] font-semibold bg-slate-300 text-brand-blue px-2 py-0.5 rounded-full"
                    >
                      {topic}
                    </span>
                  ))}
                  {quiz.topics.length > 3 && (
                    <span className="text-[10px] font-semibold text-black px-1">
                      +{quiz.topics.length - 3} more
                    </span>
                  )}
                </div>
              )}

              {/* Meta row */}
              <div className="flex items-center justify-between px-5 pb-5 mt-auto gap-3">
                <div className="flex items-center gap-3 text-xs text-black flex-wrap">
                  {quiz.durationMinutes != null && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {quiz.durationMinutes} min
                    </span>
                  )}
                  {quiz.questionCount > 0 && (
                    <span className="flex items-center gap-1">
                      <HelpCircle className="h-3.5 w-3.5" />
                      {quiz.questionCount} Qs
                    </span>
                  )}
                  {quiz.passingScore != null && (
                    <span className="flex items-center gap-1">
                      <CheckCircle className="h-3.5 w-3.5" />
                      Pass: {quiz.passingScore}%
                    </span>
                  )}
                  {quiz.participants != null && (
                    <span className="flex items-center gap-1.5">
                      <Avatar className="h-4 w-4">
                        <AvatarFallback className="bg-brand-navy text-white text-[8px]">U</AvatarFallback>
                      </Avatar>
                      +{quiz.participants}
                    </span>
                  )}
                  {/* Assigned date from quiz_affiliations.assigned_at */}
                  <span className="flex items-center gap-1" title={`Assigned ${new Date(quiz.assignedAt).toLocaleDateString()}`}>
                    <Scroll className="h-3.5 w-3.5" />
                    {new Date(quiz.assignedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </span>
                </div>
                <Link href={`/students/quiz/${quiz.id}/view`} className="shrink-0">
                  <Button className="bg-brand-navy hover:bg-brand-blue text-white text-xs font-bold h-9 px-5 rounded-xl transition-colors">
                    View Details
                  </Button>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

// ─── Performance Scores ───────────────────────────────────────────────────────
interface PerformanceScoresProps {
  scores: ScoreItem[];
  loading: boolean;
}

function PerformanceScores({ scores, loading }: PerformanceScoresProps) {
  return (
    <div className="rounded-2xl border border-border bg-white overflow-hidden">
      {loading ? (
        Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className={`flex items-center gap-4 px-5 py-4 ${i < 2 ? "border-b border-border" : ""}`}>
            <Skeleton className="h-9 w-9 rounded-xl" />
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>
        ))
      ) : scores.length === 0 ? (
        <div className="px-5 py-8 text-center text-slate-400 text-xs">No scores yet.</div>
      ) : (
        scores.map((item, i) => (
          <div
            key={item.id}
            className={`flex items-center gap-4 px-5 py-4 ${i !== scores.length - 1 ? "border-b border-border" : ""}`}
          >
            <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${item.iconBg}`}>
              {item.icon}
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{item.subject}</p>
              <p className="text-sm font-bold text-brand-navy">{item.score}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ─── Subject theme helpers ───────────────────────────────────────────────────
const COLOR_THEMES: Record<string, { bg: string; text: string; badge: string }> = {
  blue:    { bg: "bg-blue-50",    text: "text-blue-600",    badge: "bg-blue-100 text-blue-700" },
  orange:  { bg: "bg-orange-50",  text: "text-orange-500",  badge: "bg-orange-100 text-orange-700" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-600", badge: "bg-emerald-100 text-emerald-700" },
  purple:  { bg: "bg-purple-50",  text: "text-purple-500",  badge: "bg-purple-100 text-purple-700" },
  rose:    { bg: "bg-rose-50",    text: "text-rose-500",    badge: "bg-rose-100 text-rose-700" },
  slate:   { bg: "bg-slate-100",  text: "text-slate-500",   badge: "bg-slate-100 text-slate-600" },
  indigo:  { bg: "bg-indigo-50",  text: "text-indigo-600",  badge: "bg-indigo-100 text-indigo-700" },
  amber:   { bg: "bg-amber-50",   text: "text-amber-500",   badge: "bg-amber-100 text-amber-700" },
  teal:    { bg: "bg-teal-50",    text: "text-teal-600",    badge: "bg-teal-100 text-teal-700" },
  pink:    { bg: "bg-pink-50",    text: "text-pink-500",    badge: "bg-pink-100 text-pink-700" },
};

function getTheme(colorTheme: string | null) {
  return COLOR_THEMES[colorTheme ?? "slate"] ?? COLOR_THEMES.slate;
}

// Converts any casing the DB might store into PascalCase for the Lucide namespace lookup.
// e.g. "book-open", "book_open", "BookOpen" → "BookOpen"
function toPascalCase(str: string): string {
  return str
    .replace(/[-_]+/g, " ")
    .replace(/(?:^|\s)(.)/g, (_, c: string) => c.toUpperCase())
    .replace(/\s/g, "");
}

function SubjectIcon({ iconName, size = 28 }: { iconName: string | null; size?: number }) {
  if (!iconName) {
    return <HelpCircle size={size} className="text-slate-400" />;
  }

  const key = toPascalCase(iconName);
  const keyWithSuffix = key.endsWith("Icon") ? key : `${key}Icon`;

  const icons = LucideIcons as Record<string, unknown>;

  function isValidIcon(v: unknown): v is React.ComponentType<{ size?: number; className?: string }> {
    return typeof v === "function" || (typeof v === "object" && v !== null && "$$typeof" in (v as object));
  }

  const Icon = isValidIcon(icons[key])
    ? (icons[key] as React.ComponentType<{ size?: number; className?: string }>)
    : isValidIcon(icons[keyWithSuffix])
    ? (icons[keyWithSuffix] as React.ComponentType<{ size?: number; className?: string }>)
    : null;

  if (!Icon) {
    console.warn("[SubjectIcon] No match for icon_name:", iconName, "(tried:", key, "and", keyWithSuffix + ")");
    return <HelpCircle size={size} className="text-slate-400" />;
  }

  return <Icon size={size} />;
}

// ─── Explore Subjects ─────────────────────────────────────────────────────────
interface ExploreSubjectsProps {
  subjects: SubjectItem[];
  loading: boolean;
  onToggleEnroll: (subjectId: string, enrolled: boolean) => void;
  enrollingId: string | null;
}

function ExploreSubjects({ subjects, loading, onToggleEnroll, enrollingId }: ExploreSubjectsProps) {
  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-brand-light flex items-center justify-center">
            <BookOpen className="h-3.5 w-3.5 text-brand-blue" />
          </div>
          <h2 className="text-base font-bold text-brand-navy">Explore your Subjects</h2>
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

      {loading ? (
        <div className="grid grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-3">
              <Skeleton className="w-full aspect-square rounded-2xl" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      ) : subjects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white p-10 text-center text-slate-400 text-sm">
          No subjects available yet.
        </div>
      ) : (
        <div className="grid grid-cols-6 gap-4">
          {subjects.map((subject) => {
            const theme = getTheme(subject.color_theme);
            const isEnrolling = enrollingId === subject.id;
            return (
              <div key={subject.id} className="flex flex-col items-center gap-3 group">
                <Link
                  href={`/students/quiz/view/${subject.slug}`}
                  className="w-full"
                >
                  <div
                    className={`w-full aspect-square rounded-2xl ${theme.bg} flex items-center justify-center transition-transform group-hover:scale-105 relative`}
                  >
                    <SubjectIcon iconName={subject.icon_name} size={28} />
                    {subject.isEnrolled && (
                      <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500" title="Enrolled" />
                    )}
                  </div>
                </Link>
                <div className="flex flex-col items-center gap-1 w-full">
                  <span className="text-sm font-medium text-slate-600 group-hover:text-brand-navy transition-colors text-center leading-tight line-clamp-1">
                    {subject.name}
                  </span>
                  <button
                    onClick={() => onToggleEnroll(subject.id, subject.isEnrolled)}
                    disabled={isEnrolling}
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full transition-colors disabled:opacity-50 ${
                      subject.isEnrolled
                        ? "bg-emerald-100 text-emerald-700 hover:bg-red-100 hover:text-red-600"
                        : `${theme.badge} hover:opacity-80`
                    }`}
                  >
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="mt-12 border-t border-border py-6 px-6 flex items-center justify-between">
      <p className="text-xs text-slate-400">© 2024 QuizStudio. Elevating the learning experience.</p>
      <nav className="flex items-center gap-5 text-xs text-slate-400">
        {["Privacy Policy", "Terms of Service", "Student Handbook"].map((item) => (
          <Link key={item} href="#" className="hover:text-brand-navy transition-colors">
            {item}
          </Link>
        ))}
      </nav>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function StudentDashboard() {
  const supabase = createClient();

  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [assignedQuizzes, setAssignedQuizzes] = useState<AssignedQuiz[]>([]);
  const [scoreItems, setScoreItems] = useState<ScoreItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [enrollingId, setEnrollingId] = useState<string | null>(null);

  // Single unified loading flag — true until all async work is done
  const [loading, setLoading] = useState(true);
  // Subjects have their own flag so they don't block the rest of the dashboard
  const [loadingSubjects, setLoadingSubjects] = useState(true);

  // ── Single effect fetches everything sequentially ─────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function fetchAll() {
      try {
        // 1. Auth
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) console.error("Auth error:", authError.message);
        if (!user || cancelled) return;

        // 2. Profile + student record in parallel
        const { data: studentResult, error: studentError} = await supabase
          .from("students")
          .select("id, user_id, top_percentile, overall_percentile, accuracy_rate, top_subject")
          .eq("user_id", user.id)
          .maybeSingle();

        if (cancelled) return;

        if (studentError) console.error("Student fetch error:", studentError);

        // 3. Subjects + enrollments — requires student record for subject_affiliations (student_id = students.id)
        const allSubjectsResult = await supabase
          .from("subjects")
          .select("id, name, slug, description, icon_name, color_theme")
          .order("name");

        if (cancelled) return;
        if (allSubjectsResult.error) console.error("Subjects fetch error:", allSubjectsResult.error.message);

        // subject_affiliations.student_id references students(id), not auth.users(id)
        let enrolledIds = new Set<string>();
        if (studentResult) {
          const enrolledResult = await supabase
            .from("subject_affiliations")
            .select("subject_id")
            .eq("student_id", studentResult.id);

          if (cancelled) return;
          if (enrolledResult.error) console.error("Enrollments fetch error:", enrolledResult.error.message);
          enrolledIds = new Set((enrolledResult.data ?? []).map((r) => r.subject_id));
        }

        const mappedSubjects: SubjectItem[] = (allSubjectsResult.data ?? []).map((s) => ({
          id: s.id,
          name: s.name,
          slug: s.slug,
          description: s.description,
          icon_name: s.icon_name,
          color_theme: s.color_theme,
          isEnrolled: enrolledIds.has(s.id),
        }));

        // 4. Quiz affiliations (assigned quizzes) + subject scores — only if a student record exists
        let mappedQuizzes: AssignedQuiz[] = [];
        let mappedScores: ScoreItem[] = [];
        let completed = 0;
        let totalAttempts = 0;

        if (studentResult) {
          const [affiliationsResult, attemptsCountResult, scoresResult] = await Promise.all([
            // Primary source for assigned quizzes: quiz_affiliations joined to quizzes
            supabase
              .from("quiz_affiliations")
              .select(`
                student_id,
                quiz_id,
                assigned_at,
                status,
                quizzes (
                  id,
                  name,
                  subtitle,
                  difficulty,
                  duration_minutes,
                  passing_score,
                  question_count,
                  participant_count,
                  cover_gradient,
                  topics,
                  join_code,
                  closed_at,
                  status
                )
              `)
              .eq("student_id", studentResult.id)
              .order("assigned_at", { ascending: false }),
            // Keep attempt counts for the Overall Progress widget
            supabase
              .from("quiz_attempts")
              .select("id, status")
              .eq("student_id", studentResult.id),
            supabase
              .from("student_subject_scores")
              .select(`
                id,
                score,
                recorded_at,
                subjects (
                  name,
                  code
                )
              `)
              .eq("student_id", studentResult.id)
              .order("recorded_at", { ascending: false })
              .limit(10),
          ]);

          if (cancelled) return;
          if (affiliationsResult.error) console.error("Affiliations fetch error:", affiliationsResult.error.message);
          if (attemptsCountResult.error) console.error("Attempts count error:", attemptsCountResult.error.message);
          if (scoresResult.error) console.error("Scores fetch error:", scoresResult.error.message);

          // Overall progress counts come from actual quiz_attempts
          const attemptRows = attemptsCountResult.data ?? [];
          completed = attemptRows.filter((a) => a.status === "submitted").length;
          totalAttempts = attemptRows.length;

          // Assigned quizzes come from quiz_affiliations
          // Show only quizzes that are: affiliation status != "completed", quiz published & not closed
          const typedAffiliations = (affiliationsResult.data ?? []) as unknown as QuizAffiliationRow[];
          const now = new Date();
          const activeAffiliations = typedAffiliations.filter((a) => {
            const q = a.quizzes;
            if (!q) return false; // orphaned affiliation — quiz was deleted
            const notCompleted = a.status !== "completed";
            const quizPublished = q.status === "published";
            const notClosed = !q.closed_at || new Date(q.closed_at) > now;
            return notCompleted && quizPublished && notClosed;
          }); // full list — UI caps display at 4 and shows total count

          mappedQuizzes = activeAffiliations.map((a) => {
            const { tag, tagVariant } = deriveQuizTag(a.quizzes);
            const durationMinutes = a.quizzes.duration_minutes;
            return {
              id: a.quizzes.id,
              tag,
              tagVariant,
              title: a.quizzes.name,
              subtitle: a.quizzes.subtitle ?? "",
              difficulty: a.quizzes.difficulty ?? null,
              durationMinutes: durationMinutes ?? null,
              passingScore: a.quizzes.passing_score ?? null,
              questionCount: a.quizzes.question_count,
              coverGradient: a.quizzes.cover_gradient ?? null,
              topics: a.quizzes.topics ?? null,
              joinCode: a.quizzes.join_code ?? null,
              participants: a.quizzes.participant_count > 0 ? a.quizzes.participant_count : undefined,
              meta: durationMinutes ? `${durationMinutes} min` : undefined,
              metaIsTime: durationMinutes != null ? true : undefined,
              affiliationStatus: a.status,
              assignedAt: a.assigned_at,
            };
          });

          const typedScores = ((scoresResult.data ?? []) as unknown as SubjectScore[]);
          const seenSubjectsMap = new Map<string, SubjectScore>();
          for (const item of typedScores) {
            if (!seenSubjectsMap.has(item.subjects.code)) {
              seenSubjectsMap.set(item.subjects.code, item);
            }
          }
          mappedScores = Array.from(seenSubjectsMap.values())
            .slice(0, 3)
            .map((item) => {
              const { icon, iconBg } = getScoreIcon(item.score);
              return {
                id: item.id,
                subject: item.subjects.name.toUpperCase(),
                score: `Score: ${Math.round(item.score)}/100`,
                icon,
                iconBg,
              };
            });
        }

        // 5. Single batched state update — no cascading renders
        if (!cancelled) {
          if (studentResult) setStudentData(studentResult);
          setCompletedCount(completed);
          setTotalCount(totalAttempts);
          setAssignedQuizzes(mappedQuizzes);
          setScoreItems(mappedScores);
          setSubjects(mappedSubjects);
          setLoadingSubjects(false);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        toast.error("Failed to load dashboard data");
      } finally {
        if (!cancelled) {
          setLoading(false);
          setLoadingSubjects(false);
        }
      }
    }

    fetchAll();

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const overallLoading = loading;

  // ── Enroll / unenroll handler ─────────────────────────────────────────────
  // subject_affiliations.student_id references students(id), not auth.users(id)
  const studentId = studentData?.id;

  const handleToggleEnroll = useCallback(async (subjectId: string, enrolled: boolean) => {
    if (!studentId) return;
    setEnrollingId(subjectId);
    try {
      if (enrolled) {
        const { error } = await supabase
          .from("subject_affiliations")
          .delete()
          .eq("subject_id", subjectId)
          .eq("student_id", studentId);
        if (error) throw error;
        toast.success("Left subject");
      } else {
        const { error } = await supabase
          .from("subject_affiliations")
          .insert({ subject_id: subjectId, student_id: studentId });
        if (error) throw error;
        toast.success("Joined subject!");
      }
      // Optimistic update
      setSubjects((prev) =>
        prev.map((s) => s.id === subjectId ? { ...s, isEnrolled: !enrolled } : s)
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Please try again.";
      toast.error("Failed to update enrollment", { description: msg });
    } finally {
      setEnrollingId(null);
    }
  }, [studentId, supabase]);

  return (
    <div className="flex min-h-screen bg-surface flex-1 flex-col">
      <main className="flex-1 px-6 py-6 space-y-7">
        {/* Hero row: join banner + progress */}
        <div className="grid grid-cols-[1fr_300px] gap-5">
          <JoinQuizBanner />
          <OverallProgress
            studentData={studentData}
            completedCount={completedCount}
            totalCount={totalCount}
            loading={overallLoading}
          />
        </div>

        {/* Quizzes + scores */}
        <div className="grid grid-cols-[1fr_280px] gap-5 items-start">
          <AssignedQuizzes quizzes={assignedQuizzes} loading={loading} totalCount={assignedQuizzes.length} />
          <PerformanceScores scores={scoreItems} loading={loading} />
        </div>

        {/* Subjects */}
        <ExploreSubjects
          subjects={subjects}
          loading={loadingSubjects}
          onToggleEnroll={handleToggleEnroll}
          enrollingId={enrollingId}
        />
      </main>

      <Footer />
    </div>
  );
}