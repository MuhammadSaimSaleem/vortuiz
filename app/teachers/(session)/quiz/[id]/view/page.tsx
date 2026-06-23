"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import * as LucideIcons from "lucide-react";
import {
  FileText,
  Flag,
  Star,
  Timer,
  Wifi,
  PlayCircle,
  ChevronLeft,
  HelpCircle,
  CalendarDays,
  Target,
  Lock,
} from "lucide-react";
import { toPascalCase } from "@/lib/utils";
import { useProfile } from "@/contexts/ProfileContext";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Subject {
  id: string;
  name: string;
  slug: string;
  description: string | null;
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
  created_at: string;
  status: string;
  closed_at: string | null;
  cover_gradient: string | null;
  topics: string[] | null;
  subject_id: string;
  subject?: Subject;
  affiliationStatus: string | null;
}

// ─── Color theme map ──────────────────────────────────────────────────────────
const COLOR_THEMES: Record<string, {
  bg: string; text: string; badge: string;
  coverFrom: string; coverVia: string; coverTo: string;
  accent: string; subtleText: string;
}> = {
  blue:    { bg: "bg-blue-50",    text: "text-blue-600",    badge: "bg-blue-100 text-blue-700",       coverFrom: "from-blue-950",    coverVia: "via-indigo-900",  coverTo: "to-blue-800",    accent: "bg-blue-400/10",    subtleText: "text-blue-200"    },
  orange:  { bg: "bg-orange-50",  text: "text-orange-500",  badge: "bg-orange-100 text-orange-700",   coverFrom: "from-orange-950", coverVia: "via-amber-900",   coverTo: "to-yellow-800",  accent: "bg-amber-400/10",   subtleText: "text-amber-200"   },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-600", badge: "bg-emerald-100 text-emerald-700", coverFrom: "from-green-950",  coverVia: "via-emerald-900", coverTo: "to-green-800",   accent: "bg-green-400/10",   subtleText: "text-emerald-200" },
  purple:  { bg: "bg-purple-50",  text: "text-purple-500",  badge: "bg-purple-100 text-purple-700",   coverFrom: "from-purple-950", coverVia: "via-violet-900",  coverTo: "to-purple-800",  accent: "bg-violet-400/10",  subtleText: "text-violet-200"  },
  rose:    { bg: "bg-rose-50",    text: "text-rose-500",    badge: "bg-rose-100 text-rose-700",       coverFrom: "from-rose-950",   coverVia: "via-pink-900",    coverTo: "to-rose-800",    accent: "bg-pink-400/10",    subtleText: "text-rose-200"    },
  teal:    { bg: "bg-teal-50",    text: "text-teal-600",    badge: "bg-teal-100 text-teal-700",       coverFrom: "from-teal-950",   coverVia: "via-cyan-900",    coverTo: "to-teal-800",    accent: "bg-teal-400/10",    subtleText: "text-teal-200"    },
  indigo:  { bg: "bg-indigo-50",  text: "text-indigo-600",  badge: "bg-indigo-100 text-indigo-700",   coverFrom: "from-indigo-950", coverVia: "via-blue-900",    coverTo: "to-indigo-800",  accent: "bg-indigo-400/10",  subtleText: "text-indigo-200"  },
  amber:   { bg: "bg-amber-50",   text: "text-amber-500",   badge: "bg-amber-100 text-amber-700",     coverFrom: "from-amber-950",  coverVia: "via-orange-900",  coverTo: "to-amber-800",   accent: "bg-amber-400/10",   subtleText: "text-amber-200"   },
  slate:   { bg: "bg-slate-100",  text: "text-slate-500",   badge: "bg-slate-100 text-slate-600",     coverFrom: "from-slate-900",  coverVia: "via-slate-800",   coverTo: "to-slate-700",   accent: "bg-slate-400/10",   subtleText: "text-slate-300"   },
};

function getTheme(colorTheme: string | null) {
  return COLOR_THEMES[colorTheme ?? "slate"] ?? COLOR_THEMES.slate;
}

function SubjectIcon({ iconName, size = 18, className = "" }: { iconName: string | null; size?: number; className?: string }) {
  if (!iconName) return <HelpCircle size={size} className={className || "text-slate-400"} />;
  const key = toPascalCase(iconName);
  const icons = LucideIcons as Record<string, unknown>;
  function isValidIcon(v: unknown): v is React.ComponentType<{ size?: number; className?: string }> {
    return typeof v === "function" || (typeof v === "object" && v !== null && "$$typeof" in (v as object));
  }
  const Icon =
    isValidIcon(icons[key]) ? (icons[key] as React.ComponentType<{ size?: number; className?: string }>) :
    isValidIcon(icons[`${key}Icon`]) ? (icons[`${key}Icon`] as React.ComponentType<{ size?: number; className?: string }>) :
    null;
  if (!Icon) return <HelpCircle size={size} className={className || "text-slate-400"} />;
  return <Icon size={size} className={className} />;
}

