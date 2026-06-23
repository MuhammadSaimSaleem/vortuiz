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
  PlayCircle,
  Layers,
  HelpCircle,
  BarChart2,
  RefreshCw,
  ServerCrash,
  Users,
  Shield,
  XCircle,
} from "lucide-react";
import { toPascalCase } from "@/lib/utils";
import { useProfile } from "@/contexts/ProfileContext";
import { Quiz, Subject, QuizStatus } from "@/lib/data";

// Normalised quiz type with an attached subject object (from the join)
type NormalisedQuiz = Quiz & { subject?: Subject | null; subjects?: unknown };

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
    case "easy":
      return { label: "Beginner", color: "text-emerald-700", bg: "bg-emerald-50 border border-emerald-200" };
    case "intermediate":
      return { label: "Intermediate", color: "text-amber-700", bg: "bg-amber-50 border border-amber-200" };
    case "hard":
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
function QuizCard({ quiz }: { quiz: NormalisedQuiz }) {
  const subject = quiz.subject;
  const theme = getTheme(subject?.color_theme ?? null);
  const diff = difficultyConfig(quiz.difficulty);

  const cardHref = `/teachers/quiz/${quiz.id}/view`;
  const router = useRouter();

  function handleCardClick(e: React.MouseEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).closest("[data-cta]")) return;
    router.push(cardHref);
  }

  // Status badge shown on the cover
  const statusBadge = quiz.status === "published" ? (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700">
      Published
    </span>
  ) : quiz.status === "unavailable" ? (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-700 text-slate-200">
      Unavailable
    </span>
  ) : (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-500">
      Draft
    </span>
  );

  const coverGradient =
    quiz.coverGradient?.trim()
      ? quiz.coverGradient
      : `bg-gradient-to-br ${theme.coverGradient}`;

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={(e) => { if (e.key === "Enter") router.push(cardHref); }}
      className="group block rounded-2xl border border-border bg-white overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
    >
      {/* Cover */}
      <div
        className={`relative h-28 bg-linear-to-br ${coverGradient} overflow-hidden`}
        style={quiz.coverGradient ? { background: quiz.coverGradient } : undefined}
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

        {/* View hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
          <PlayCircle className="h-10 w-10 text-white drop-shadow-lg" />
        </div>
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

        {/* Title */}
        <div>
          <h3 className="text-sm font-bold text-brand-dark leading-tight group-hover:text-brand-navy transition-colors">
            {quiz.name?.trim() || <span className="italic opacity-60">Untitled Quiz</span>}
          </h3>
        </div>
        
        {/* Description */}
        <div className="h-[1.5lh]">
          {quiz.desc?.trim() &&
            <p className="text-xs text-brand-subtitle leading-relaxed line-clamp-2">
              {quiz.desc}
            </p>
          }
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 pt-2 border-t border-border">
          {quiz.timeLimit != null && quiz.timeLimit > 0 && (
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Clock className="h-3 w-3" />
              {quiz.timeLimit}m
            </div>
          )}
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <FileText className="h-3 w-3" />
            {quiz.questionCount} {quiz.questionCount === 1 ? "question" : "questions"}
          </div>
          {quiz.passingMarks && quiz.totalMarks && (
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Target className="h-3 w-3" />
              {quiz.passingMarks} marks required out of {quiz.totalMarks}
            </div>
          )}
          {quiz.participantCount > 0 && (
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Users className="h-3 w-3" />
              {quiz.participantCount.toLocaleString()}
            </div>
          )}
          <ChevronRight className="h-3.5 w-3.5 text-slate-300 ml-auto group-hover:text-brand-blue transition-colors group-hover:translate-x-0.5" />
        </div>

        {/* CTA button */}
        <div className="mt-auto" data-cta>
          <Link href={cardHref}>
            <Button
              className={`w-full rounded-xl font-bold text-xs h-9 gap-1.5 transition-all ${
                quiz.status === "unavailable"
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "bg-brand-navy hover:bg-brand-blue text-white hover:shadow-md hover:shadow-brand-navy/20"
              }`}
            >
              {quiz.status === "unavailable" ? (
                <>
                  <XCircle className="h-3.5 w-3.5" />
                  Unavailable
                </>
              ) : (
                <>
                  <BarChart2 className="h-3.5 w-3.5" />
                  View Quiz
                </>
              )}
            </Button>
          </Link>
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

  const [quizzes,    setQuizzes]    = useState<NormalisedQuiz[]>([]);
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

        // 2. Fetch quizzes created by this teacher
        const { data: quizData, error: quizError } = await supabase
          .from("quizzes")
          .select(`
            id,
            name,
            topics,
            description,
            difficulty,
            time_limit,
            total_marks,
            passing_marks,
            participant_count,
            question_count,
            status,
            closed_at,
            cover_gradient,
            subject_id,
            subjects (
              id,
              name,
              slug,
              icon_name,
              color_theme
            )
          `)
          .eq("creator_id", profile?.id)
          .order("created_at", { ascending: false });

        if (quizError) throw quizError;

        // Supabase may return subjects as an array or a single object — normalise either
        function extractSubject(raw: unknown): Subject | null {
          if (!raw) return null;
          if (Array.isArray(raw)) return (raw[0] as Subject) ?? null;
          return raw as Subject;
        }

        // Derive unique subjects from returned quizzes
        const subjectMap = new Map<string, Subject>();
        for (const q of quizData ?? []) {
          const s = extractSubject(q.subjects);
          if (s && !subjectMap.has(s.id)) subjectMap.set(s.id, s);
        }

        const derivedSubjects = Array.from(subjectMap.values()).sort((a, b) =>
          a.name.localeCompare(b.name)
        );

        // Normalise quiz shape: map DB fields to app `Quiz` shape and attach `subject`
        const normalised: NormalisedQuiz[] = (quizData ?? []).map((q: Record<string, unknown>) => {
          const subj = extractSubject(q['subjects']);
          return {
            // map fields from Supabase row to our `Quiz` interface
            id: String(q['id'] ?? ""),
            creatorID: String(q['creator_id'] ?? profile?.id ?? ""),
            subjectID: String(q['subject_id'] ?? subj?.id ?? ""),
            name: String(q['name'] ?? ""),
            topic: Array.isArray(q['topics']) ? (q['topics'] as string[]).join(",") : String(q['topics'] ?? ""),
            desc: String(q['description'] ?? ""),
            timeLimit: Number(q['timeLimit'] ?? q['time_limit'] ?? 0),
            gradingType: String(q['grading_type'] ?? "standard"),
            totalMarks: Number(q['total_marks'] ?? q['totalMarks'] ?? 0),
            passingMarks: Number(q['passing_marks'] ?? q['passingMarks'] ?? 0),
            questionCount: Number(q['questionCount'] ?? q['question_count'] ?? 0),
            difficulty: String(q['difficulty'] ?? ""),
            joinCode: String(q['join_code'] ?? ""),
            status: (String(q['status'] ?? 'draft') as unknown) as QuizStatus,
            participantCount: Number(q['participantCount'] ?? q['participant_count'] ?? 0),
            coverGradient: String(q['cover_gradient'] ?? q['coverGradient'] ?? ""),
            createdAt: typeof q['created_at'] === 'string' ? String(q['created_at']) : undefined,
            closedAt: q['closed_at'] ?? null,
            // attached helpful data
            subject: subj,
            subjects: q['subjects'],
          } as NormalisedQuiz;
        });

        if (!cancelled) {
          setSubjects(derivedSubjects);
          setQuizzes(normalised);
          setLoading(false);
        }
      } catch (err) {
        console.error("QuizPage fetch error:", err);
        if (!cancelled) {
          setFetchError(
            err instanceof Error
              ? err.message
              : "We couldn't load the quiz data. Please check your connection and try again."
          );
          setLoading(false);
        }
      }
    }

    if (profile?.id) fetchData();
    return () => {
      cancelled = true;
    };
  }, [profile?.id, retryCount]);

  // ── Derived stats ─────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total       = quizzes.length;
    const published   = quizzes.filter((q) => q.status === "published").length;
    const unavailable = quizzes.filter((q) => q.status === "unavailable").length;
    const drafts      = quizzes.filter((q) => q.status === "draft").length;
    return { total, published, unavailable, drafts };
  }, [quizzes]);

  // ── Filtered list ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return quizzes.filter((q) => {
      const name        = q.name?.toLowerCase() ?? "";
      const subjectName = q.subject?.name?.toLowerCase() ?? "";
      const matchSearch =
        !search.trim() ||
        name.includes(search.toLowerCase()) ||
        subjectName.includes(search.toLowerCase());

      const matchDiff =
        filterDiff === "all" ||
        (q.difficulty ?? "").toLowerCase() === filterDiff.toLowerCase();

      const matchSubj =
        filterSubj === "all" || q.subjectID === filterSubj;

      const matchStat = filterStat === "all" || q.status === filterStat;
      return matchSearch && matchDiff && matchSubj && matchStat;
    });
  }, [quizzes, search, filterDiff, filterSubj, filterStat]);

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
          <p className="text-sm text-brand-subtitle mt-0.5">Quizzes you have created.</p>
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
                { icon: <Layers className="h-3.5 w-3.5" />,       label: `${stats.total} Total`,           color: "bg-brand-light text-brand-navy"  },
                { icon: <PlayCircle className="h-3.5 w-3.5" />,    label: `${stats.published} Published`,   color: "bg-blue-50 text-blue-700"        },
                { icon: <XCircle className="h-3.5 w-3.5" />,       label: `${stats.unavailable} Unavailable`, color: "bg-slate-100 text-slate-600"   },
                { icon: <Shield className="h-3.5 w-3.5" />,        label: `${stats.drafts} Drafts`,         color: "bg-amber-50 text-amber-700"      },
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
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="unavailable">Unavailable</SelectItem>
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
                {hasActiveFilters ? "No quizzes match your filters" : "No quizzes created yet"}
              </p>
              <p className="text-xs text-brand-subtitle">
                {hasActiveFilters
                  ? "Try adjusting your search or filters"
                  : "You haven't created any quizzes yet"}
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
              {hasActiveFilters && (
                <div className="flex items-center gap-2">
                  <Badge className="bg-brand-light text-brand-navy border-0 text-[11px] font-semibold">
                    {filtered.length} {filtered.length === 1 ? "result" : "results"}
                  </Badge>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((quiz) => (
                  <QuizCard key={quiz.id} quiz={quiz} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}