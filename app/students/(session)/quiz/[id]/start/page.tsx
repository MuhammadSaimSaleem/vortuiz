"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
  CheckCircle2,
  Timer,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Question } from "@/lib/data";
import { useProfile } from "@/contexts/ProfileContext";
import { CustomTooltip } from "@/components/ui/customUI";

type AnswerStatus = "answered" | "current" | "unanswered";

interface NavQuestion {
  id: string;
  order_index: number;
  status: AnswerStatus;
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
    answered: "bg-brand-navy text-white hover:bg-[#1a3a7a] shadow-sm cursor-pointer",
    current: "bg-white text-brand-navy border-2 border-brand-navy shadow-md font-bold cursor-default",
    unanswered: "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200 cursor-pointer",
  };
  const arrowStyles: Record<AnswerStatus, string> = {
    answered: "bg-brand-navy fill-brand-navy",
    current: "bg-white fill-white border-2 border-brand-navy",
    unanswered: "bg-slate-100 fill-slate-100",
  };

  return (
    <TooltipProvider delayDuration={300}>
    <CustomTooltip
      side="top"
      content={
        item.status === "current"
          ? "Current question"
          : `Question ${item.order_index + 1} – ${item.status}`
      }
      className={styles[item.status]}
      arrowClassName={arrowStyles[item.status]}
    >
      <button 
        className={`${base} ${styles[item.status]}`} 
        onClick={onClick}
      >
        {item.order_index}
      </button>
    </CustomTooltip>
  </TooltipProvider>
  );
}

// ─── useQuiz hook — all Supabase logic ───────────────────────────────────────

