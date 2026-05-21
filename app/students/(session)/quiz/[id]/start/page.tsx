"use client";

/**
 * Quiz Studio – page.tsx
 * Supabase integration via `public.questions` schema.
 *
 * Env vars required (add to .env.local):
 *   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
 *
 * Install deps:
 *   npm install @supabase/supabase-js
 *   npx shadcn@latest add badge button radio-group label switch separator tooltip skeleton alert
 */

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ChevronLeft,
  ChevronRight,
  BookmarkIcon,
  LayoutGrid,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

// ─── Supabase client (singleton) ─────────────────────────────────────────────

const supabase: SupabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ─── Types ────────────────────────────────────────────────────────────────────

/** Mirrors public.questions exactly */
interface Question {
  id: string;
  quiz_id: string;
  subject_id: string | null;
  body: string;
  type: string;
  order_index: number;
  difficulty: number | null;
  points: number;
  title: string | null;
  hint: string | null;
  /** options stored as JSON in `body` when type === 'mcq', or fetched from a
   *  separate options table. For this demo we parse options from body if it
   *  contains a JSON array under "options" key; otherwise show open text. */
  options?: MCQOption[];
}

interface MCQOption {
  id: string;
  text: string;
}

type AnswerStatus = "answered" | "current" | "unanswered" | "locked";

interface NavQuestion {
  id: string;
  order_index: number;
  status: AnswerStatus;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseMCQOptions(body: string): { text: string; options: MCQOption[] } {
  try {
    const parsed = JSON.parse(body);
    if (parsed && typeof parsed === "object" && Array.isArray(parsed.options)) {
      return {
        text: parsed.text ?? body,
        options: parsed.options as MCQOption[],
      };
    }
  } catch {
    // not JSON — treat as plain text question body
  }
  return { text: body, options: [] };
}

function difficultyLabel(d: number | null): string {
  if (d === null) return "";
  if (d <= 2) return "Easy";
  if (d <= 4) return "Medium";
  return "Hard";
}

function difficultyColor(d: number | null): string {
  if (d === null) return "";
  if (d <= 2) return "text-emerald-600 bg-emerald-50 border-emerald-200";
  if (d <= 4) return "text-amber-600 bg-amber-50 border-amber-200";
  return "text-red-600 bg-red-50 border-red-200";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function NavButton({
  item,
  onClick,
}: {
  item: NavQuestion;
  onClick: () => void;
}) {
  const base =
    "w-9 h-9 rounded-lg text-sm font-semibold flex items-center justify-center transition-all duration-150 select-none";

  const styles: Record<AnswerStatus, string> = {
    answered: "bg-[#0f2557] text-white hover:bg-[#1a3a7a] shadow-sm cursor-pointer",
    current: "bg-white text-[#0f2557] border-2 border-[#0f2557] shadow-md font-bold cursor-default",
    unanswered: "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200 cursor-pointer",
    locked: "bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed",
  };

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className={`${base} ${styles[item.status]}`}
            onClick={item.status !== "locked" ? onClick : undefined}
          >
            {item.order_index}
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs capitalize">
          {item.status === "current"
            ? "Current question"
            : `Question ${item.order_index + 1} – ${item.status}`}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function QuestionSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-5 w-40 rounded-lg" />
      <Skeleton className="h-8 w-64 rounded-lg" />
      <Skeleton className="h-24 w-full rounded-xl" />
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-14 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

function WaveIllustration() {
  return (
    <div className="relative w-full h-44 rounded-xl overflow-hidden bg-linear-to-br from-[#0d1b3e] via-[#122a5e] to-[#0a1628] flex items-center justify-center">
      <svg
        viewBox="0 0 800 200"
        className="absolute inset-0 w-full h-full opacity-60"
        preserveAspectRatio="none"
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <path
            key={n}
            d={`M ${(n - 1) * 160} 100 Q ${(n - 1) * 160 + 40} ${100 - 55 + n * 5} ${(n - 1) * 160 + 80} 100 Q ${(n - 1) * 160 + 120} ${100 + 55 - n * 5} ${n * 160} 100`}
            fill="none"
            stroke={`hsl(${200 + n * 15}, 80%, ${55 + n * 4}%)`}
            strokeWidth="2.5"
            opacity={0.8 - n * 0.1}
          />
        ))}
        <line x1="0" y1="100" x2="800" y2="100" stroke="#94a3b8" strokeWidth="1" strokeDasharray="6 4" opacity="0.4" />
      </svg>
      <span className="relative z-10 text-slate-400 text-xs tracking-widest uppercase font-mono">
        Wave function visualisation
      </span>
    </div>
  );
}

