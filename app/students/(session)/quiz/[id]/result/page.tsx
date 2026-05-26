"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  XCircle,
  CheckCheck,
  Clock,
  BarChart2,
  Download,
  Share2,
  Info,
  ChevronRight,
  Timer,
  Loader2,
} from "lucide-react";
import { toPascalCase } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────

interface Quiz {
  id: string;
  name: string;
  difficulty: string | null;
  duration_minutes: number | null;
  passing_score: number | null;
  question_count: number;
  topics: string[] | null;
}

interface Question {
  id: string;
  /** Short label / stem prefix */
  title: string | null;
  /** Full question body text */
  body: string;
  type: string;
  order_index: number;
  points: number;
  /** JSONB options array — each element is either a plain string or { label, value } */
  options: Array<string | { label: string; value: string }> | null;
  /** The correct answer value (matches the stored selected_option format) */
  answer: string | null;
  /** Explanation shown after answering */
  feedback: string | null;
  /** subject FK — optional, not needed for display */
  subject_id?: string | null;
  /** Topic this question belongs to */
  topic?: string | null;
}

interface QuestionResponse {
  question_id: string;
  selected_option: string | null;
  /** Free-text answer for open-ended questions */
  text_response: string | null;
  /** DB-stored grading value — may be null; recomputed client-side via checkAnswer() */
  is_correct: boolean | null;
  time_spent_sec: number | null;
  flagged_for_review: boolean;
}

interface EnrichedResponse {
  response: QuestionResponse;
  question: Question;
  selectedOptionText: string | null;
  /** Text label of the correct answer (resolved from question.answer) */
  correctOptionText: string | null;
}

interface TopicScore {
  topic: string;
  correct: number;
  total: number;
  percentage: number;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/**
 * Derive correctness client-side by comparing the student's answer against
 * the question's stored answer field.
 *
 * - MCQ  : selected_option must match question.answer (case-insensitive trim)
 * - Open : text_response must match question.answer   (case-insensitive trim)
 * - Falls back to the DB is_correct flag when question.answer is null
 *   (e.g. manually graded or not yet set).
 */
function checkAnswer(
  question: Question,
  response: Pick<QuestionResponse, "selected_option" | "text_response" | "is_correct">
): boolean | null {
  if (!question.answer) {
    // No answer key — trust the DB flag (manual grading path)
    return response.is_correct ?? null;
  }

  const normalize = (s: string) => s.trim().toLowerCase();
  const expected  = normalize(question.answer);

  // MCQ: compare selected_option
  if (response.selected_option !== null) {
    return normalize(response.selected_option) === expected;
  }

  // Open-ended: compare text_response
  if (response.text_response !== null) {
    return normalize(response.text_response) === expected;
  }

  // No answer submitted
  return false;
}

function buildTopicScores(enriched: EnrichedResponse[]): TopicScore[] {
  const map = new Map<string, { correct: number; total: number }>();
  for (const { response, question } of enriched) {
    const topic = question.topic ?? "General";
    const entry = map.get(topic) ?? { correct: 0, total: 0 };
    entry.total += 1;
    if (response.is_correct) entry.correct += 1;
    map.set(topic, entry);
  }
  return Array.from(map.entries()).map(([topic, { correct, total }]) => ({
    topic,
    correct,
    total,
    percentage: total > 0 ? Math.round((correct / total) * 100) : 0,
  }));
}

// ── Sub-components ─────────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div className="relative w-36 h-36 shrink-0">
      <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
        <circle cx="70" cy="70" r={r} fill="none" stroke="#e5e7eb" strokeWidth="12" />
        <circle
          cx="70" cy="70" r={r}
          fill="none" stroke="#1e3a8a" strokeWidth="12" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold text-slate-900 leading-none">{score}%</span>
        <span className="text-[10px] font-semibold text-slate-500 tracking-widest uppercase mt-0.5">
          Final Score
        </span>
      </div>
    </div>
  );
}

function TopicBar({ name, score }: { name: string; score: number }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-slate-700">{name}</span>
        <span className={`text-sm font-bold ${
          score === 100 ? "text-emerald-600" : score >= 80 ? "text-blue-700" : "text-slate-600"
        }`}>
          {score}%
        </span>
      </div>
      <Progress value={score} className="h-2 bg-slate-100" />
    </div>
  );
}

