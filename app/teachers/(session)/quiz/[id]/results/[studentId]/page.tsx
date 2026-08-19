"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, XCircle, Flag, Clock } from "lucide-react";
import { Question, QuestionResponse, QuizAttemptRecord } from "@/lib/data";

interface QuestionWithResponse extends Question {
  response: QuestionResponse | null;
}

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}m ${s}s`;
}

export default function StudentResultDetailPage() {
  const { id: quizId, studentId } = useParams<{ id: string; studentId: string }>();
  const router = useRouter();

  const [quizName, setQuizName] = useState("");
  const [studentName, setStudentName] = useState("");
  const [attempt, setAttempt] = useState<QuizAttemptRecord | null>(null);
  const [items, setItems] = useState<QuestionWithResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDetail() {
      setLoading(true);

      const { data: quiz, error: quizError } = await supabase
        .from("quizzes").select("name, total_marks").eq("id", quizId).single();
      if (quizError) console.log("Error fetching quiz", quizError);
      setQuizName(quiz?.name ?? "");

      const { data: profile, error: profileError } = await supabase
        .from("profiles").select("full_name").eq("id", studentId).single();
      if (profileError) console.log("Error fetching profile", profileError);
      setStudentName(profile?.full_name ?? "Unknown Student");

      const { data: attemptData, error: attemptError } = await supabase
        .from("quiz_attempts")
        .select("*")
        .eq("quiz_id", quizId)
        .eq("student_id", studentId)
        .maybeSingle();
      if (attemptError) console.log("Error fetching attempt", attemptError);
      setAttempt(attemptData ?? null);

      const { data: questions, error: qError } = await supabase
        .from("questions")
        .select("*")
        .eq("quiz_id", quizId)
        .order("order_index", { ascending: true });
      if (qError) console.log("Error fetching questions", qError);

      const questionIds = questions?.map((q) => q.id) ?? [];

      const { data: responses, error: rError } = await supabase
        .from("question_responses")
        .select("*")
        .eq("student_id", studentId)
        .in("question_id", questionIds);
      if (rError) console.log("Error fetching responses", rError);

      const responseByQuestion = new Map(responses?.map((r) => [r.question_id, r]));

      const merged: QuestionWithResponse[] = (questions ?? []).map((q) => ({
        ...q,
        response: responseByQuestion.get(q.id) ?? null,
      }));

      setItems(merged);
      setLoading(false);
    }

    fetchDetail();
  }, [quizId, studentId]);

  const answeredCount = items.filter((i) => i.response !== null).length;
  const totalPoints = items.reduce((sum, i) => sum + i.points, 0);

  return (
    <div className="bg-surface flex-1 flex flex-col min-h-screen">
      <main className="p-8 max-w-400 mx-auto w-full space-y-8">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-xl border-slate-200"
            onClick={() => router.push(`/teachers/quiz/${quizId}/results`)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-extrabold text-brand-navy tracking-tight">{studentName}</h1>
            <p className="text-slate-500 text-sm mt-0.5">{quizName}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-slate-100 shadow-soft rounded-2xl">
            <CardContent className="p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-brand-subtitle">Score</p>
              <p className="text-4xl font-black text-brand-navy mt-1">{attempt?.score ?? 0}/{totalPoints}</p>
            </CardContent>
          </Card>
          <Card className="border-slate-100 shadow-soft rounded-2xl">
            <CardContent className="p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-brand-subtitle">Percentage</p>
              <p className="text-4xl font-black text-brand-navy mt-1">{Math.round(attempt?.percentage ?? 0)}%</p>
            </CardContent>
          </Card>
          <Card className="border-slate-100 shadow-soft rounded-2xl">
            <CardContent className="p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-brand-subtitle">Questions Answered</p>
              <p className="text-4xl font-black text-brand-navy mt-1">{answeredCount}/{items.length}</p>
            </CardContent>
          </Card>
          <Card className="border-slate-100 shadow-soft rounded-2xl">
            <CardContent className="p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-brand-subtitle">Time Spent</p>
              <p className="text-4xl font-black text-brand-navy mt-1">{formatTime(attempt?.time_spent_seconds ?? 0)}</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center gap-3">
          <Badge className={attempt?.status !== "in_progress" ? "bg-emerald-50 text-emerald-600 border-none font-bold" : "bg-amber-50 text-amber-600 border-none font-bold"}>
            {attempt?.status !== "in_progress" ? "Completed" : "In Progress"}
          </Badge>
          {attempt?.submitted_at && (
            <span className="text-xs text-brand-subtitle font-medium">
              Submitted {new Date(attempt.submitted_at).toLocaleString()}
            </span>
          )}
        </div>

        <div className="space-y-4">
          {!loading && items.length === 0 && (
            <p className="text-sm text-brand-subtitle text-center py-8">No questions found for this quiz.</p>
          )}
          {items.map((item, idx) => {
            const r = item.response;
            return (
              <Card key={item.id} className="border-slate-100 shadow-soft rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-start gap-3">
                      <span className="text-xs font-bold text-brand-subtitle mt-0.5">Q{idx + 1}</span>
                      <p className="text-sm font-bold text-slate-800">{item.title || item.body}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {r?.flagged_for_review && <Flag className="h-4 w-4 text-amber-500" />}
                      {r === null ? (
                        <Badge className="bg-slate-100 text-slate-500 border-none font-bold">Unanswered</Badge>
                      ) : r.is_correct ? (
                        <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Correct
                        </Badge>
                      ) : (
                        <Badge className="bg-red-50 text-red-500 border-none font-bold gap-1">
                          <XCircle className="h-3.5 w-3.5" /> Incorrect
                        </Badge>
                      )}
                    </div>
                  </div>

                  {item.body && item.title && (
                    <p className="text-sm text-slate-600 mb-3">{item.body}</p>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-brand-subtitle mb-1">Student&apos;s Answer</p>
                      <p className="font-medium text-slate-700">{r?.selected_option ?? r?.text_response ?? "—"}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-brand-subtitle mb-1">Correct Answer</p>
                      <p className="font-medium text-slate-700">{item.answer ?? "—"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-3 text-xs text-brand-subtitle font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {r?.time_spent_sec != null ? formatTime(r.time_spent_sec) : "—"}
                    </span>
                    <span>{item.points} pt{item.points !== 1 ? "s" : ""}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}