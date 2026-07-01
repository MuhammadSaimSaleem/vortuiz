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
  ChevronLeft,
  CheckCircle2,
  HelpCircle,
  CalendarDays,
  Target,
  Lock,
  Pencil,
  Trash2,
  Send,
  BarChart3,
  Users,
  Copy,
  Check,
  AlertTriangle,
  X,
} from "lucide-react";
import { toPascalCase } from "@/lib/utils";
import { useProfile } from "@/contexts/ProfileContext";
import { Quiz } from "@/lib/data";

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

// ─── Status config ────────────────────────────────────────────────────────────
function statusConfig(s: string | null) {
  switch ((s ?? "").toLowerCase()) {
    case "published":   return { label: "Published",   cls: "bg-emerald-500 text-white" };
    case "draft":       return { label: "Draft",        cls: "bg-slate-400 text-white" };
    case "unavailable": return { label: "Unavailable",  cls: "bg-rose-500 text-white" };
    default:             return { label: s ?? "Quiz",    cls: "bg-slate-400 text-white" };
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
export default function TeacherQuizDetailPage() {
  const { profile } = useProfile();

  const params = useParams<{ id: string }>();
  const quizId = params.id;
  const router = useRouter();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundError, setNotFoundError] = useState(false);

  const [copied, setCopied] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (!quizId || !profile?.id) return;
    let cancelled = false;

    async function fetchData() {
      try {
        if (profile?.id) {
          const { data: quizData, error: quizError } = await supabase
            .from("quizzes")
            .select(`
              id,
              creator_id,
              subject_id,
              name,
              topics,
              description,
              difficulty,
              total_marks,
              passing_marks,
              grading_type,
              duration_minutes,
              join_code,
              status,
              question_count,
              participant_count,
              cover_gradient,
              created_at,
              closed_at,
              subjects (
                id,
                name,
                slug,
                icon_name,
                color_theme
              )
            `)
            .eq("id", quizId)
            .eq("creator_id", profile?.id)
            .maybeSingle();

          if (quizError) throw quizError;
          if (!quizData) {
            if (!cancelled) setNotFoundError(true);
            return;
          }

          if (!cancelled) {
            setQuiz(quizData as Quiz);
          }
        }
      } catch (err) {
        console.error("TeacherQuizDetailPage fetch error:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, [quizId, profile?.id]);

  async function handlePublish() {
    if (!quiz) return;
    setActionError(null);
    setPublishing(true);
    try {
      const { error } = await supabase
        .from("quizzes")
        .update({ status: "published" })
        .eq("id", quiz.id)
        .eq("creator_id", profile?.id);
      if (error) throw error;
      setQuiz({ ...quiz, status: "published" });
    } catch (err) {
      console.error("Publish quiz error:", err);
      setActionError("Couldn't publish the quiz. Please try again.");
    } finally {
      setPublishing(false);
    }
  }

  async function handleDelete() {
    if (!quiz) return;
    setActionError(null);
    setDeleting(true);
    try {
      const { error } = await supabase
        .from("quizzes")
        .delete()
        .eq("id", quiz.id)
        .eq("creator_id", profile?.id);
      if (error) throw error;
      router.push("/teachers/quiz/view");
    } catch (err) {
      console.error("Delete quiz error:", err);
      setActionError("Couldn't delete the quiz. Please try again.");
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  function handleCopyJoinCode() {
    if (!quiz?.join_code) return;
    navigator.clipboard.writeText(quiz.join_code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  if (notFoundError) notFound();
  if (loading) return <PageSkeleton />;
  if (!quiz) return null;

  const diff   = difficultyConfig(quiz.difficulty);
  const status = statusConfig(quiz.status);
  const topics = Array.isArray(quiz.topics) ? quiz.topics : [];

  const isDraft       = quiz.status === "draft";
  const isPublished    = quiz.status === "published";
  const isUnavailable  = quiz.status === "unavailable";

  const editHref    = `/teachers/quiz/${quiz.id}/edit`;
  const resultsHref = `/teachers/quiz/${quiz.id}/results`;

  return (
    <div className="min-h-full bg-surface">
      {/* Back breadcrumb */}
      <div className="px-6 pt-5 pb-0">
        <button
          onClick={() => router.push('/teachers/quiz/view')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-sub hover:text-brand-navy transition-colors group"
        >
          <ChevronLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Back
        </button>
      </div>

      <div className="p-6">

        {actionError && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 flex items-center gap-2 text-sm text-rose-600 mb-5">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {actionError}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-5 items-start">

          {/* ══ LEFT COLUMN — cover + actions ══ */}
          <div className="space-y-5 lg:sticky lg:top-5">

            {/* Cover card */}
            <div className="rounded-2xl overflow-hidden border border-border">
              <div
                className="relative h-52"
                style={quiz.cover_gradient ? { background: quiz.cover_gradient } : undefined}
              >
                {/* Decorative blobs */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full bg-white/5 blur-2xl" />
                  <div className="absolute -bottom-8 left-[40%] w-40 h-40 rounded-full blur-2xl" />
                </div>
                {/* Dot pattern */}
                <div
                  className="absolute inset-0 opacity-10"
                  style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "22px 22px" }}
                />

                {/* Unavailable overlay */}
                {isUnavailable && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
                    <div className="flex flex-col items-center gap-2 text-white">
                      <Lock className="h-8 w-8 opacity-80" />
                      <span className="text-xs font-bold opacity-70 uppercase tracking-widest">Unavailable</span>
                    </div>
                  </div>
                )}

                {/* Text overlay */}
                <div className="absolute bottom-5 left-6 right-6">
                  {quiz.subjects && quiz.subjects.length > 0 && (
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white">
                        <SubjectIcon iconName={quiz.subjects[0].icon_name} size={11} className="text-white" />
                        {quiz.subjects[0].name}
                      </span>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${diff.cls}`}>
                        <Star className="h-2.5 w-2.5 fill-current" />
                        {diff.label.toUpperCase()}
                      </span>
                      <Badge className={`${status.cls} border-0 text-[10px] font-bold`}>{status.label}</Badge>
                    </div>
                  )}
                  <h1 className="text-2xl font-bold text-white leading-tight">{quiz.name}</h1>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white px-5 py-3 flex items-center gap-3 border-t border-border">
                <div
                  className="h-7 w-7 rounded-lg shrink-0 border border-border"
                  style={quiz.cover_gradient ? { background: quiz.cover_gradient } : undefined}
                />
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Description</p>
                  <p className="text-xs font-medium text-slate-600">
                    {quiz.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="rounded-2xl border border-border bg-white p-3 space-y-2">
              {isDraft && (
                <Button
                  onClick={handlePublish}
                  disabled={publishing}
                  className="w-full bg-brand-navy hover:bg-brand-blue text-white rounded-xl font-bold text-sm h-11 gap-2 transition-all hover:shadow-lg hover:shadow-brand-navy/20 disabled:opacity-60"
                >
                  <Send className="h-4 w-4" />
                  {publishing ? "Publishing..." : "Publish Quiz"}
                </Button>
              )}

              {isPublished && (
                <Link href={resultsHref} className="block">
                  <Button className="w-full bg-brand-navy hover:bg-brand-blue text-white rounded-xl font-bold text-sm h-11 gap-2 transition-all hover:shadow-lg hover:shadow-brand-navy/20">
                    <BarChart3 className="h-4 w-4" />
                    View Quiz
                  </Button>
                </Link>
              )}

              {isUnavailable && (
                <Link href={resultsHref} className="block">
                  <Button
                    variant="outline"
                    className="w-full rounded-xl font-bold text-sm h-11 gap-2 border-border text-slate-600"
                  >
                    <BarChart3 className="h-4 w-4" />
                    View Results
                  </Button>
                </Link>
              )}

              {isDraft && 
                <Link href={editHref} className="block">
                  <Button
                    variant="outline"
                    className="w-full rounded-xl font-bold text-sm h-11 gap-2 border-border text-slate-600 hover:text-brand-navy"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit Quiz
                  </Button>
                </Link>
              }

              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full rounded-xl font-bold text-sm h-11 gap-2 border-border text-rose-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200"
              >
                <Trash2 className="h-4 w-4" />
                Delete Quiz
              </Button>
            </div>
          </div>

          {/* ══ RIGHT COLUMN — data ══ */}
          <div className="space-y-5">

            {/* Join code */}
            {isPublished && quiz.join_code && (
              <div className="rounded-2xl border border-border bg-white p-5 flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Join Code</p>
                  <p className="text-2xl font-mono font-bold text-brand-dark tracking-widest">{quiz.join_code}</p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleCopyJoinCode}
                  className="h-9 rounded-lg text-xs font-semibold gap-1.5 border-border text-slate-600 hover:text-brand-navy"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
            )}

            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                quiz.duration_minutes != null && quiz.duration_minutes > 0 && {
                  icon: <Timer className="h-4 w-4" />,
                  label: "Duration",
                  value: `${quiz.duration_minutes} min`,
                  color: "text-blue-600 bg-blue-50",
                },
                {
                  icon: <FileText className="h-4 w-4" />,
                  label: "Questions",
                  value: `${quiz.question_count ?? 0}`,
                  color: "text-indigo-600 bg-indigo-50",
                },
                {
                  icon: <Users className="h-4 w-4" />,
                  label: "Participants",
                  value: `${quiz.participant_count ?? 0}`,
                  color: "text-orange-600 bg-orange-50",
                },
                quiz.passing_marks != null && quiz.passing_marks > 0 && {
                  icon: <CheckCircle2 className="h-4 w-4" />,
                  label: "Total Marks",
                  value: `${quiz.total_marks}`,
                  color: "text-emerald-600 bg-emerald-50",
                },
                quiz.passing_marks != null && quiz.passing_marks > 0 && {
                  icon: <Target className="h-4 w-4" />,
                  label: "Passing Marks",
                  value: `${quiz.passing_marks}`,
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
                      <div className="flex items-baseline">
                        <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide mr-2">{stat.label}:</p>
                        <p className="text-base font-bold text-brand-dark"> {stat.value}</p>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Topics */}
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

            {/* Teacher tips banner */}
            <div className="rounded-2xl border border-border bg-white px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[
                { icon: <Wifi className="h-4 w-4" />,  color: "bg-blue-100 text-blue-600",   text: "Students will need the join code to enter this quiz." },
                { icon: <Timer className="h-4 w-4" />, color: "bg-amber-100 text-amber-600", text: "The countdown timer starts as soon as a student begins." },
                { icon: <Flag className="h-4 w-4" />,  color: "bg-rose-100 text-rose-600",   text: "Results and flagged questions are visible from the results page." },
              ].map(({ icon, color, text }, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${color}`}>
                    {icon}
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed">{text}</p>
                </div>
              ))}
            </div>

          </div>

        </div>
      </div>

      {/* ── Delete confirmation modal ── */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="h-10 w-10 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div>
              <h2 className="text-base font-bold text-brand-dark mb-1">Delete this quiz?</h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                This will permanently delete &ldquo;{quiz.name}&rdquo; and cannot be undone.
                {quiz.participant_count > 0 && " All participant results will also be lost."}
              </p>
            </div>
            <div className="flex gap-3 pt-1">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="flex-1 rounded-xl font-semibold text-sm h-10 border-border text-slate-600"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-semibold text-sm h-10 disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}