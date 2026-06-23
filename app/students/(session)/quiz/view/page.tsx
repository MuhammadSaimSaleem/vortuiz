"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import * as LucideIcons from "lucide-react";
import {
  BookOpen,
  Clock,
  FileText,
  Filter,
  Search,
  Star,
  Target,
  ChevronRight,
  Lock,
  PlayCircle,
  TrendingUp,
  Layers,
  HelpCircle,
  BarChart2,
  RefreshCw,
  ServerCrash,
  Users,
  Shield,
} from "lucide-react";
import { toPascalCase } from "@/lib/utils";
import { useProfile } from "@/contexts/ProfileContext";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Subject {
  id: string;
  name: string;
  slug: string;
  icon_name: string | null;
  color_theme: string | null;
}

interface Quiz {
  id: string;
  name: string;
  subtitle: string | null;
  description: string | null;
  difficulty: string | null;
  duration_minutes: number | null;
  passing_score: number | null;
  participant_count: number;
  status: string;
  closed_at: string | null;
  cover_gradient: string | null;
  topics: string[] | null;
  subject_id: string;
  affiliationStatus: string | null; // from quiz_affiliations.status
  // Joined from subjects
  subject?: Subject;
}

// ─── Color theme map ──────────────────────────────────────────────────────────
const COLOR_THEMES: Record<
  string,
  { subjectBg: string; subjectText: string; coverGradient: string }
> = {
  blue:    { subjectBg: "bg-blue-100",    subjectText: "text-blue-700",    coverGradient: "from-blue-950 via-indigo-900 to-blue-800"    },
  orange:  { subjectBg: "bg-orange-100",  subjectText: "text-orange-700",  coverGradient: "from-orange-950 via-amber-900 to-yellow-800"  },
  emerald: { subjectBg: "bg-emerald-100", subjectText: "text-emerald-700", coverGradient: "from-green-950 via-emerald-900 to-green-800"  },
  purple:  { subjectBg: "bg-purple-100",  subjectText: "text-purple-700",  coverGradient: "from-purple-950 via-violet-900 to-purple-800" },
  rose:    { subjectBg: "bg-rose-100",    subjectText: "text-rose-700",    coverGradient: "from-rose-950 via-pink-900 to-rose-800"       },
  teal:    { subjectBg: "bg-teal-100",    subjectText: "text-teal-700",    coverGradient: "from-teal-950 via-cyan-900 to-teal-800"       },
  indigo:  { subjectBg: "bg-indigo-100",  subjectText: "text-indigo-700",  coverGradient: "from-indigo-950 via-blue-900 to-indigo-800"   },
  amber:   { subjectBg: "bg-amber-100",   subjectText: "text-amber-700",   coverGradient: "from-amber-950 via-orange-900 to-amber-800"   },
  slate:   { subjectBg: "bg-slate-100",   subjectText: "text-slate-600",   coverGradient: "from-slate-900 via-slate-800 to-slate-700"    },
};

function getTheme(colorTheme: string | null) {
  return COLOR_THEMES[colorTheme ?? "slate"] ?? COLOR_THEMES.slate;
}

function isValidIcon(
  v: unknown
): v is React.ComponentType<{ size?: number; className?: string }> {
  return (
    typeof v === "function" ||
    (typeof v === "object" && v !== null && "$$typeof" in (v as object))
  );
}

function SubjectIcon({
  iconName,
  className = "",
}: {
  iconName: string | null;
  className?: string;
}) {
  if (!iconName) return <HelpCircle className={className || "h-3.5 w-3.5 text-slate-400"} />;

  const key = toPascalCase(iconName);
  const icons = LucideIcons as Record<string, unknown>;
  const Icon =
    isValidIcon(icons[key])
      ? (icons[key] as React.ComponentType<{ className?: string }>)
      : isValidIcon(icons[`${key}Icon`])
      ? (icons[`${key}Icon`] as React.ComponentType<{ className?: string }>)
      : null;

  if (!Icon) return <HelpCircle className={className || "h-3.5 w-3.5 text-slate-400"} />;
  return <Icon className={className} />;
}