// ─── useTimer hook ────────────────────────────────────────────────────────────

function useTimer(initialSeconds = 2532) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);

  const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${h} : ${m} : ${s}`;
}

// ─── useQuiz hook — all Supabase logic ───────────────────────────────────────

function useQuiz(quizId: string) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const saved = localStorage.getItem(`quiz_answers_${quizId}`);
      return saved ? (JSON.parse(saved) as Record<string, string>) : {};
    } catch {
      return {};
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Fetch all questions for this quiz ──────────────────────────────────────
  // Incrementing refetchCount triggers the effect without calling setState in the body.
  const [refetchCount, setRefetchCount] = useState(0);
  const refetch = useCallback(() => setRefetchCount((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from("questions")
          .select(
            "id, quiz_id, subject_id, body, type, order_index, difficulty, points, title, hint"
          )
          .eq("quiz_id", quizId)
          .order("order_index", { ascending: true });

        if (fetchError) throw fetchError;
        if (cancelled) return;

        const enriched: Question[] = (data ?? []).map((q) => {
          const { text, options } = parseMCQOptions(q.body);
          return { ...q, body: text, options };
        });

        setQuestions(enriched);
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load questions.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [quizId, refetchCount]);

  // ── Derived nav items ──────────────────────────────────────────────────────
  const navQuestions: NavQuestion[] = questions.map((q, idx) => ({
    id: q.id,
    order_index: q.order_index,
    status:
      idx === currentIndex
        ? "current"
        : answers[q.id]
        ? "answered"
        : idx <= currentIndex
        ? "unanswered"
        : "locked",
  }));

  const current: Question | null = questions[currentIndex] ?? null;
  const selectedAnswer: string = current ? (answers[current.id] ?? "") : "";

  // ── Save answer (upsert to quiz_responses if you have that table,
  //    or just keep in memory — here we do both) ────────────────────────────
  const saveAnswer = useCallback(
    async (optionId: string) => {
      if (!current) return;
      // Optimistic local update
      setAnswers((prev) => ({ ...prev, [current.id]: optionId }));

      setSaving(true);
      try {
        /**
         * If you have a `quiz_responses` or `question_answers` table, upsert here.
         * Example (adjust columns to match your schema):
         *
         * await supabase.from("quiz_responses").upsert({
         *   question_id: current.id,
         *   quiz_id: quizId,
         *   selected_option: optionId,
         *   updated_at: new Date().toISOString(),
         * }, { onConflict: "question_id,quiz_id" });
         *
         * For now we just persist to localStorage as a fallback.
         */
        localStorage.setItem(
          `quiz_answers_${quizId}`,
          JSON.stringify({ ...answers, [current.id]: optionId })
        );
      } catch {
        // non-critical
      } finally {
        setSaving(false);
      }
    },
    [current, quizId, answers]
  );

  // ── Navigation ─────────────────────────────────────────────────────────────
  const goTo = useCallback(
    (index: number) => {
      if (index >= 0 && index < questions.length) setCurrentIndex(index);
    },
    [questions.length]
  );

  const goNext = useCallback(() => goTo(currentIndex + 1), [currentIndex, goTo]);
  const goPrev = useCallback(() => goTo(currentIndex - 1), [currentIndex, goTo]);

  return {
    questions,
    navQuestions,
    current,
    currentIndex,
    selectedAnswer,
    loading,
    saving,
    error,
    answeredCount: Object.keys(answers).length,
    saveAnswer,
    goTo,
    goNext,
    goPrev,
    refetch,
  };
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function QuizPage() {
  const params = useParams();
  const quizId = Array.isArray(params.id) ? params.id[0] : (params.id ?? "");

  const timer = useTimer();
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set());

  const {
    navQuestions,
    current,
    currentIndex,
    selectedAnswer,
    loading,
    saving,
    error,
    answeredCount,
    questions,
    saveAnswer,
    goTo,
    goNext,
    goPrev,
    refetch,
  } = useQuiz(quizId);

  const isMarked = current ? markedForReview.has(current.id) : false;

  function toggleMark() {
    if (!current) return;
    setMarkedForReview((prev) => {
      const next = new Set(prev);
      if (next.has(current.id)) {
        next.delete(current.id);
      } else {
        next.add(current.id);
      }
      return next;
    });
  }

  async function handleSelectOption(optionId: string) {
    await saveAnswer(optionId);
  }

  async function handleSaveAndNext() {
    await goNext();
  }

  return (
    <div
      className="min-h-screen bg-[#f4f6fb] flex"
      style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}
    >
      {/* ── Left Sidebar ── */}
      <aside className="w-64 shrink-0 bg-white border-r border-slate-200 flex flex-col p-5 gap-5 min-h-screen">
        <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
          <LayoutGrid size={13} />
          Question Navigator
        </div>

        {/* Nav grid */}
        {loading ? (
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="w-9 h-9 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-5 gap-2">
            {navQuestions.map((item, idx) => (
              <NavButton key={item.id} item={item} onClick={() => goTo(idx)} />
            ))}
          </div>
        )}

        <Separator />

        {/* Progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-slate-500">
            <span>Progress</span>
            <span className="font-semibold text-slate-700">
              {answeredCount}/{questions.length}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#0f2557] rounded-full transition-all duration-500"
              style={{
                width: questions.length
                  ? `${(answeredCount / questions.length) * 100}%`
                  : "0%",
              }}
            />
          </div>
        </div>

        <Separator />

        {/* Exam Info */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2.5">
          <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-1">
            Exam Info
          </p>
          {[
            ["Quiz ID", quizId ? quizId.slice(0, 8) + "…" : "—"],
            ["Questions", questions.length.toString()],
            ["Answered", `${answeredCount} of ${questions.length}`],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between items-center">
              <span className="text-xs text-slate-500">{k}</span>
              <span className="text-xs font-semibold text-slate-800">{v}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 flex flex-col">
        {/* Timer strip */}
        <div className="flex items-center justify-end gap-4 px-8 py-3 bg-white border-b border-slate-200">
          <div className="flex items-center gap-2 text-sm font-mono font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg">
            <span className="text-slate-400 text-xs">⏱</span>
            {timer}
          </div>
          <Button className="bg-[#0f2557] hover:bg-[#1a3a7a] text-white text-sm font-semibold px-5 rounded-xl gap-2">
            Submit Exam
            <ChevronRight size={15} />
          </Button>
        </div>

        {/* Question card */}
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-7">

            {/* Error state */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>{error}</span>
                  <button
                    onClick={refetch}
                    className="ml-4 flex items-center gap-1 text-xs underline hover:no-underline"
                  >
                    <RefreshCw size={12} /> Retry
                  </button>
                </AlertDescription>
              </Alert>
            )}

            {/* Loading skeleton */}
            {loading && <QuestionSkeleton />}

            {/* Empty state */}
            {!loading && !error && !current && (
              <div className="text-center py-16 text-slate-400">
                <p className="text-lg font-medium">No questions found</p>
                <p className="text-sm mt-1">
                  Make sure questions exist for quiz ID:{" "}
                  <code className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded">
                    {quizId}
                  </code>
                </p>
              </div>
            )}

            {/* Question content */}
            {!loading && !error && current && (
              <>
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant="outline"
                        className="text-[10px] font-bold tracking-widest uppercase text-indigo-600 border-indigo-200 bg-indigo-50 px-2.5 py-0.5"
                      >
                        Question {currentIndex + 1} · {current.points}{" "}
                        {current.points === 1 ? "Point" : "Points"}
                      </Badge>
                      {current.difficulty !== null && (
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-bold tracking-widest uppercase px-2.5 py-0.5 ${difficultyColor(current.difficulty)}`}
                        >
                          {difficultyLabel(current.difficulty)}
                        </Badge>
                      )}
                      {saving && (
                        <span className="text-[10px] text-slate-400 italic">saving…</span>
                      )}
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                      {current.title ?? "Question"}
                    </h2>
                  </div>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={toggleMark}
                          className={`mt-1 p-2 rounded-lg border transition-colors ${
                            isMarked
                              ? "bg-amber-50 border-amber-300 text-amber-500"
                              : "bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600"
                          }`}
                        >
                          <BookmarkIcon size={16} fill={isMarked ? "currentColor" : "none"} />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="left" className="text-xs">
                        {isMarked ? "Remove bookmark" : "Mark for review"}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                {/* Question body */}
                <p className="text-[15px] leading-relaxed text-slate-700 whitespace-pre-line">
                  {current.body}
                </p>

                {/* Optional wave illustration for physics questions */}
                {current.type === "mcq" && current.title?.toLowerCase().includes("wave") && (
                  <WaveIllustration />
                )}

                {/* MCQ Options */}
                {current.type === "mcq" && current.options && current.options.length > 0 ? (
                  <RadioGroup
                    value={selectedAnswer}
                    onValueChange={handleSelectOption}
                    className="space-y-3"
                  >
                    {current.options.map((opt) => {
                      const isSelected = selectedAnswer === opt.id;
                      return (
                        <label
                          key={opt.id}
                          htmlFor={`opt-${opt.id}`}
                          className={`flex items-center gap-4 rounded-xl border px-5 py-4 cursor-pointer transition-all duration-150 ${
                            isSelected
                              ? "border-[#0f2557] bg-[#0f2557]/5 shadow-sm"
                              : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          <RadioGroupItem
                            value={opt.id}
                            id={`opt-${opt.id}`}
                            className={isSelected ? "text-[#0f2557] border-[#0f2557]" : ""}
                          />
                          <span
                            className={`font-mono text-[15px] ${
                              isSelected ? "text-[#0f2557] font-semibold" : "text-slate-700"
                            }`}
                          >
                            {opt.text}
                          </span>
                        </label>
                      );
                    })}
                  </RadioGroup>
                ) : (
                  /* Fallback for non-MCQ or plain question body */
                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-4 text-sm text-slate-500 italic">
                    {current.type === "open"
                      ? "Open-ended question — answer in the provided answer sheet."
                      : `Question type: ${current.type}. Options not configured.`}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Bottom nav */}
        <div className="border-t border-slate-200 bg-white px-8 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            className="gap-1.5 text-slate-600 hover:text-slate-900 font-medium"
            onClick={goPrev}
            disabled={loading || currentIndex === 0}
          >
            <ChevronLeft size={16} />
            Previous Question
          </Button>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={toggleMark}
              disabled={loading || !current}
              className={`gap-2 font-medium border-slate-300 ${
                isMarked
                  ? "text-amber-600 border-amber-300 bg-amber-50 hover:bg-amber-100"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <BookmarkIcon size={14} fill={isMarked ? "currentColor" : "none"} />
              {isMarked ? "Marked" : "Mark for Review"}
            </Button>

            <Button
              className="bg-[#0f2557] hover:bg-[#1a3a7a] text-white font-semibold px-6 gap-2 rounded-xl"
              onClick={handleSaveAndNext}
              disabled={loading || currentIndex === questions.length - 1}
            >
              Save and Next
              <ChevronRight size={15} />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}