function useQuiz(quizId: string) {
  const router = useRouter();
  const { profile } = useProfile();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [quizData, setQuizData] = useState<{ id: string; name: string; duration_minutes: number } | null>(null);
  // question_id → selected_option text value
  const [answers, setAnswers] = useState<Record<string, string>>({});
  // question_id → flagged boolean (mirrors DB, kept in sync on every upsert)
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // true once the affiliation status check has completed (and not redirected)
  const [accessChecked, setAccessChecked] = useState(false);

  const [refetchCount, setRefetchCount] = useState(0);
  const refetch = useCallback(() => setRefetchCount((n) => n + 1), []);

  // ── Check affiliation status and redirect if inaccessible ─────────────────
  useEffect(() => {
    if (!profile?.id || !quizId) return;
    let cancelled = false;

    async function checkAccess() {
      const { data } = await supabase
        .from("quiz_affiliations")
        .select("status")
        .eq("student_id", profile?.id)
        .eq("quiz_id", quizId)
        .maybeSingle();

      if (cancelled) return;

      const affStatus = data?.status?.toLowerCase() ?? null;

      if (affStatus === "completed") {
        router.replace(`/students/quiz/${quizId}/results`);
      } else if (affStatus !== "available" && affStatus !== "in_progress") {
        router.replace("/students/quiz/view");
      } else {
        // Access is valid — allow data fetching and UI to proceed
        if (!cancelled) setAccessChecked(true);
      }
    }

    checkAccess();
    return () => { cancelled = true; };
  }, [profile?.id, quizId, router]);

  // ── Fetch questions + existing responses in one pass ───────────────────────
  useEffect(() => {
    if (!profile?.id || !accessChecked) return; // wait until student is resolved and access is verified
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        // 1. Questions with options
        const { data: qData, error: qErr } = await supabase
          .from("questions")
          .select(
            "id, quiz_id, question, type, options, order_index, answer, marks"
          )
          .eq("quiz_id", quizId)
          .order("order_index", { ascending: true });

        if (qErr) throw qErr;
        
        const { data: quizData, error: quizErr } = await supabase
          .from("quizzes")
          .select(
            "id, name, duration_minutes"
          )
          .eq("id", quizId)
          .single();

        if(quizErr) throw quizErr;

        setQuizData(quizData);

        if (cancelled) return;

        const enriched: Question[] = (qData ?? []).map((q) => ({
          ...q,
          options: Array.isArray(q.options) ? q.options.map(String) : [],
        }));

        // 2. Existing responses for this student across these questions
        const questionIds = enriched.map((q) => q.id);
        const { data: rData } = await supabase
          .from("question_responses")
          .select("question_id, responses, flagged_for_review")
          .eq("student_id", profile?.id)
          .in("question_id", questionIds);

        if (cancelled) return;

        const hydratedAnswers: Record<string, string> = {};
        const hydratedFlagged: Record<string, boolean> = {};

        const questionsById = new Map(enriched.map((q) => [q.id, q]));

        for (const r of rData ?? []) {
          if (r.responses) {
            const q = questionsById.get(r.question_id);
            const isTextType = q?.type === "short_answer" || q?.type === "coding_response";

            if (isTextType || !q?.options) {
              hydratedAnswers[r.question_id] = r.responses;
            } else {
              // responses is stored as option TEXT — convert back to its index
              // so it matches the valueKey (String(idx)) used by the RadioGroup.
              const idx = q.options.indexOf(r.responses);
              hydratedAnswers[r.question_id] = idx >= 0 ? String(idx) : r.responses;
            }
          }
          hydratedFlagged[r.question_id] = r.flagged_for_review ?? false;
        }

        setQuestions(enriched);
        setAnswers(hydratedAnswers);
        setFlagged(hydratedFlagged);
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load questions.");
          console.log(err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [quizId, profile?.id, accessChecked, refetchCount]);

  // ── Derived nav items ──────────────────────────────────────────────────────
  const navQuestions: NavQuestion[] = questions.map((q, idx) => ({
    id: q.id,
    order_index: q.order_index,
    status:
      idx === currentIndex
        ? "current"
        : answers[q.id]
        ? "answered"
        : "unanswered",
  }));

  const current: Question | null = questions[currentIndex] ?? null;
  const selectedAnswer: string = current ? (answers[current.id] ?? "") : "";

  // ── Save selected answer ───────────────────────────────────────────────────
  const saveAnswer = useCallback(
    (valueKey: string) => {
      if (!current) return;
      setAnswers((prev) => ({ ...prev, [current.id]: valueKey }));
    },
    [current]
  );

  // ── Save text response (short_answer / coding_response) ───────────────────
  const saveTextResponse = useCallback(
    (value: string) => {
      if (!current) return;
      setAnswers((prev) => ({ ...prev, [current.id]: value })); // keeps nav "answered"
    },
    [current]
  );

  function useTimer(duration_left_minutes: number) {
    // Convert minutes to seconds (e.g., 30 mins * 60 = 1800 seconds)
    const [seconds, setSeconds] = useState(duration_left_minutes * 60);

    useEffect(() => {
      // Reset state if the duration changes after initial load
      setSeconds(duration_left_minutes * 60);
    }, [duration_left_minutes]);

    useEffect(() => {
      const id = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
      return () => clearInterval(id);
    }, []);

    // Your math works perfectly now because 'seconds' is genuinely total seconds
    const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    
    return `${h} : ${m} : ${s}`;
  }

  // ── Toggle flagged_for_review ──────────────────────────────────────────────
  const toggleFlag = useCallback(
    (questionId: string) => {
      setFlagged((prev) => ({ ...prev, [questionId]: !prev[questionId] }));
    },
    []
  );

  const isLastQuestion = currentIndex === questions.length - 1 && questions.length > 0;
  const allAnswered = questions.length > 0 && Object.keys(answers).length === questions.length;

  // ── Resolve a question into its DB response payload ─────────────────────────
  // Everything — MCQ/true-false selection, short answer text, or code — is
  // stored as plain text in the single `responses` column.
  const buildResponseRow = useCallback(
    (q: Question) => {
      const isTextType = q.type === "short_answer" || q.type === "coding_response";
      const raw = answers[q.id] ?? "";

      let responseValue: string | null = null;
      if (isTextType) {
        responseValue = raw || null;
      } else if (raw !== "") {
        const idx = Number(raw);
        responseValue = q.options?.[idx] ?? null;
      }

      return {
        student_id: profile?.id as string,
        question_id: q.id,
        responses: responseValue,
        flagged_for_review: flagged[q.id] ?? false,
      };
    },
    [profile?.id, answers, flagged]
  );

  // ── Persist the current question's response to DB ────────────────────────
  const saveCurrentResponse = useCallback(
    async (): Promise<void> => {
      if (!current || !profile?.id) return;
      const row = buildResponseRow(current);
      if (!row.responses) return;
      setSaving(true);
      try {
        const { error: err } = await supabase
          .from("question_responses")
          .upsert(row, { onConflict: "student_id,question_id" });
        if (err) console.error("[saveCurrentResponse]", err);
      } finally {
        setSaving(false);
      }
    },
    [current, profile?.id, buildResponseRow]
  );

  const updateAffiliationStatus = useCallback(
    async (status: "in_progress" | "completed"): Promise<void> => {
      if (!profile?.id) return;
      const { data, error: err } = await supabase
        .from("quiz_affiliations")
        .update({ status })
        .eq("student_id", profile?.id)
        .eq("quiz_id", quizId)
        .select("quiz_id"); // forces returning affected rows

      if (err) {
        console.error("[updateAffiliationStatus] error:", err);
      } else if (!data || data.length === 0) {
        // Update ran but matched 0 rows — almost always an RLS policy mismatch
        console.error(
          "[updateAffiliationStatus] 0 rows updated — check RLS policy on quiz_affiliations (student_id vs auth.uid())"
        );
      }
    },
    [profile?.id, quizId]
  );

  // ── Submit quiz — persist all answered responses ──────────────────────────
  const submitQuiz = useCallback(
    async (): Promise<{ error: string | null }> => {
      if (!profile?.id) return { error: "Student not resolved." };
      setSaving(true);
      try {
        const rows = questions
          .filter((q) => answers[q.id])
          .map(buildResponseRow)
          .filter((row) => row.responses);

        if (rows.length > 0) {
          const { error: err } = await supabase
            .from("question_responses")
            .upsert(rows, { onConflict: "student_id,question_id" });
          if (err) throw new Error(err.message);
        }

        // Mark completed only if every question was answered, otherwise in_progress
        const allDone = rows.length === questions.length;
        await updateAffiliationStatus(allDone ? "completed" : "in_progress");

        return { error: null };
      } catch (err: unknown) {
        return { error: err instanceof Error ? err.message : "Submission failed." };
      } finally {
        setSaving(false);
      }
    },
    [profile?.id, questions, answers, buildResponseRow, updateAffiliationStatus]
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

  const timer = useTimer(quizData?.duration_minutes ?? 10);

  return {
    questions,
    navQuestions,
    current,
    currentIndex,
    quizData,
    timer,
    selectedAnswer,
    loading,
    accessChecked,
    saving,
    error,
    answeredCount: Object.keys(answers).length,
    flagged,
    isLastQuestion,
    allAnswered,
    saveAnswer,
    saveTextResponse,
    saveCurrentResponse,
    submitQuiz,
    toggleFlag,
    goTo,
    goNext,
    goPrev,
    refetch,
  };
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = Array.isArray(params.id) ? params.id[0] : (params.id ?? "");

  const {
    navQuestions,
    current,
    currentIndex,
    quizData,
    timer,
    selectedAnswer,
    loading,
    accessChecked,
    saving,
    error,
    answeredCount,
    questions,
    flagged,
    isLastQuestion,
    allAnswered,
    saveAnswer,
    saveTextResponse,
    saveCurrentResponse,
    submitQuiz,
    toggleFlag,
    goTo,
    goNext,
    goPrev,
    refetch,
  } = useQuiz(quizId);

  const isMarked = current ? (flagged[current.id] ?? false) : false;
  // Local draft state so textarea is controlled while typing; saves to DB on blur
  const [textResponseDraft, setTextResponseDraft] = useState<Record<string, string>>({});
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function toggleMark() {
    if (!current) return;
    toggleFlag(current.id);
  }

  async function handleSelectOption(optionId: string) {
    await saveAnswer(optionId);
  }

  async function handleSaveAndNext() {
    await saveCurrentResponse();
    if (isLastQuestion || answeredCount === 15) {
      setSubmitError(null);
      setShowSubmitModal(true);
    } else {
      goNext();
    }
  }

  async function handleNavigateTo(index: number) {
    await saveCurrentResponse();
    goTo(index);
  }

  async function handleConfirmSubmit() {
    setSubmitting(true);
    setSubmitError(null);
    const { error: err } = await submitQuiz();
    setSubmitting(false);
    if (err) {
      setSubmitError(err);
      return;
    }
    router.push("/students/quiz/view");
  }

  // Block rendering until status check is done to prevent UI flash before redirect
  if (!accessChecked) {
    return (
      <div className="min-h-screen bg-[#f4f6fb] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-4 border-[#0f2557] border-t-transparent animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Verifying access…</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-[#f4f6fb] flex overflow-hidden h-[calc(100vh-3.5rem)]">
      {/* ── Left Sidebar ── */}
      <aside className="w-64 shrink-0 bg-white border-r border-slate-200 flex flex-col p-5 gap-5">
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
              <NavButton key={item.id} item={item} onClick={() => handleNavigateTo(idx)} />
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
          <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-2">
            Exam Info
          </p>
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500">Quiz Name</span>
            <CustomTooltip content={quizData?.name ?? ""} className="bg-brand-navy" arrowClassName="bg-brand-navy fill-brand-navy">
              <span className="w-25 text-xs font-semibold text-slate-800 truncate text-left">{quizData?.name}</span>
            </CustomTooltip>
          </div>
          {[
            ["Questions", questions.length.toString()],
            ["Answered", `${answeredCount} of ${questions.length}`],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between items-center">
              <span className="text-xs text-slate-500">{k}</span>
              <span className="w-25 text-xs font-semibold text-slate-800 text-right">{v}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 flex flex-col">
        {/* Timer strip */}
        <div className="flex items-center justify-between gap-4 px-8 py-3 bg-white border-b border-slate-200">

          <Button
            variant="ghost"
            className="gap-1.5 text-slate-600 hover:text-slate-900 font-medium"
            onClick={goPrev}
            disabled={loading || currentIndex === 0}
          >
            <ChevronLeft size={16} />
            Previous
          </Button>

          <div className="flex items-center gap-2 text-sm font-mono font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg">
            <Timer />
            {timer}
          </div>

          <div className="flex items-center gap-2">
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
            {isLastQuestion || answeredCount === 15 ? (
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 gap-2 rounded-xl disabled:opacity-40"
                onClick={handleSaveAndNext}
                disabled={loading || saving}
              >
                <CheckCircle2 size={15} />
                Submit Quiz
              </Button>
            ) : (
              <Button
                className="bg-[#0f2557] hover:bg-[#1a3a7a] text-white font-semibold px-6 gap-2 rounded-xl"
                onClick={handleSaveAndNext}
                disabled={loading}
              >
                Save and Next
                <ChevronRight size={15} />
              </Button>
            )}
          </div>
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
            {loading && 
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
            }

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
                        Question {currentIndex + 1} · {current.marks}{" "}
                        {current.marks === 1 ? "Point" : "Points"}
                      </Badge>
                      <Badge
                          variant="outline"
                          className={`text-[10px] font-bold tracking-widest uppercase px-2.5 py-0.5 ${
                            current.type === "multiple_choice"
                              ? "text-indigo-600 bg-indigo-50 border-indigo-200"
                              : current.type === "true_false"
                              ? "text-emerald-600 bg-emerald-50 border-emerald-200"
                              : current.type === "coding_response"
                              ? "text-violet-600 bg-violet-50 border-violet-200"
                              : "text-amber-600 bg-amber-50 border-amber-200"
                          }`}
                        >
                          {current.type.replace("_", " ")}
                        </Badge>
                      {saving && (
                        <span className="text-[10px] text-slate-400 italic">saving…</span>
                      )}
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                      {current.question ?? "Question"}
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


                {/* MCQ & True/False Options */}
                {(current.type === "multiple_choice" || current.type === "true_false") && current.options && current.options.length > 0 ? (
                  <RadioGroup
                    value={selectedAnswer}
                    onValueChange={handleSelectOption}
                    className="space-y-3"
                  >
                    {current.options.map((text, idx) => {
                      const valueKey = String(idx);
                      const isSelected = selectedAnswer === valueKey;
                      return (
                        <label
                          key={valueKey}
                          htmlFor={`opt-${valueKey}`}
                          className={`flex items-center gap-4 rounded-xl border px-5 py-4 cursor-pointer transition-all duration-150 ${
                            isSelected
                              ? "border-[#0f2557] bg-[#0f2557]/5 shadow-sm"
                              : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          <RadioGroupItem
                            value={valueKey}
                            id={`opt-${valueKey}`}
                            className={isSelected ? "text-[#0f2557] border-[#0f2557]" : ""}
                          />
                          <span
                            className={`font-mono text-[15px] ${
                              isSelected ? "text-[#0f2557] font-semibold" : "text-slate-700"
                            }`}
                          >
                            {text}
                          </span>
                        </label>
                      );
                    })}
                  </RadioGroup>
                ) : current.type === "short_answer" ? (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Your Answer</p>
                    <textarea
                      value={textResponseDraft[current.id] ?? selectedAnswer ?? ""}
                      onChange={(e) => {
                        setTextResponseDraft((prev) => ({ ...prev, [current.id]: e.target.value }));
                      }}
                      onBlur={(e) => saveTextResponse(e.target.value)}
                      placeholder="Write your answer here…"
                      rows={6}
                      className="w-full rounded-xl border border-slate-200 bg-white px-5 py-4 text-[15px] text-slate-800 leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-[#0f2557]/30 focus:border-[#0f2557] transition-all placeholder:text-slate-400"
                    />
                  </div>
                ) : current.type === "coding_response" ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Your Code</p>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">code editor</span>
                    </div>
                    <div className="rounded-xl border border-slate-800 bg-[#0d1117] overflow-hidden shadow-md">
                      <div className="flex items-center gap-1.5 px-4 py-2.5 bg-[#161b22] border-b border-slate-700">
                        <span className="w-3 h-3 rounded-full bg-red-500/70" />
                        <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
                        <span className="w-3 h-3 rounded-full bg-green-500/70" />
                        <span className="ml-3 text-[11px] font-mono text-slate-500">answer.js</span>
                      </div>
                      <textarea
                        value={textResponseDraft[current.id] ?? selectedAnswer ?? ""}
                        onChange={(e) => {
                          setTextResponseDraft((prev) => ({ ...prev, [current.id]: e.target.value }));
                        }}
                        onBlur={(e) => saveTextResponse(e.target.value)}
                        placeholder={"// Write your code here…\n"}
                        rows={12}
                        spellCheck={false}
                        className="w-full bg-transparent px-5 py-4 text-[14px] font-mono text-slate-100 leading-relaxed resize-y focus:outline-none placeholder:text-slate-600"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-4 text-sm text-slate-500 italic">
                    {`Question type: ${current.type}. Options not configured.`}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* ── Submit Confirmation Modal ── */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Blurred backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => !submitting && setShowSubmitModal(false)}
          />

          {/* Modal card */}
          <div className="relative z-10 bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md mx-4 p-8 flex flex-col items-center gap-6">
            {/* Icon */}
            <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center">
              <CheckCircle2 size={32} className="text-emerald-500" />
            </div>

            {/* Copy */}
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Submit Quiz?
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                You&apos;ve answered{" "}
                <span className="font-semibold text-slate-700">
                  {answeredCount} of {questions.length}
                </span>{" "}
                questions. Once submitted you won&apos;t be able to make changes.
              </p>
            </div>

            {/* Unanswered warning */}
            {!allAnswered && (
              <div className="w-full rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 flex items-start gap-3">
                <AlertCircle size={16} className="text-amber-500 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-700 leading-relaxed">
                  <span className="font-semibold">
                    {questions.length - answeredCount} question
                    {questions.length - answeredCount !== 1 ? "s" : ""} unanswered.
                  </span>{" "}
                  You can still go back and answer them before submitting.
                </p>
              </div>
            )}

            {/* Submit error */}
            {submitError && (
              <div className="w-full rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-xs text-red-700">
                {submitError}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 w-full">
              <Button
                variant="outline"
                className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50 font-medium"
                onClick={() => setShowSubmitModal(false)}
                disabled={submitting}
              >
                Go Back
              </Button>
              <Button
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-2 rounded-xl"
                onClick={handleConfirmSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    Submitting…
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={14} />
                    Confirm Submit
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}