function QuestionCard({ enriched, index }: { enriched: EnrichedResponse; index: number }) {
  const { response, question, selectedOptionText, correctOptionText } = enriched;
  const isCorrect = response.is_correct === true;

  /** Normalise an option to a plain display string */
  function optionText(opt: string | { label: string; value: string }): string {
    return typeof opt === "string" ? opt : opt.label ?? opt.value;
  }

  /** The stored value key used to match selected_option / answer */
  function optionValue(opt: string | { label: string; value: string }): string {
    return typeof opt === "string" ? opt : opt.value;
  }

  return (
    <Card className="border border-slate-200 shadow-sm overflow-hidden">
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3">
          <div className="flex items-center gap-2.5">
            {isCorrect
              ? <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              : <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            }
            <span className={`text-xs font-bold tracking-wider uppercase ${
              isCorrect ? "text-emerald-600" : "text-rose-600"
            }`}>
              Question {index + 1} — {isCorrect ? "Correct" : "Incorrect"}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {response.time_spent_sec != null && (
              <Badge variant="secondary" className="text-xs text-slate-500 bg-slate-100 border-0 gap-1 whitespace-nowrap">
                <Timer className="w-3 h-3" />
                {formatTime(response.time_spent_sec)}
              </Badge>
            )}
            {question.type && (
              <Badge variant="secondary" className="text-xs text-slate-500 bg-slate-100 border-0 whitespace-nowrap">
                {toPascalCase(question.type)}
              </Badge>
            )}
            {question.points > 1 && (
              <Badge variant="secondary" className="text-xs text-slate-500 bg-slate-100 border-0 whitespace-nowrap">
                {question.points} Points
              </Badge>
            )}
          </div>
        </div>

        {/* Question text — title (if present) + body */}
        <p className="flex flex-col text-slate-800 font-medium leading-snug px-5 pb-4 text-[15px] gap-2">
          {question.title ? <span className="text-slate-500 font-normal">{question.title}</span> : null}
          {question.body}
        </p>

        {/* Options — rendered from options JSONB column */}
        {(question.options ?? []).length > 0 && (
          <div className="px-5 pb-4 space-y-2">
            {(question.options ?? []).map((opt, idx) => {
              const display = optionText(opt);
              const value   = optionValue(opt);
              const norm = (s: string) => s.trim().toLowerCase();
              const isSelected = selectedOptionText != null && (
                norm(value) === norm(selectedOptionText) || norm(display) === norm(selectedOptionText)
              );
              const isAnswer = question.answer != null && (
                norm(value) === norm(question.answer) || norm(display) === norm(question.answer)
              );

              let rowStyle = "border-slate-200 bg-white";
              let icon: React.ReactNode = null;

              if (isSelected && isCorrect) {
                rowStyle = "border-emerald-300 bg-emerald-50/60";
                icon = <CheckCheck className="w-4 h-4 text-emerald-600 shrink-0" />;
              } else if (isSelected && !isCorrect) {
                rowStyle = "border-rose-300 bg-rose-50/60";
                icon = <XCircle className="w-4 h-4 text-rose-500 shrink-0" />;
              } else if (!isCorrect && isAnswer) {
                // Highlight the correct answer when the student got it wrong
                rowStyle = "border-emerald-200 bg-emerald-50/40";
                icon = <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
              }

              return (
                <div key={idx} className={`flex items-center justify-between gap-2 rounded-lg border px-4 py-3 ${rowStyle}`}>
                  <span className="text-sm font-medium text-slate-800">{display}</span>
                  {icon}
                </div>
              );
            })}
          </div>
        )}

        {/* Correct answer label when no options are shown (open-ended) */}
        {(question.options ?? []).length === 0 && correctOptionText && (
          <div className="px-5 pb-4">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/40 px-4 py-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="text-sm font-medium text-slate-800">{correctOptionText}</span>
            </div>
          </div>
        )}

        {/* Student's text / code response (open-ended questions) */}
        {response.text_response && (
          <div className="mx-5 mb-4 rounded-lg border border-slate-200 overflow-hidden">
            <div className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 border-b border-slate-200">
              <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500">
                Your Response
              </span>
            </div>
            {/* Detect code blocks (triple backtick fences) */}
            {response.text_response.includes("```") ? (
              <div className="divide-y divide-slate-200">
                {response.text_response.split(/(```[\s\S]*?```)/g).map((part, i) => {
                  const codeMatch = part.match(/^```(\w*)\n?([\s\S]*?)```$/);
                  if (codeMatch) {
                    const lang = codeMatch[1];
                    const code = codeMatch[2];
                    return (
                      <div key={i}>
                        {lang && (
                          <div className="px-4 py-1.5 bg-slate-800 flex items-center gap-2">
                            <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400">{lang}</span>
                          </div>
                        )}
                        <pre className="bg-slate-900 text-slate-100 text-xs leading-relaxed px-4 py-3 overflow-x-auto whitespace-pre-wrap wrap-break-word">
                          <code>{code.trimEnd()}</code>
                        </pre>
                      </div>
                    );
                  }
                  return part.trim() ? (
                    <p key={i} className="text-sm text-slate-700 leading-relaxed px-4 py-3 whitespace-pre-wrap">{part.trim()}</p>
                  ) : null;
                })}
              </div>
            ) : (
              <p className="text-sm text-slate-700 leading-relaxed px-4 py-3 whitespace-pre-wrap">
                {response.text_response}
              </p>
            )}
          </div>
        )}

        {/* Feedback — from the schema's dedicated feedback column */}
        {question.feedback && (
          <div className="mx-5 mb-5 rounded-lg bg-slate-50 border border-slate-200 px-4 py-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500">
                Feedback
              </span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{question.feedback}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


export default function QuizResult() {
  const params = useParams<{ id: string }>();
  const quizId = params.id;

  const [filter, setFilter] = useState<"all" | "correct" | "incorrect">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [enrichedResponses, setEnrichedResponses] = useState<EnrichedResponse[]>([]);
  const [totalTimeSpentSec, setTotalTimeSpentSec] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [topicScores, setTopicScores] = useState<TopicScore[]>([]);

  useEffect(() => {
    async function load() {
      const supabase = createClient();

      setLoading(true);
      setError(null);
      try {
        // 1. Get the logged-in user from auth session
        const { data: { user }, error: authErr } = await supabase.auth.getUser();
        if (authErr || !user) throw new Error("Not authenticated");

        // 2. Resolve their student record
        const { data: student, error: studentErr } = await supabase
          .from("students")
          .select("id")
          .eq("user_id", user.id)
          .single();
        if (studentErr || !student) throw new Error("Student record not found");

        const studentId = student.id;

        // 3. Fetch quiz
        const { data: quizData, error: quizErr } = await supabase
          .from("quizzes")
          .select("id, name, difficulty, duration_minutes, passing_score, question_count, topics")
          .eq("id", quizId)
          .single();
        if (quizErr || !quizData) throw new Error("Quiz not found");
        setQuiz(quizData);

        // 4. Fetch questions — select all relevant schema columns
        const { data: questions, error: qErr } = await supabase
          .from("questions")
          .select(`id, title, body, type, order_index, points, options, answer, feedback, topic`)
          .eq("quiz_id", quizId)
          .order('order_index');
        if (qErr || !questions) throw new Error("Failed to load questions");

        // 5. Fetch this student's responses
        const questionIds = questions.map((q) => q.id);
        const { data: responses, error: rErr } = await supabase
          .from("question_responses")
          .select("question_id, selected_option, text_response, is_correct, time_spent_sec, flagged_for_review")
          .eq("student_id", studentId)
          .in("question_id", questionIds);
        if (rErr) throw new Error("Failed to load responses");

        const responseMap = new Map((responses ?? []).map((r) => [r.question_id, r]));

        // 6. Enrich
        const enriched: EnrichedResponse[] = questions.map((q) => {
          const question: Question = {
            id:          q.id,
            title:       q.title ?? null,
            body:        q.body,
            type:        q.type,
            order_index: q.order_index,
            points:      q.points,
            options:     (q.options ?? null) as Question["options"],
            answer:      q.answer ?? null,
            feedback:    q.feedback ?? null,
            topic:       q.topic ?? null,
          };
          const rawResponse = responseMap.get(question.id) ?? {
            question_id:        question.id,
            selected_option:    null,
            text_response:      null,
            is_correct:         null,
            time_spent_sec:     null,
            flagged_for_review: false,
          };

          // Recompute correctness from the answer key rather than trusting the stored flag
          const response: QuestionResponse = {
            ...rawResponse,
            is_correct: checkAnswer(question, rawResponse),
          };

          // selected_option stores the raw answer value (string or option key)
          const selectedOptionText = response.selected_option ?? null;

          // Resolve the correct answer display text from the options array
          const opts = question.options ?? [];
          let correctOptionText: string | null = question.answer;
          if (question.answer && opts.length > 0) {
            const match = opts.find((o) =>
              typeof o === "string" ? o === question.answer : o.value === question.answer
            );
            if (match) {
              correctOptionText = typeof match === "string" ? match : match.label ?? match.value;
            }
          }

          return { response, question, selectedOptionText, correctOptionText };
        });

        setEnrichedResponses(enriched);
        setCorrectCount(enriched.filter((e) => e.response.is_correct === true).length);
        setTotalTimeSpentSec(enriched.reduce((sum, e) => sum + (e.response.time_spent_sec ?? 0), 0));
        setTopicScores(buildTopicScores(enriched));
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [quizId]);

  // ── Loading ──────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-sm font-medium">Loading your results…</p>
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────

  if (error || !quiz) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center text-slate-500">
          <XCircle className="w-10 h-10 mx-auto mb-3 text-rose-400" />
          <p className="font-semibold text-slate-700">Failed to load results</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  // ── Derived values ───────────────────────────────────────────────────────

  const totalCount = enrichedResponses.length;
  const scorePercent = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
  const passed = quiz.passing_score != null ? scorePercent >= quiz.passing_score : scorePercent >= 60;

  const filtered = enrichedResponses.filter((e) => {
    if (filter === "correct") return e.response.is_correct === true;
    if (filter === "incorrect") return e.response.is_correct !== true;
    return true;
  });

  const tabs = [
    { key: "all" as const, label: "All" },
    { key: "correct" as const, label: "Correct" },
    { key: "incorrect" as const, label: "Incorrect" },
  ];

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="max-w-7xl mx-auto px-4 py-10 space-y-6">

        {/* Score Card */}
        <Card className="border border-slate-200 shadow-sm">
          <CardContent className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6">
            <ScoreRing score={scorePercent} />
            <div className="flex-1 text-center sm:text-left pt-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 my-4">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{quiz.name}</h1>
                <Badge className={`gap-1 self-center sm:self-auto border ${
                  passed
                    ? "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                    : "bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-100"
                }`}>
                  {passed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  {passed ? "Quiz Passed" : "Quiz Failed"}
                </Badge>
              </div>
              <div className="flex flex-wrap justify-center sm:justify-start gap-10">
                <div>
                  <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-0.5">Raw Score</p>
                  <p className="text-xl font-bold text-slate-800">{correctCount} / {totalCount}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-0.5">Time Spent</p>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <p className="text-xl font-bold text-slate-800">{formatTime(totalTimeSpentSec)}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Body */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* Sidebar */}
          <div className="w-full lg:w-64 shrink-0 space-y-4">
            {topicScores.length > 0 && (
              <Card className="border border-slate-200 shadow-sm">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-slate-600" />
                    <h2 className="font-bold text-slate-800 text-sm tracking-tight">Topic Analysis</h2>
                  </div>
                  <Separator />
                  <div className="space-y-4">
                    {topicScores.map((t) => (
                      <TopicBar key={t.topic} name={t.topic} score={t.percentage} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            <div className="space-y-2">
              <Button className="w-full bg-blue-900 hover:bg-blue-800 text-white gap-2">
                <Download className="w-4 h-4" />
                Download Result
              </Button>
              <Button variant="outline" className="w-full gap-2 border-slate-300">
                <Share2 className="w-4 h-4" />
                Share Result
              </Button>
            </div>
          </div>

          {/* Question Review */}
          <div className="flex-1 min-w-0 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                Detailed Question Review
              </h2>
              <div className="flex rounded-lg border border-slate-200 overflow-hidden bg-white shadow-sm">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key)}
                    className={`px-3 py-1.5 text-xs font-semibold tracking-wide uppercase transition-colors ${
                      filter === tab.key ? "bg-brand-navy text-white" : "text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              {filtered.length > 0 ? (
                filtered.map((e, i) => (
                  <QuestionCard key={e.response.question_id} enriched={e} index={i} />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <ChevronRight className="w-8 h-8 mb-2 opacity-30" />
                  <p className="text-sm font-medium">No questions in this category</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}