// ─── Difficulty helpers ───────────────────────────────────────────────────────
function difficultyConfig(d: string | null): { label: string; color: string; bg: string } {
  switch ((d ?? "").toLowerCase()) {
    case "beginner":
      return { label: "Beginner", color: "text-emerald-700", bg: "bg-emerald-50 border border-emerald-200" };
    case "intermediate":
      return { label: "Intermediate", color: "text-amber-700", bg: "bg-amber-50 border border-amber-200" };
    case "advanced":
      return { label: "Advanced", color: "text-rose-700", bg: "bg-rose-50 border border-rose-200" };
    default:
      return { label: d ?? "Quiz", color: "text-slate-600", bg: "bg-slate-100" };
  }
}

// ─── Error state ──────────────────────────────────────────────────────────────
function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      <div className="h-16 w-16 rounded-2xl bg-rose-50 flex items-center justify-center">
        <ServerCrash className="h-7 w-7 text-rose-400" />
      </div>
      <div>
        <p className="font-bold text-brand-navy text-lg mb-1">Something went wrong</p>
        <p className="text-sm text-slate-400 max-w-sm">{message}</p>
      </div>
      <Button
        onClick={onRetry}
        className="rounded-xl text-sm font-semibold gap-2 bg-brand-navy hover:bg-brand-blue text-white mt-1"
      >
        <RefreshCw className="h-4 w-4" />
        Try Again
      </Button>
    </div>
  );
}