// ─── Difficulty config ────────────────────────────────────────────────────────
function difficultyConfig(d: string | null) {
  switch ((d ?? "").toLowerCase()) {
    case "beginner":     return { label: "Beginner",     cls: "bg-emerald-100 text-emerald-700" };
    case "intermediate": return { label: "Intermediate", cls: "bg-amber-100 text-amber-700" };
    case "advanced":     return { label: "Advanced",     cls: "bg-rose-100 text-rose-700" };
    default:             return { label: d ?? "Quiz",    cls: "bg-slate-100 text-slate-600" };
  }
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────
function PageSkeleton() {
  return (
    <div className="min-h-full bg-surface p-6 space-y-6">
      <Skeleton className="h-4 w-32" />
      <div className="rounded-2xl overflow-hidden">
        <Skeleton className="h-56 w-full rounded-none" />
        <div className="p-6 space-y-3 bg-white">
          <Skeleton className="h-7 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border bg-white p-5 space-y-2">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-5 w-12" />
          </div>
        ))}
      </div>
      <Skeleton className="h-12 w-full rounded-xl" />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function QuizDetailPage() { 
  const { profile } = useProfile();

  const params = useParams<{ id: string }>();
  const quizId = params.id;
  const router = useRouter();

  const [quiz, setQuiz]       = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundError, setNotFoundError] = useState(false);

  useEffect(() => {
    if (!quizId) return;
    let cancelled = false;

    async function fetchData() {
      try {
        // 1. Fetch the quiz by id, joining subject
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
        if (!quizData) {
          if (!cancelled) setNotFoundError(true);
          return;
        }

        const normalised: Quiz = {
          ...quizData,
          subject: Array.isArray(quizData.subjects) ? quizData.subjects[0] : quizData.subjects,
          affiliationStatus: null,
        } as Quiz;

        // 2. Fetch current user's attempt for this quiz
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const { data: studentData } = await supabase
            .from("students")
            .select("id")
            .eq("user_id", user.id)
            .maybeSingle();

          if (studentData) {
            // Fetch affiliation status
            const { data: affiliationData } = await supabase
              .from("quiz_affiliations")
              .select("status")
              .eq("student_id", studentData.id)
              .eq("quiz_id", quizId)
              .maybeSingle();

            const affStatus = affiliationData?.status?.toLowerCase() ?? null;

            // Completed → redirect to results page
            if (affStatus === "completed" && !cancelled) {
              router.replace(`/student/quiz/${quizId}/result`);
              return;
            }

            // Block access if not assigned/available/in_progress
            const isAccessible =
              affStatus === "available" || affStatus === "in_progress";

            if (!isAccessible && !cancelled) {
              router.replace("/students/quiz/view");
              return;
            }

            normalised.affiliationStatus = affStatus;
          }
        }

        if (!cancelled) {
          setQuiz(normalised);
        }
      } catch (err) {
        console.error("QuizDetailPage fetch error:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizId]);

  if (notFoundError) notFound();
  if (loading) return <PageSkeleton />;
  if (!quiz) return null;

  const subject       = quiz.subject;
  const theme         = getTheme(subject?.color_theme ?? null);
  const diff          = difficultyConfig(quiz.difficulty);
  const topics        = Array.isArray(quiz.topics) ? quiz.topics : [];
  const isClosed      = quiz.closed_at ? new Date(quiz.closed_at) < new Date() : false;
  const affStatus     = quiz.affiliationStatus?.toLowerCase() ?? null;
  const isInProgress  = affStatus === "in_progress";
  const isAvailable   = affStatus === "available" && !isClosed;

  const takeHref = `/students/quiz/${quiz.id}/start`;

  return (
    <div className="min-h-full bg-surface">
      {/* Back breadcrumb */}
      <div className="px-6 pt-5 pb-0">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-subtitle hover:text-brand-navy transition-colors group"
        >
          <ChevronLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Back
        </button>
      </div>

      <div className="p-6 space-y-5">

        {/* ── Hero cover card ── */}
        <div className="rounded-2xl overflow-hidden border border-border">
          {/* Cover */}
          <div
            className={`relative h-52 bg-linear-to-br ${theme.coverFrom} ${theme.coverVia} ${theme.coverTo}`}
            style={quiz.cover_gradient ? { background: quiz.cover_gradient } : undefined}
          >
            {/* Decorative blobs */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full bg-white/5 blur-2xl" />
              <div className={`absolute -bottom-8 left-[40%] w-40 h-40 rounded-full ${theme.accent} blur-2xl`} />
            </div>
            {/* Dot pattern */}
            <div
              className="absolute inset-0 opacity-10"
              style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "22px 22px" }}
            />

            {/* Lock overlay */}
            {isClosed && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
                <div className="flex flex-col items-center gap-2 text-white">
                  <Lock className="h-8 w-8 opacity-80" />
                  <span className="text-xs font-bold opacity-70 uppercase tracking-widest">Quiz Closed</span>
                </div>
              </div>
            )}

            {/* Text overlay */}
            <div className="absolute bottom-5 left-6 right-6">
              {/* Subject pill */}
              {subject && (
                <div className="flex items-center gap-2 mb-3">
                  <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white`}>
                    <SubjectIcon iconName={subject.icon_name} size={11} className="text-white" />
                    {subject.name}
                  </span>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${diff.cls}`}>
                    <Star className="h-2.5 w-2.5 fill-current" />
                    {diff.label.toUpperCase()}
                  </span>
                  {isInProgress && (
                    <Badge className="bg-amber-400 text-white border-0 text-[10px] font-bold">In Progress</Badge>
                  )}
                  {isAvailable && (
                    <Badge className="bg-blue-500 text-white border-0 text-[10px] font-bold">Available</Badge>
                  )}
                </div>
              )}
              <h1 className="text-2xl font-bold text-white leading-tight">{quiz.name}</h1>
              {quiz.subtitle && (
                <p className={`${theme.subtleText} text-sm mt-1`}>{quiz.subtitle}</p>
              )}
            </div>
          </div>

          {/* White body strip */}
          <div className="bg-white px-6 py-4">
            {quiz.description && (
              <p className="text-sm text-slate-500 leading-relaxed">{quiz.description}</p>
            )}
          </div>
        </div>

        {/* ── Stats grid ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            quiz.duration_minutes != null && quiz.duration_minutes > 0 && {
              icon: <Timer className="h-4 w-4" />,
              label: "Duration",
              value: `${quiz.duration_minutes} min`,
              color: "text-blue-600 bg-blue-50",
            },
            {
              icon: <FileText className="h-4 w-4" />,
              label: "Format",
              value: "Questions",
              color: "text-indigo-600 bg-indigo-50",
            },
            quiz.passing_score != null && quiz.passing_score > 0 && {
              icon: <Target className="h-4 w-4" />,
              label: "Passing Score",
              value: `${quiz.passing_score}%`,
              color: "text-emerald-600 bg-emerald-50",
            },
            quiz.created_at && {
              icon: <CalendarDays className="h-4 w-4" />,
              label: "Created",
              value: new Date(quiz.created_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }),
              color: "text-purple-600 bg-purple-50",
            },
          ]
            .filter(Boolean)
            .map((stat, i) => {
              if (!stat) return null;
              return (
                <div key={i} className="rounded-2xl border border-border bg-white p-4 flex flex-col gap-2">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${stat.color}`}>
                    {stat.icon}
                  </div>
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">{stat.label}</p>
                  <p className="text-base font-bold text-brand-dark">{stat.value}</p>
                </div>
              );
            })}
        </div>

        {/* ── Topics ── */}
        {topics.length > 0 && (
          <div className="rounded-2xl border border-border bg-white p-5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Topics Covered</p>
            <div className="flex flex-wrap gap-2">
              {topics.map((t) => (
                <span
                  key={t}
                  className="text-xs font-medium text-brand-navy bg-brand-light border border-brand-light px-3 py-1.5 rounded-full"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Instructions banner ── */}
        <div className="rounded-2xl border border-border bg-white px-6 py-5 grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            { icon: <Wifi className="h-4 w-4" />,  color: "bg-blue-100 text-blue-600",   text: "Ensure a stable internet connection before starting the quiz." },
            { icon: <Timer className="h-4 w-4" />, color: "bg-amber-100 text-amber-600", text: "The countdown timer starts immediately and cannot be paused." },
            { icon: <Flag className="h-4 w-4" />,  color: "bg-rose-100 text-rose-600",   text: "Flag difficult questions to revisit them before submitting." },
          ].map(({ icon, color, text }, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${color}`}>
                {icon}
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">{text}</p>
            </div>
          ))}
        </div>

        {/* ── CTA ── */}
        <div>
          {isClosed ? (
            <Button
              disabled
              className="w-full bg-slate-100 text-slate-400 rounded-xl font-bold text-sm h-12 cursor-not-allowed"
            >
              <Lock className="h-4 w-4 mr-2" />
              Quiz Closed
            </Button>
          ) : isInProgress ? (
            <Link href={takeHref}>
              <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-sm h-12 gap-2 transition-colors">
                <PlayCircle className="h-4 w-4" />
                Continue Quiz
              </Button>
            </Link>
          ) : isAvailable ? (
            <Link href={takeHref}>
              <Button className="w-full bg-brand-navy hover:bg-brand-blue text-white rounded-xl font-bold text-sm h-12 gap-2 transition-all hover:shadow-lg hover:shadow-brand-navy/20">
                <PlayCircle className="h-4 w-4" />
                Start Quiz
              </Button>
            </Link>
          ) : (
            <Button
              disabled
              className="w-full bg-slate-100 text-slate-400 rounded-xl font-bold text-sm h-12 cursor-not-allowed"
            >
              <Lock className="h-4 w-4 mr-2" />
              Not Available
            </Button>
          )}
        </div>

      </div>
    </div>
  );
}