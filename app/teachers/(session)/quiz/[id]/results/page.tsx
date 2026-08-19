"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Clock, Users, Award, ChevronRight, ChevronLeft } from "lucide-react";
import { StudentResultSummary } from "@/lib/data";

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}m ${s}s`;
}

export default function QuizResultsPage() {
  const { id: quizId } = useParams<{ id: string }>();
  const router = useRouter();

  const [quizName, setQuizName] = useState("");
  const [, setTotalPoints] = useState(0);
  const [results, setResults] = useState<StudentResultSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResults() {
      setLoading(true);

      const { data: quiz, error: quizError } = await supabase
        .from("quizzes")
        .select("name, total_marks")
        .eq("id", quizId)
        .single();
      if (quizError) console.log("Error fetching quiz", quizError);
      setQuizName(quiz?.name ?? "");
      setTotalPoints(quiz?.total_marks ?? 0);

      const { data: attempts, error: aError } = await supabase
        .from("quiz_attempts")
        .select("student_id, score, percentage, status, time_spent_seconds, started_at, submitted_at")
        .eq("quiz_id", quizId);
      if (aError) console.log("Error fetching attempts", aError);

      if (!attempts || attempts.length === 0) {
        setResults([]);
        setLoading(false);
        return;
      }

      const studentIds = attempts.map((a) => a.student_id);
      const { data: profiles, error: pError } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, avatar_initials")
        .in("id", studentIds);
      if (pError) console.log("Error fetching profiles", pError);

      const profileById = new Map(profiles?.map((p) => [p.id, p]));

      const summaries: StudentResultSummary[] = attempts.map((a) => {
        const profile = profileById.get(a.student_id);
        return {
          student_id: a.student_id,
          full_name: profile?.full_name ?? "Unknown Student",
          avatar_url: profile?.avatar_url ?? null,
          avatar_initials: profile?.avatar_initials ?? null,
          score: a.score,
          total_points: quiz?.total_marks ?? 0,
          percentage: a.percentage ?? 0,
          time_spent_seconds: a.time_spent_seconds ?? 0,
          status: a.status,
          started_at: a.started_at,
          submitted_at: a.submitted_at,
        };
      });

      summaries.sort((a, b) => b.percentage - a.percentage);
      setResults(summaries);
      setLoading(false);
    }

    fetchResults();
  }, [quizId]);

  const completedCount = results.filter((r) => r.status !== "in_progress").length;
  const inProgressCount = results.filter((r) => r.status === "in_progress").length;
  const avgPercentage = results.length
    ? Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / results.length)
    : 0;

  return (
    <div className="bg-surface flex-1 flex flex-col min-h-screen">

      {/* Back Button */}
      <div className="px-6 pt-5 pb-0">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-sub hover:text-brand-navy transition-colors group"
        >
          <ChevronLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Back
        </button>
      </div>

      <main className="p-8 max-w-400 mx-auto w-full space-y-8 pt-4">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-brand-navy tracking-tight">{quizName || "Quiz Results"}</h1>
            <p className="text-slate-500 text-sm mt-0.5">Results for every student who attempted this quiz.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-slate-100 shadow-soft rounded-2xl">
            <CardContent className="p-6">
              <div className="p-2.5 bg-slate-50 rounded-xl w-fit mb-4"><Users className="h-5 w-5 text-slate-600" /></div>
              <p className="text-xs font-bold uppercase tracking-widest text-brand-subtitle">Total Attempts</p>
              <p className="text-4xl font-black text-brand-navy mt-1">{results.length}</p>
            </CardContent>
          </Card>
          <Card className="border-slate-100 shadow-soft rounded-2xl">
            <CardContent className="p-6">
              <div className="p-2.5 bg-slate-50 rounded-xl w-fit mb-4"><Award className="h-5 w-5 text-slate-600" /></div>
              <p className="text-xs font-bold uppercase tracking-widest text-brand-subtitle">Average Score</p>
              <p className="text-4xl font-black text-brand-navy mt-1">{avgPercentage}%</p>
            </CardContent>
          </Card>
          <Card className="border-slate-100 shadow-soft rounded-2xl">
            <CardContent className="p-6">
              <div className="p-2.5 bg-slate-50 rounded-xl w-fit mb-4"><Clock className="h-5 w-5 text-slate-600" /></div>
              <p className="text-xs font-bold uppercase tracking-widest text-brand-subtitle">Completed / In Progress</p>
              <p className="text-4xl font-black text-brand-navy mt-1">
                {completedCount} <span className="text-lg text-brand-subtitle font-bold">/ {inProgressCount}</span>
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-slate-100 shadow-soft rounded-2xl">
          <CardHeader className="px-6 pt-6 pb-2">
            <CardTitle className="text-lg font-bold text-brand-navy">Student Results</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-100 hover:bg-transparent">
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-brand-subtitle">Student</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-brand-subtitle text-center">Score</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-brand-subtitle text-center">Time Taken</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-brand-subtitle text-center">Status</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-brand-subtitle text-center">Submitted</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {!loading && results.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-sm text-brand-subtitle py-8">
                      No student have attempted this quiz yet.
                    </TableCell>
                  </TableRow>
                )}
                {results.map((r) => (
                  <TableRow
                    key={r.student_id}
                    className="border-slate-100 group cursor-pointer transition-colors hover:bg-slate-50"
                    onClick={() => router.push(`/teachers/quiz/${quizId}/results/${r.student_id}`)}
                  >
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-brand-light flex items-center justify-center text-xs font-bold text-brand-blue shrink-0">
                          {r.avatar_initials ?? r.full_name?.slice(0, 2).toUpperCase()}
                        </div>
                        <p className="text-sm font-bold text-slate-800 group-hover:text-brand-blue transition-colors">{r.full_name}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-sm font-bold text-slate-700">
                      {r.score}/{r.total_points} <span className="text-brand-subtitle font-medium">({Math.round(r.percentage)}%)</span>
                    </TableCell>
                    <TableCell className="text-center text-sm font-medium text-slate-600">{formatTime(r.time_spent_seconds)}</TableCell>
                    <TableCell className="text-center">
                      <Badge className={r.status !== "in_progress" ? "bg-emerald-50 text-emerald-600 border-none font-bold" : "bg-amber-50 text-amber-600 border-none font-bold"}>
                        {r.status !== "in_progress" ? "Completed" : "In Progress"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center text-xs text-brand-subtitle font-medium">
                      {r.submitted_at ? new Date(r.submitted_at).toLocaleString() : "—"}
                    </TableCell>
                    <TableCell><ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}