// ─── Quiz Card ────────────────────────────────────────────────────────────────
function QuizCard({ quiz }: { quiz: Quiz }) {
  const subject = quiz.subject;
  const theme = getTheme(subject?.color_theme ?? null);
  const diff = difficultyConfig(quiz.difficulty);
  const isClosed = quiz.closed_at ? new Date(quiz.closed_at) < new Date() : false;

  // Derive canonical status exclusively from quiz_affiliations status
  const affStatus = quiz.affiliationStatus?.toLowerCase() ?? null;
  const isCompleted  = affStatus === "completed" || affStatus === "submitted";
  const isInProgress = affStatus === "in_progress";
  const isAvailable  = affStatus === "available" && !isClosed;
  const isLocked     = !isCompleted && !isInProgress && !isAvailable;

  const startHref   = `/students/quiz/${quiz.id}/start`;
  const resultsHref = `/students/quiz/${quiz.id}/result`;
  const cardHref    = `/students/quiz/${quiz.id}/view`;

  const router = useRouter();

  function handleCardClick(e: React.MouseEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).closest("[data-cta]")) return;
    if (isCompleted) router.push(resultsHref);
    else if (!isLocked) router.push(cardHref);
  }

  // Status badge shown on the cover
  const statusBadge = isCompleted ? (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">
      Completed
    </span>
  ) : isInProgress ? (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700">
      In Progress
    </span>
  ) : isAvailable ? (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700">
      Available
    </span>
  ) : isClosed ? (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-700 text-slate-200">
      Closed
    </span>
  ) : (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-500">
      Not Available
    </span>
  );

  const coverGradient =
    quiz.cover_gradient?.trim()
      ? quiz.cover_gradient
      : `bg-gradient-to-br ${theme.coverGradient}`;

  return (
    <div
      role="link"
      tabIndex={isLocked ? -1 : 0}
      onClick={handleCardClick}
      onKeyDown={(e) => { if (e.key === "Enter" && !isLocked) router.push(cardHref); }}
      className={`group block rounded-2xl border border-border bg-white overflow-hidden transition-all duration-200
        ${isLocked ? "opacity-60 cursor-not-allowed" : "hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"}`}
    >
      {/* Cover */}
      <div
        className={`relative h-28 bg-linear-to-br ${coverGradient} overflow-hidden`}
        style={quiz.cover_gradient ? { background: quiz.cover_gradient } : undefined}
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 70%, white 0%, transparent 50%), radial-gradient(circle at 80% 20%, white 0%, transparent 40%)",
          }}
        />

        {/* Difficulty badge */}
        <div className="absolute top-3 left-3">
          <span className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm border border-white/30 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
            <Star className="h-2.5 w-2.5 fill-white" />
            {diff.label.toUpperCase()}
          </span>
        </div>

        {/* Status badge */}
        <div className="absolute top-3 right-3">{statusBadge}</div>

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
      <div className="p-4 flex flex-col gap-3">
        {/* Subject + difficulty chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {subject && (
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${theme.subjectBg} ${theme.subjectText}`}
            >
              <SubjectIcon iconName={subject.icon_name} className="h-3 w-3" />
              {subject.name}
            </span>
          )}
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${diff.bg} ${diff.color}`}>
            {diff.label}
          </span>
        </div>

        {/* Title + subtitle */}
        <div>
          <h3 className="text-sm font-bold text-brand-dark leading-tight group-hover:text-brand-navy transition-colors">
            {quiz.name?.trim() || <span className="italic opacity-60">Untitled Quiz</span>}
          </h3>
          {quiz.subtitle?.trim() && (
            <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{quiz.subtitle}</p>
          )}
        </div>

        {quiz.description?.trim() && (
          <p className="text-xs text-brand-subtitle leading-relaxed line-clamp-2">
            {quiz.description}
          </p>
        )}

        {/* Stats row */}
        <div className="flex items-center gap-3 pt-2 border-t border-border">
          {quiz.duration_minutes != null && quiz.duration_minutes > 0 && (
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Clock className="h-3 w-3" />
              {quiz.duration_minutes}m
            </div>
          )}
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <FileText className="h-3 w-3" />
            Questions
          </div>
          {quiz.passing_score != null && quiz.passing_score > 0 && (
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Target className="h-3 w-3" />
              {quiz.passing_score}%
            </div>
          )}
          {quiz.participant_count > 0 && (
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Users className="h-3 w-3" />
              {quiz.participant_count.toLocaleString()}
            </div>
          )}
          <ChevronRight className="h-3.5 w-3.5 text-slate-300 ml-auto group-hover:text-brand-blue transition-colors group-hover:translate-x-0.5" />
        </div>

        {/* CTA button — driven entirely by affiliation status */}
        <div className="mt-auto" data-cta>
          {isCompleted ? (
            <Link href={resultsHref}>
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs h-9 gap-1.5 transition-colors">
                <BarChart2 className="h-3.5 w-3.5" />
                View Results
              </Button>
            </Link>
          ) : isInProgress ? (
            <Link href={startHref}>
              <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-xs h-9 gap-1.5 transition-colors">
                <PlayCircle className="h-3.5 w-3.5" />
                Continue Quiz
              </Button>
            </Link>
          ) : isAvailable ? (
            <Link href={startHref}>
              <Button className="w-full bg-brand-navy hover:bg-brand-blue text-white rounded-xl font-bold text-xs h-9 gap-1.5 transition-all hover:shadow-md hover:shadow-brand-navy/20">
                <PlayCircle className="h-3.5 w-3.5" />
                Start Quiz
              </Button>
            </Link>
          ) : (
            <Button
              disabled
              className="w-full bg-slate-100 text-slate-400 rounded-xl font-bold text-xs h-9 cursor-not-allowed"
            >
              {isClosed ? "Quiz Closed" : "Not Available"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton card ────────────────────────────────────────────────────────────
function QuizCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-white overflow-hidden">
      <Skeleton className="h-28 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <div className="flex gap-1.5">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <div className="flex gap-3 pt-2 border-t border-border">
          <Skeleton className="h-3 w-8" />
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-3 w-8" />
        </div>
        <Skeleton className="h-9 w-full rounded-xl" />
      </div>
    </div>
  );
}

// ─── Stat chip skeleton ───────────────────────────────────────────────────────
function StatChipSkeleton() {
  return <Skeleton className="h-7 w-28 rounded-full" />;
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function QuizPage() {
  const { profile } = useProfile();

  const [quizzes,    setQuizzes]    = useState<Quiz[]>([]);
  const [subjects,   setSubjects]   = useState<Subject[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Search / filter state
  const [search,     setSearch]     = useState("");
  const [filterDiff, setFilterDiff] = useState("all");
  const [filterSubj, setFilterSubj] = useState("all");
  const [filterStat, setFilterStat] = useState("all");

  const handleRetry = useCallback(() => {
    setFetchError(null);
    setLoading(true);
    setRetryCount((c) => c + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setFetchError(null);

      try {
        if (!profile?.id) {
          if (!cancelled) {
            setQuizzes([]);
            setSubjects([]);
          }
          return;
        }

        // 2. Fetch assigned quizzes via quiz_affiliations
        const { data: affiliationsData, error: affiliationsError } = await supabase
          .from("quiz_affiliations")
          .select(`
            quiz_id,
            status,
            assigned_at,
            quizzes (
              id,
              name,
              subtitle,
              description,
              difficulty,
              duration_minutes,
              passing_score,
              participant_count,
              status,
              closed_at,
              cover_gradient,
              topics,
              subject_id,
              subjects (
                id,
                name,
                slug,
                icon_name,
                color_theme
              )
            )
          `)
          .eq("student_id", profile?.id)
          .order("assigned_at", { ascending: false });

        if (affiliationsError) throw affiliationsError;

        // 3. Extract and normalise quizzes from affiliations
        const normalised: Quiz[] = (affiliationsData ?? [])
          .filter((a) => a.quizzes != null && (a.quizzes as unknown as { status: string }).status === "published")
          .map((a) => {
            const q = a.quizzes as unknown as Quiz & { subjects: Subject | Subject[] | null };
            return {
              ...q,
              affiliationStatus: a.status ?? null,
              subject: Array.isArray(q.subjects) ? q.subjects[0] : (q.subjects ?? undefined),
            };
          });

        // 4. Collect unique subjects for the filter dropdown
        const subjectMap = new Map<string, Subject>();
        for (const q of normalised) {
          if (q.subject && !subjectMap.has(q.subject.id)) {
            subjectMap.set(q.subject.id, q.subject);
          }
        }
        const derivedSubjects = Array.from(subjectMap.values()).sort((a, b) =>
          a.name.localeCompare(b.name)
        );

        if (!cancelled) {
          setSubjects(derivedSubjects);
          setQuizzes(normalised);
        }
      } catch (err) {
        console.error("QuizPage fetch error:", err);
        if (!cancelled) {
          setFetchError(
            err instanceof Error
              ? err.message
              : "We couldn't load the quiz data. Please check your connection and try again."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [profile?.id, retryCount]);

  // ── Derived / memoised values ─────────────────────────────────────────────
  const filtered = useMemo(() => {
    return quizzes.filter((q) => {
      const name = q.name?.toLowerCase() ?? "";
      const subjectName = q.subject?.name?.toLowerCase() ?? "";
      const matchSearch =
        !search.trim() ||
        name.includes(search.toLowerCase()) ||
        subjectName.includes(search.toLowerCase());
      const matchDiff =
        filterDiff === "all" ||
        (q.difficulty ?? "").toLowerCase() === filterDiff.toLowerCase();
      const matchSubj =
        filterSubj === "all" || q.subject_id === filterSubj;
      
      const affStatus = q.affiliationStatus?.toLowerCase() ?? "";
      const derivedStatus =
        affStatus === "completed" || affStatus === "submitted"
          ? "completed"
          : affStatus === "in_progress"
          ? "in-progress"
          : q.closed_at && new Date(q.closed_at) < new Date()
          ? "closed"
          : "available";

      const matchStat = filterStat === "all" || derivedStatus === filterStat;
      return matchSearch && matchDiff && matchSubj && matchStat;
    });
  }, [quizzes, search, filterDiff, filterSubj, filterStat]);

  const stats = useMemo(() => {
    const total     = quizzes.length;
    const available = quizzes.filter((q) => q.affiliationStatus === "available" || !q.affiliationStatus).length;
    const inProg    = quizzes.filter((q) => q.affiliationStatus === "in_progress").length;
    const completed = quizzes.filter((q) => q.affiliationStatus === "completed" || q.affiliationStatus === "submitted").length;
    return { total, available, inProg, completed };
  }, [quizzes]);

  const clearFilters = useCallback(() => {
    setSearch("");
    setFilterDiff("all");
    setFilterSubj("all");
    setFilterStat("all");
  }, []);

  const hasActiveFilters =
    filterDiff !== "all" || filterSubj !== "all" || filterStat !== "all" || search.trim() !== "";

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-full bg-surface p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark tracking-tight">My Quizzes</h1>
          <p className="text-sm text-brand-subtitle mt-0.5">Select a quiz to begin your assessment.</p>
        </div>
      </div>

      {/* Error state */}
      {fetchError && <ErrorState message={fetchError} onRetry={handleRetry} />}

      {/* Stat chips */}
      {!fetchError && (
        <div className="flex items-center gap-3 flex-wrap">
          {loading ? (
            <>
              <StatChipSkeleton />
              <StatChipSkeleton />
              <StatChipSkeleton />
              <StatChipSkeleton />
            </>
          ) : (
            <>
              {[
                { icon: <Layers className="h-3.5 w-3.5" />,    label: `${stats.total} Total`,          color: "bg-brand-light text-brand-navy"  },
                { icon: <PlayCircle className="h-3.5 w-3.5" />, label: `${stats.available} Available`,  color: "bg-blue-50 text-blue-700"         },
                { icon: <TrendingUp className="h-3.5 w-3.5" />, label: `${stats.inProg} In Progress`,   color: "bg-amber-50 text-amber-700"       },
                { icon: <Shield className="h-3.5 w-3.5" />,     label: `${stats.completed} Completed`,  color: "bg-emerald-50 text-emerald-700"   },
              ].map((chip) => (
                <span
                  key={chip.label}
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${chip.color}`}
                >
                  {chip.icon}
                  {chip.label}
                </span>
              ))}
            </>
          )}
        </div>
      )}

      {/* Search + filters */}
      {!fetchError && (
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-50 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search quizzes…"
              className="h-9 pl-9 text-sm bg-white border-border focus-visible:ring-brand-blue rounded-xl"
            />
          </div>

          {/* Subject filter */}
          <Select value={filterSubj} onValueChange={setFilterSubj}>
            <SelectTrigger className="h-9 text-sm border-border rounded-xl focus:ring-brand-blue">
              <Filter className="h-3.5 w-3.5 text-slate-400 mr-1.5 shrink-0" />
              <SelectValue placeholder="Subject" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Difficulty filter */}
          <Select value={filterDiff} onValueChange={setFilterDiff}>
            <SelectTrigger className="h-9 text-sm border-border rounded-xl w-40 focus:ring-brand-blue">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>

          {/* Status filter */}
          <Select value={filterStat} onValueChange={setFilterStat}>
            <SelectTrigger className="h-9 text-sm border-border rounded-xl w-40 focus:ring-brand-blue">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs font-semibold text-brand-blue hover:opacity-70 transition-opacity"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Grid */}
      {!fetchError && (
        <>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <QuizCardSkeleton key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="h-14 w-14 rounded-2xl bg-brand-light flex items-center justify-center">
                {hasActiveFilters ? (
                  <Search className="h-7 w-7 text-brand-blue" />
                ) : (
                  <BookOpen className="h-7 w-7 text-brand-blue" />
                )}
              </div>
              <p className="text-sm font-semibold text-brand-dark">
                {hasActiveFilters ? "No quizzes match your filters" : "No quizzes assigned yet"}
              </p>
              <p className="text-xs text-brand-subtitle">
                {hasActiveFilters
                  ? "Try adjusting your search or filters"
                  : "Your teacher hasn't assigned any quizzes yet"}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs font-semibold text-brand-blue hover:opacity-70 transition-opacity mt-1"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Result count badge */}
              {hasActiveFilters && (
                <div className="flex items-center gap-2">
                  <Badge className="bg-brand-light text-brand-navy border-0 text-[11px] font-semibold">
                    {filtered.length} {filtered.length === 1 ? "result" : "results"}
                  </Badge>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((quiz) => (
                  <QuizCard
                    key={quiz.id}
                    quiz={quiz}
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}