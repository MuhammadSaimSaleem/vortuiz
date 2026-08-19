"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { useProfile } from "@/contexts/ProfileContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowUpDown,
  Download,
  Mail,
  MoreVertical,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Search,
  Plus,
  Pencil,
  BookMarked,
  Trophy,
  Zap,
  AlertTriangle,
  Target,
  BookOpen,
  ArrowLeft,
  CalendarDays,
  IdCard,
  Radio,
  Users,
  Loader2,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// ─── Types ────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

interface SubjectOption {
  id: string;
  name: string;
}

interface Student {
  id: string; // profiles.id / students.user_id (uuid)
  studentCode: string; // students.student_code — human-readable, display only
  name: string;
  email: string;
  avatar: string;
  initials: string;
  department: string | null;
  gradeLevel: string | null;
  subjects: SubjectOption[];
  score: number; // students.overall_percentile
  accuracyRate: number; // students.accuracy_rate
  topSubject: string | null; // students.top_subject
  trend: Trend; // no historical snapshot in schema yet — always "neutral"
  completion: number; // % of quiz_attempts with status = 'completed'
  lastActive: string;
  totalSpent: string;
  enrolled: string;
}

type Trend = "up" | "down" | "neutral";

type View = { type: "directory" } | { type: "profile"; studentId: string };

type DirectoryTab = "manage" | "live";

interface Insight {
  id: string;
  icon: "fast" | "review" | "resilience" | "methodical";
  title: string;
  description: string;
}

interface QuizAttempt {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  score: number;
  maxScore: number;
  percentage: number;
  timePerQuestion: string;
  status: "PASSED" | "FAILED";
}

const PAGE_SIZE = 10;

// ─────────────────────────────────────────────────────────────────────────────
// ─── Helpers ──────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

function TrendIcon({ trend }: { trend: string }) {
  if (trend === "up")
    return <TrendingUp className="w-4 h-4 text-green-500 inline ml-1" />;
  if (trend === "down")
    return <TrendingDown className="w-4 h-4 text-red-500 inline ml-1" />;
  return <Minus className="w-4 h-4 text-gray-400 inline ml-1" />;
}

function isOnlineNow(lastActive: string) {
  return lastActive.startsWith("Today");
}

function formatSyncAgo(seconds: number): string {
  if (seconds < 5) return "Just now";
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return `${Math.floor(seconds / 3600)}h ago`;
}

function initialsFromName(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatLastActive(iso: string | null): string {
  if (!iso) return "Never";
  const date = new Date(iso);
  const now = new Date();
  const time = date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  if (date.toDateString() === now.toDateString()) return `Today, ${time}`;

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return `Yesterday, ${time}`;

  return date.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

function formatEnrolled(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function formatHoursSpent(totalSeconds: number): string {
  const hours = totalSeconds / 3600;
  if (hours < 1) return `${Math.round(totalSeconds / 60)}m total spent`;
  return `${hours.toFixed(hours < 10 ? 1 : 0)}h total spent`;
}

function formatAvgTime(seconds: number | null): string {
  if (!seconds) return "—";
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s ? `${m}m ${s}s` : `${m}m`;
}

const insightIconConfig: Record<
  Insight["icon"],
  { icon: React.ReactNode; bg: string; iconColor: string; titleColor: string }
> = {
  fast: {
    icon: <Zap className="w-5 h-5" />,
    bg: "bg-blue-50 border-blue-100",
    iconColor: "text-blue-500",
    titleColor: "text-blue-600",
  },
  review: {
    icon: <AlertTriangle className="w-5 h-5" />,
    bg: "bg-orange-50 border-orange-100",
    iconColor: "text-orange-500",
    titleColor: "text-orange-500",
  },
  resilience: {
    icon: <Target className="w-5 h-5" />,
    bg: "bg-green-50 border-green-100",
    iconColor: "text-green-500",
    titleColor: "text-green-600",
  },
  methodical: {
    icon: <BookOpen className="w-5 h-5" />,
    bg: "bg-purple-50 border-purple-100",
    iconColor: "text-purple-500",
    titleColor: "text-purple-600",
  },
};

const KNOWN_INSIGHT_ICONS = new Set(Object.keys(insightIconConfig));

// ─────────────────────────────────────────────────────────────────────────────
// ─── Radar Chart (pure SVG, no deps) ─────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

function RadarChart({
  skills,
}: {
  skills: { subject: string; score: number }[];
}) {
  const cx = 200;
  const cy = 200;
  const maxR = 140;
  const n = skills.length;

  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;

  const point = (i: number, r: number) => ({
    x: cx + r * Math.cos(angle(i)),
    y: cy + r * Math.sin(angle(i)),
  });

  const gridLevels = [0.25, 0.5, 0.75, 1];

  const studentPoints = skills
    .map((s, i) => point(i, (s.score / 100) * maxR))
    .map((p) => `${p.x},${p.y}`)
    .join(" ");

  const avgScore = skills.reduce((a, s) => a + s.score, 0) / n;
  const avgPoints = skills
    .map((_, i) => point(i, (avgScore / 100) * maxR))
    .map((p) => `${p.x},${p.y}`)
    .join(" ");

  return (
    <svg viewBox="0 0 400 400" className="w-full max-w-sm mx-auto">
      {gridLevels.map((lvl) => (
        <polygon
          key={lvl}
          points={skills
            .map((_, i) => point(i, lvl * maxR))
            .map((p) => `${p.x},${p.y}`)
            .join(" ")}
          fill="none"
          stroke="var(--border)"
          strokeWidth="1"
        />
      ))}

      {skills.map((_, i) => {
        const outer = point(i, maxR);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={outer.x}
            y2={outer.y}
            stroke="var(--border)"
            strokeWidth="1"
          />
        );
      })}

      <polygon
        points={avgPoints}
        fill="oklch(0.85 0.05 260 / 0.35)"
        stroke="oklch(0.75 0.05 260)"
        strokeWidth="1.5"
      />

      <polygon
        points={studentPoints}
        fill="oklch(0.55 0.20 260 / 0.18)"
        stroke="var(--brand-dark)"
        strokeWidth="2"
      />

      {skills.map((s, i) => {
        const labelR = maxR + 22;
        const p = point(i, labelR);
        return (
          <text
            key={i}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="12"
            fill="oklch(0.45 0 0)"
            fontFamily="inherit"
          >
            {s.subject}
          </text>
        );
      })}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ─── Behavioral Insights Section ─────────────────────────────────────────────
// Pulls real rows from `behavioral_insights` and `quiz_attempts` for one student.
// ─────────────────────────────────────────────────────────────────────────────

function BehavioralInsightsSection({ studentId }: { studentId: string }) {
  const { data: insights = [], isLoading: insightsLoading } = useQuery({
    queryKey: ["behavioral-insights", studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("behavioral_insights")
        .select("id, icon_type, title, description")
        .eq("student_id", studentId)
        .order("generated_at", { ascending: false })
        .limit(4);
      if (error) throw error;
      return (data ?? [])
        .filter((row) => row.icon_type && KNOWN_INSIGHT_ICONS.has(row.icon_type))
        .map(
          (row): Insight => ({
            id: row.id,
            icon: row.icon_type as Insight["icon"],
            title: row.title,
            description: row.description ?? "",
          })
        );
    },
  });

  const { data: quizAttempts = [], isLoading: attemptsLoading } = useQuery({
    queryKey: ["quiz-attempts", studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quiz_attempts")
        .select(
          `
          id, score, percentage, avg_time_per_question_sec, submitted_at,
          quizzes ( name, description, question_count )
        `
        )
        .eq("student_id", studentId)
        .not("submitted_at", "is", null)
        .order("submitted_at", { ascending: false })
        .limit(10);
      if (error) throw error;

      return (data ?? []).map((row): QuizAttempt => {
        const quiz = row.quizzes as unknown as {
          name: string;
          description: string | null;
          question_count: number;
        } | null;
        const percentage = row.percentage ?? 0;
        return {
          id: row.id,
          title: quiz?.name ?? "Untitled Quiz",
          subtitle:
            quiz?.description ?? `${quiz?.question_count ?? 0} Questions`,
          date: row.submitted_at
            ? new Date(row.submitted_at).toLocaleDateString("en-US", {
                month: "short",
                day: "2-digit",
                year: "numeric",
              })
            : "—",
          score: row.score,
          maxScore: quiz?.question_count ?? row.score,
          percentage,
          // Passing threshold isn't wired to quizzes.passing_marks yet — using
          // a flat 50% cutoff as an approximation until that's hooked up.
          status: percentage >= 50 ? "PASSED" : "FAILED",
          timePerQuestion: formatAvgTime(row.avg_time_per_question_sec),
        };
      });
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-brand-dark flex items-center gap-2 mb-4">
          <span className="text-lg">🧠</span> Behavioral Insights
        </h2>

        {insightsLoading ? (
          <p className="text-sm text-muted-foreground">Loading insights…</p>
        ) : insights.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No behavioral insights recorded for this student yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {insights.map((insight) => {
              const cfg = insightIconConfig[insight.icon];
              return (
                <div key={insight.id} className={`rounded-2xl border p-4 ${cfg.bg}`}>
                  <div className={`mb-2 ${cfg.iconColor}`}>{cfg.icon}</div>
                  <p className={`font-bold text-sm mb-1 ${cfg.titleColor}`}>
                    {insight.title}
                  </p>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {insight.description}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Card className="bg-white rounded-2xl shadow-none border border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-brand-dark">Recent Quiz Attempts</h3>
          </div>

          {attemptsLoading ? (
            <p className="text-sm text-muted-foreground">Loading quiz attempts…</p>
          ) : quizAttempts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No submitted quiz attempts yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide pb-3 pr-4">
                      Quiz Title
                    </th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide pb-3 px-4">
                      Date
                    </th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide pb-3 px-4">
                      Score
                    </th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide pb-3 px-4">
                      Time/Question
                    </th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide pb-3 pl-4">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {quizAttempts.map((attempt) => (
                    <tr key={attempt.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 pr-4">
                        <p className="font-semibold text-brand-dark">{attempt.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {attempt.subtitle}
                        </p>
                      </td>
                      <td className="py-4 px-4 text-muted-foreground whitespace-nowrap">
                        {attempt.date}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <p className="font-bold text-brand-dark">
                          {attempt.score}/{attempt.maxScore}
                        </p>
                        <p
                          className={`text-xs font-semibold ${
                            attempt.status === "PASSED" ? "text-green-600" : "text-red-500"
                          }`}
                        >
                          {attempt.percentage.toFixed(1)}%
                        </p>
                      </td>
                      <td className="py-4 px-4 text-muted-foreground whitespace-nowrap">
                        {attempt.timePerQuestion}
                      </td>
                      <td className="py-4 pl-4">
                        <Badge
                          className={`text-[11px] font-bold px-3 py-1 rounded-full border-0 ${
                            attempt.status === "PASSED"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {attempt.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ─── Student Profile Screen ──────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

function StudentProfileScreen({
  student,
  onBack,
  onMessage,
}: {
  student: Student;
  onBack: () => void;
  onMessage: (student: Student) => void;
}) {
  const topPercentile =
    student.score >= 90 ? 5 : student.score >= 80 ? 15 : student.score >= 60 ? 25 : 50;

  // NOTE: true per-subject scoring would need aggregating question_responses
  // by quiz→subject. Until that's built, each assigned subject is shown at
  // the student's overall accuracy rate as an approximation.
  const skills =
    student.subjects.length > 0
      ? student.subjects
          .slice(0, 6)
          .map((s) => ({ subject: s.name, score: student.accuracyRate }))
      : [{ subject: "Overall", score: student.accuracyRate }];

  const topSubject = student.topSubject ?? student.subjects[0]?.name ?? "General Studies";

  return (
    <div className="min-h-screen bg-surface font-sans p-6 max-w-7xl mx-auto">
      <Button
        variant="ghost"
        className="mb-4 text-muted-foreground hover:text-foreground -ml-2"
        onClick={onBack}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Directory
      </Button>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <Card className="bg-white rounded-2xl shadow-none mb-5">
        <CardContent className="px-6 py-5 flex flex-wrap items-center gap-5">
          <div className="relative">
            <Avatar className="w-20 h-20 rounded-2xl">
              <AvatarImage src={student.avatar} />
              <AvatarFallback className="bg-brand-light text-brand-blue font-bold text-xl rounded-2xl">
                {student.initials}
              </AvatarFallback>
            </Avatar>
            {isOnlineNow(student.lastActive) && (
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-brand-dark">{student.name}</h1>
              <Badge className="bg-brand-blue text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                TOP {topPercentile}%
              </Badge>
            </div>
            <div className="flex flex-wrap gap-4 mt-1.5">
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <IdCard className="w-4 h-4" />
                Student ID: {student.studentCode}
              </span>
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <CalendarDays className="w-4 h-4" />
                Enrolled: {student.enrolled}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {student.subjects.map((subj) => (
                <Badge
                  key={subj.id}
                  variant="outline"
                  className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border-border text-muted-foreground"
                >
                  {subj.name}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex gap-3 ml-auto">
            <Button
              variant="outline"
              className="border-border bg-white text-sm font-medium"
              onClick={() => onMessage(student)}
            >
              <Mail className="w-4 h-4 mr-2" />
              Message
            </Button>
            <Button className="bg-brand-dark text-white hover:bg-brand-blue text-sm font-semibold transition-colors">
              <Download className="w-4 h-4 mr-2" />
              Full Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Main grid ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        <Card className="lg:col-span-2 bg-white rounded-2xl shadow-none">
          <CardContent className="px-6 py-5">
            <div className="flex items-start justify-between mb-1">
              <div>
                <h2 className="text-lg font-bold text-foreground">Skill Proficiency</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Performance across assigned subjects
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-dark inline-block" />
                  {student.name.split(" ")[0]}
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[oklch(0.75_0.05_260)] inline-block" />
                  Class Avg
                </span>
              </div>
            </div>
            <RadarChart skills={skills} />
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="bg-white rounded-2xl shadow-none">
            <CardContent className="px-5 py-5">
              <p className="text-[11px] font-semibold tracking-widest text-muted-foreground uppercase mb-2">
                Overall Percentile
              </p>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-4xl font-bold text-foreground">{student.score}%</span>
                <span className="text-sm font-semibold text-green-500 mb-1 flex items-center gap-0.5">
                  <TrendIcon trend={student.trend} />
                </span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-dark rounded-full transition-all"
                  style={{ width: `${student.score}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-2xl shadow-none">
            <CardContent className="px-5 py-5">
              <p className="text-[11px] font-semibold tracking-widest text-muted-foreground uppercase mb-4">
                Accuracy Rate
              </p>
              <div className="flex flex-col gap-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-foreground">
                      {student.name.split(" ")[0]}
                    </span>
                    <span className="text-muted-foreground font-semibold">
                      {student.accuracyRate}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-dark rounded-full transition-all"
                      style={{ width: `${student.accuracyRate}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-brand-dark rounded-2xl shadow-none text-white">
            <CardContent className="px-5 py-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-yellow-300" />
                </span>
                <p className="text-sm font-semibold text-white/80">Top Subject</p>
              </div>
              <p className="text-3xl font-bold mb-1">{topSubject}</p>
              <p className="text-sm text-white/60">
                Leading subject based on assigned coursework this term.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Behavioral Insights ─────────────────────────────────────────────── */}
      <div className="mb-5">
        <BehavioralInsightsSection studentId={student.id} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ─── Supabase row shapes ──────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

interface RosterRow {
  user_id: string;
  student_code: string;
  department: string | null;
  grade_level: string | null;
  overall_percentile: number | null;
  accuracy_rate: number | null;
  top_subject: string | null;
  profiles: {
    id: string;
    full_name: string | null;
    email: string;
    avatar_url: string | null;
    avatar_initials: string | null;
    last_login_at: string | null;
    created_at: string;
  } | null;
  subject_affiliations: { subjects: { id: string; name: string } | null }[] | null;
}

function mapRosterRow(
  row: RosterRow,
  attemptStats: Map<string, { completed: number; total: number; seconds: number }>
): Student {
  const profile = row.profiles;
  const name = profile?.full_name ?? "Unnamed Student";
  const subjects = (row.subject_affiliations ?? [])
    .map((sa) => sa.subjects)
    .filter((s): s is { id: string; name: string } => !!s);
  const stat = attemptStats.get(row.user_id);
  const completion =
    stat && stat.total > 0 ? Math.round((stat.completed / stat.total) * 100) : 0;

  return {
    id: row.user_id,
    studentCode: row.student_code,
    name,
    email: profile?.email ?? "",
    avatar: profile?.avatar_url ?? "",
    initials: profile?.avatar_initials ?? initialsFromName(name),
    department: row.department,
    gradeLevel: row.grade_level,
    subjects,
    score: Math.round(row.overall_percentile ?? 0),
    accuracyRate: Math.round(row.accuracy_rate ?? 0),
    topSubject: row.top_subject,
    // No historical snapshot table yet to diff against — always neutral.
    trend: "neutral",
    completion,
    lastActive: formatLastActive(profile?.last_login_at ?? null),
    totalSpent: formatHoursSpent(stat?.seconds ?? 0),
    enrolled: formatEnrolled(profile?.created_at ?? null),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// ─── Main Component ──────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

export default function StudentDirectory() {
  const { profile, isLoading: profileLoading } = useProfile();
  const queryClient = useQueryClient();
  const teacherId = profile?.id;

  const [view, setView] = useState<View>({ type: "directory" });
  const [activeTab, setActiveTab] = useState<DirectoryTab>("manage");

  // ── Selection ───────────────────────────────────────────────────────────────
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // ── Filter / Search / Sort ──────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState("perf-high");
  const [currentPage, setCurrentPage] = useState(1);

  // ── Message dialog ──────────────────────────────────────────────────────────
  const [messageOpen, setMessageOpen] = useState(false);
  const [messageSubject, setMessageSubject] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [messageSent, setMessageSent] = useState(false);
  const [messageTargets, setMessageTargets] = useState<Student[]>([]);

  // ── Remove dialog ───────────────────────────────────────────────────────────
  const [removeTarget, setRemoveTarget] = useState<Student | null>(null);

  // ── Add / Edit student dialog ───────────────────────────────────────────────
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formSearchQuery, setFormSearchQuery] = useState("");
  const [formSelectedCandidate, setFormSelectedCandidate] = useState<{
    id: string;
    name: string;
    email: string;
    studentCode: string;
  } | null>(null);
  const [formDepartment, setFormDepartment] = useState("");
  const [formGradeLevel, setFormGradeLevel] = useState("");
  const [formSubjectIds, setFormSubjectIds] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  // ── Assign subjects dialog ──────────────────────────────────────────────────
  const [assignTargets, setAssignTargets] = useState<Student[]>([]);
  const [assignSelected, setAssignSelected] = useState<string[]>([]);

  // ── "now" tick so the live-sync timestamp counts up in real time ───────────
  const [nowTick, setNowTick] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // ── Subjects (global list, used for filters/assignment) ─────────────────────
  const { data: allSubjects = [] } = useQuery({
    queryKey: ["subjects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subjects")
        .select("id, name")
        .order("name");
      if (error) throw error;
      return data as SubjectOption[];
    },
  });

  // ── Roster ───────────────────────────────────────────────────────────────────
  const rosterQuery = useQuery({
    queryKey: ["teacher-roster", teacherId],
    enabled: !!teacherId,
    queryFn: async () => {
      const { data: affiliations, error: affError } = await supabase
        .from("student_teacher_affiliations")
        .select("student_id")
        .eq("teacher_id", teacherId as string);
      if (affError) throw affError;

      const studentIds = Array.from(
        new Set((affiliations ?? []).map((a) => a.student_id).filter(Boolean))
      );
      if (studentIds.length === 0) return [] as Student[];

      const [{ data: rows, error: rowsError }, { data: attempts, error: attemptsError }] =
        await Promise.all([
          supabase
            .from("students")
            .select(
              `
              user_id, student_code, department, grade_level, overall_percentile, accuracy_rate, top_subject,
              profiles ( id, full_name, email, avatar_url, avatar_initials, last_login_at, created_at ),
              subject_affiliations ( subjects ( id, name ) )
            `
            )
            .in("user_id", studentIds),
          supabase
            .from("quiz_attempts")
            .select("student_id, status, time_spent_seconds")
            .in("student_id", studentIds),
        ]);

      if (rowsError) throw rowsError;
      if (attemptsError) throw attemptsError;

      const attemptStats = new Map<
        string,
        { completed: number; total: number; seconds: number }
      >();
      (attempts ?? []).forEach((a) => {
        const bucket = attemptStats.get(a.student_id) ?? {
          completed: 0,
          total: 0,
          seconds: 0,
        };
        bucket.total += 1;
        if (a.status === "completed") bucket.completed += 1;
        bucket.seconds += a.time_spent_seconds ?? 0;
        attemptStats.set(a.student_id, bucket);
      });

      return ((rows ?? []) as unknown as RosterRow[]).map((row) =>
        mapRosterRow(row, attemptStats)
      );
    },
  });

  const students = rosterQuery.data ?? [];
  const rosterStudentIds = useMemo(() => new Set(students.map((s) => s.id)), [students]);

  const syncSeconds = rosterQuery.dataUpdatedAt
    ? Math.floor((nowTick - rosterQuery.dataUpdatedAt) / 1000)
    : 0;

  const handleSync = useCallback(() => {
    rosterQuery.refetch();
  }, [rosterQuery]);

  // ── Add-student candidate search (existing, unaffiliated students) ─────────
  const candidateSearchQuery = useQuery({
    queryKey: ["student-candidates", formSearchQuery],
    enabled: formMode === "add" && formSearchQuery.trim().length >= 2,
    queryFn: async () => {
      const q = formSearchQuery.trim();

      // Search by name/email and by student_code separately, then merge —
      // .or() can't reliably combine a top-level column with an embedded
      // foreign-table column in one filter string.
      const [byProfile, byCode] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, full_name, email, students!inner(student_code)")
          .eq("role", "student")
          .or(`full_name.ilike.%${q}%,email.ilike.%${q}%`)
          .limit(8),
        supabase
          .from("profiles")
          .select("id, full_name, email, students!inner(student_code)")
          .eq("role", "student")
          .ilike("students.student_code", `%${q}%`)
          .limit(8),
      ]);

      if (byProfile.error) throw byProfile.error;
      if (byCode.error) throw byCode.error;

      const rows = [...(byProfile.data ?? []), ...(byCode.data ?? [])];
      const seen = new Map<
        string,
        { id: string; name: string; email: string; studentCode: string }
      >();

      for (const row of rows) {
        const studentRow = Array.isArray(row.students) ? row.students[0] : row.students;
        seen.set(row.id, {
          id: row.id,
          name: row.full_name ?? row.email,
          email: row.email,
          studentCode: (studentRow as { student_code: string } | null)?.student_code ?? "—",
        });
      }

      return Array.from(seen.values());
    },
  });

  const candidateMatches = useMemo(
    () => (candidateSearchQuery.data ?? []).filter((c) => !rosterStudentIds.has(c.id)),
    [candidateSearchQuery.data, rosterStudentIds]
  );

  // ── Mutations ────────────────────────────────────────────────────────────────

  const invalidateRoster = () =>
    queryClient.invalidateQueries({ queryKey: ["teacher-roster", teacherId] });

  const addStudentMutation = useMutation({
    mutationFn: async ({
      studentId,
      subjectIds,
    }: {
      studentId: string;
      subjectIds: string[];
    }) => {
      const { error: linkError } = await supabase
        .from("student_teacher_affiliations")
        .insert({ teacher_id: teacherId, student_id: studentId });
      if (linkError) throw linkError;

      if (subjectIds.length > 0) {
        const { error: subjError } = await supabase.from("subject_affiliations").insert(
          subjectIds.map((subject_id) => ({ subject_id, student_id: studentId }))
        );
        if (subjError) throw subjError;
      }
    },
    onSuccess: invalidateRoster,
  });

  const updateStudentMutation = useMutation({
    mutationFn: async ({
      studentId,
      department,
      gradeLevel,
      subjectIds,
      previousSubjectIds,
    }: {
      studentId: string;
      department: string;
      gradeLevel: string;
      subjectIds: string[];
      previousSubjectIds: string[];
    }) => {
      const { error: updateError } = await supabase
        .from("students")
        .update({ department: department || null, grade_level: gradeLevel || null })
        .eq("user_id", studentId);
      if (updateError) throw updateError;

      const toAdd = subjectIds.filter((id) => !previousSubjectIds.includes(id));
      const toRemove = previousSubjectIds.filter((id) => !subjectIds.includes(id));

      if (toAdd.length > 0) {
        const { error } = await supabase
          .from("subject_affiliations")
          .insert(toAdd.map((subject_id) => ({ subject_id, student_id: studentId })));
        if (error) throw error;
      }
      if (toRemove.length > 0) {
        const { error } = await supabase
          .from("subject_affiliations")
          .delete()
          .eq("student_id", studentId)
          .in("subject_id", toRemove);
        if (error) throw error;
      }
    },
    onSuccess: invalidateRoster,
  });

  const removeStudentMutation = useMutation({
    mutationFn: async (studentId: string) => {
      const { error } = await supabase
        .from("student_teacher_affiliations")
        .delete()
        .eq("teacher_id", teacherId as string)
        .eq("student_id", studentId);
      if (error) throw error;
    },
    onSuccess: invalidateRoster,
  });

  const assignSubjectsMutation = useMutation({
    mutationFn: async ({
      targets,
      subjectIds,
    }: {
      targets: Student[];
      subjectIds: string[];
    }) => {
      for (const target of targets) {
        const currentIds = target.subjects.map((s) => s.id);
        const finalIds =
          targets.length === 1
            ? subjectIds
            : Array.from(new Set([...currentIds, ...subjectIds]));

        const toAdd = finalIds.filter((id) => !currentIds.includes(id));
        const toRemove = currentIds.filter((id) => !finalIds.includes(id));

        if (toAdd.length > 0) {
          const { error } = await supabase
            .from("subject_affiliations")
            .insert(toAdd.map((subject_id) => ({ subject_id, student_id: target.id })));
          if (error) throw error;
        }
        if (toRemove.length > 0) {
          const { error } = await supabase
            .from("subject_affiliations")
            .delete()
            .eq("student_id", target.id)
            .in("subject_id", toRemove);
          if (error) throw error;
        }
      }
    },
    onSuccess: invalidateRoster,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({
      targets,
      subject,
      body,
    }: {
      targets: Student[];
      subject: string;
      body: string;
    }) => {
      const { error } = await supabase.from("messages").insert(
        targets.map((t) => ({
          sender_id: teacherId,
          recipient_id: t.id,
          subject,
          body,
        }))
      );
      if (error) throw error;
    },
  });

  // ── Derived data ─────────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let list = [...students];

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          s.studentCode.toLowerCase().includes(q)
      );
    }

    switch (sortKey) {
      case "perf-high":
        list.sort((a, b) => b.score - a.score);
        break;
      case "perf-low":
        list.sort((a, b) => a.score - b.score);
        break;
      case "name-az":
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "recent":
        list.sort((a, b) => {
          const rank = (s: string) =>
            s.startsWith("Today") ? 0 : s.startsWith("Yesterday") ? 1 : 2;
          return rank(a.lastActive) - rank(b.lastActive);
        });
        break;
    }
    return list;
  }, [students, searchQuery, sortKey]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const handleSortKey = (v: string) => {
    setSortKey(v);
    setCurrentPage(1);
  };

  const handleSearch = (v: string) => {
    setSearchQuery(v);
    setCurrentPage(1);
  };

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  // ── Stats ────────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const avg =
      students.reduce((s, x) => s + x.score, 0) / (students.length || 1);
    const comp =
      students.reduce((s, x) => s + x.completion, 0) / (students.length || 1);
    const needsFocus = students.filter((s) => s.score < 70).length;
    const onlineNow = students.filter((s) => isOnlineNow(s.lastActive)).length;
    return {
      avg: avg.toFixed(1),
      comp: comp.toFixed(1),
      needsFocus,
      onlineNow,
    };
  }, [students]);

  // ── Selection helpers ────────────────────────────────────────────────────────
  const pageIds = paginated.map((s) => s.id);
  const allPageSelected =
    pageIds.length > 0 && pageIds.every((id) => selectedRows.includes(id));

  const toggleAll = () => {
    if (allPageSelected) {
      setSelectedRows((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedRows((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const toggleRow = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  // ── Message helpers ──────────────────────────────────────────────────────────
  const openMessageDialog = (targets: Student[]) => {
    setMessageTargets(targets);
    setMessageSubject("");
    setMessageBody("");
    setMessageSent(false);
    setMessageOpen(true);
  };

  const handleMessageStudents = () => {
    const targets =
      selectedRows.length > 0
        ? students.filter((s) => selectedRows.includes(s.id))
        : students;
    openMessageDialog(targets);
  };

  const handleSendMessage = () => {
    sendMessageMutation.mutate(
      { targets: messageTargets, subject: messageSubject, body: messageBody },
      {
        onSuccess: () => {
          setMessageSent(true);
          setTimeout(() => setMessageOpen(false), 1500);
        },
      }
    );
  };

  // ── Remove helpers ───────────────────────────────────────────────────────────
  const confirmRemove = () => {
    if (!removeTarget) return;
    removeStudentMutation.mutate(removeTarget.id, {
      onSuccess: () => {
        setSelectedRows((prev) => prev.filter((id) => id !== removeTarget.id));
        setRemoveTarget(null);
      },
    });
  };

  // ── Add / Edit helpers ──────────────────────────────────────────────────────
  const openAddForm = () => {
    setFormMode("add");
    setEditingStudent(null);
    setFormSearchQuery("");
    setFormSelectedCandidate(null);
    setFormDepartment("");
    setFormGradeLevel("");
    setFormSubjectIds([]);
    setFormError(null);
    setFormOpen(true);
  };

  const openEditForm = (student: Student) => {
    setFormMode("edit");
    setEditingStudent(student);
    setFormDepartment(student.department ?? "");
    setFormGradeLevel(student.gradeLevel ?? "");
    setFormSubjectIds(student.subjects.map((s) => s.id));
    setFormError(null);
    setFormOpen(true);
  };

  const toggleFormSubject = (subjectId: string) => {
    setFormSubjectIds((prev) =>
      prev.includes(subjectId) ? prev.filter((s) => s !== subjectId) : [...prev, subjectId]
    );
  };

  const handleSaveForm = () => {
    setFormError(null);
    if (formMode === "add") {
      if (!formSelectedCandidate) return;
      addStudentMutation.mutate(
        { studentId: formSelectedCandidate.id, subjectIds: formSubjectIds },
        {
          onSuccess: () => setFormOpen(false),
          onError: (err) => setFormError((err as Error).message),
        }
      );
    } else if (editingStudent) {
      updateStudentMutation.mutate(
        {
          studentId: editingStudent.id,
          department: formDepartment.trim(),
          gradeLevel: formGradeLevel.trim(),
          subjectIds: formSubjectIds,
          previousSubjectIds: editingStudent.subjects.map((s) => s.id),
        },
        {
          onSuccess: () => setFormOpen(false),
          onError: (err) => setFormError((err as Error).message),
        }
      );
    }
  };

  const formSaving = addStudentMutation.isPending || updateStudentMutation.isPending;
  const formCanSave =
    formMode === "add" ? !!formSelectedCandidate : !!editingStudent;

  // ── Assign subjects helpers ─────────────────────────────────────────────────
  const openAssignDialog = (targets: Student[]) => {
    setAssignTargets(targets);
    setAssignSelected(targets.length === 1 ? targets[0].subjects.map((s) => s.id) : []);
  };

  const toggleAssignSubject = (subjectId: string) => {
    setAssignSelected((prev) =>
      prev.includes(subjectId) ? prev.filter((s) => s !== subjectId) : [...prev, subjectId]
    );
  };

  const handleSaveAssign = () => {
    assignSubjectsMutation.mutate(
      { targets: assignTargets, subjectIds: assignSelected },
      {
        onSuccess: () => {
          setAssignTargets([]);
          setAssignSelected([]);
        },
      }
    );
  };

  // ── Pagination helpers ────────────────────────────────────────────────────────
  const paginationItems = useMemo(() => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const items: (number | "...")[] = [];
    if (currentPage <= 3) {
      items.push(1, 2, 3, "...", totalPages);
    } else if (currentPage >= totalPages - 2) {
      items.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
    } else {
      items.push(1, "...", currentPage, "...", totalPages);
    }
    return items;
  }, [totalPages, currentPage]);

  // ─────────────────────────────────────────────────────────────────────────────
  // ── Guard states ───────────────────────────────────────────────────────────
  // ─────────────────────────────────────────────────────────────────────────────

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!profile || profile.role !== "teacher") {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-6">
        <p className="text-sm text-muted-foreground">
          This directory is only available to teacher accounts.
        </p>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // ── Profile screen ──────────────────────────────────────────────────────────
  // ─────────────────────────────────────────────────────────────────────────────

  if (view.type === "profile") {
    const student = students.find((s) => s.id === view.studentId);
    if (!student) {
      if (!rosterQuery.isLoading) setView({ type: "directory" });
      return null;
    }
    return (
      <StudentProfileScreen
        student={student}
        onBack={() => setView({ type: "directory" })}
        onMessage={(s) => {
          setView({ type: "directory" });
          openMessageDialog([s]);
        }}
      />
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // ── Directory screen (tabs) ─────────────────────────────────────────────────
  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-surface font-sans flex flex-col">
      <div className="p-6 flex flex-col max-w-400 mx-auto w-full">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-heading font-bold text-brand-navy">
            Student Directory
          </h1>
          <p className="text-sm text-brand-subtitle mt-1">
            Manage your roster and monitor live activity in one place
          </p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as DirectoryTab)}
          className="w-full"
        >
          <TabsList className="mb-5 bg-white border border-border rounded-xl p-2 h-auto w-fit">
            <TabsTrigger
              value="manage"
              className="rounded-lg px-4 py-3.5 text-sm font-semibold data-[state=active]:bg-brand-navy data-[state=active]:text-white"
            >
              <Users className="w-4 h-4 mr-2" />
              Manage Students
            </TabsTrigger>
            <TabsTrigger
              value="live"
              className="rounded-lg px-4 py-3.5 text-sm font-semibold data-[state=active]:bg-brand-navy data-[state=active]:text-white"
            >
              <Radio className="w-4 h-4 mr-2" />
              Live Directory
            </TabsTrigger>
          </TabsList>

          {/* ── MANAGE TAB ───────────────────────────────────────────────────── */}
          <TabsContent value="manage" className="mt-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4 gap-3 flex-wrap w-full">
              <div className="flex gap-3 flex-wrap">
                {/* Search */}
                <div className="relative">
                  <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    placeholder="Find students by name, email, ID..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-9 w-64 bg-white border border-border rounded-lg text-sm"
                  />
                </div>

                {/* Sort */}
                <Select value={sortKey} onValueChange={handleSortKey}>
                  <SelectTrigger className="w-52 bg-white border border-border rounded-lg text-sm font-medium">
                    <ArrowUpDown className="w-4 h-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Performance (High-Low)" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="perf-high">Performance (High-Low)</SelectItem>
                    <SelectItem value="perf-low">Performance (Low-High)</SelectItem>
                    <SelectItem value="name-az">Name (A-Z)</SelectItem>
                    <SelectItem value="recent">Most Recent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 flex-wrap">
                {selectedRows.length > 0 && (
                  <Button
                    variant="outline"
                    className="h-11 px-5 gap-2 border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 shadow-sm"
                    onClick={() =>
                      openAssignDialog(
                        students.filter((s) => selectedRows.includes(s.id))
                      )
                    }
                  >
                    <BookMarked className="w-4 h-4 mr-2" />
                    Assign Subjects ({selectedRows.length})
                  </Button>
                )}

                <Button
                  className="h-11 px-5 gap-2 bg-brand-navy hover:bg-brand-navy/90 text-white rounded-xl shadow-md transition-all"
                  onClick={handleMessageStudents}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  {selectedRows.length > 0
                    ? `Message (${selectedRows.length})`
                    : "Message Students"}
                </Button>

                <Button
                  className="h-11 px-5 gap-2 bg-brand-navy hover:bg-brand-navy/90 text-white rounded-xl shadow-md transition-all"
                  onClick={openAddForm}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Student
                </Button>
              </div>
            </div>

            {/* Table Card */}
            <Card className="bg-white rounded-2xl shadow-none overflow-hidden mb-6">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border bg-white">
                    <TableHead className="w-10 pl-5">
                      <Checkbox
                        checked={allPageSelected}
                        onCheckedChange={toggleAll}
                        className="rounded"
                      />
                    </TableHead>
                    <TableHead className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                      Student Profile
                    </TableHead>
                    <TableHead className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                      Student ID
                    </TableHead>
                    <TableHead className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                      Email
                    </TableHead>
                    <TableHead className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                      Subjects
                    </TableHead>
                    <TableHead className="text-xs font-semibold tracking-widest text-muted-foreground uppercase text-right pr-5">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rosterQuery.isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-muted-foreground text-sm">
                        Loading roster…
                      </TableCell>
                    </TableRow>
                  ) : paginated.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-12 text-muted-foreground text-sm"
                      >
                        No students match the current filter.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginated.map((student) => (
                      <TableRow
                        key={student.id}
                        className="border-b border-border last:border-0 hover:bg-brand-light/40 transition-colors"
                      >
                        <TableCell className="pl-5">
                          <Checkbox
                            checked={selectedRows.includes(student.id)}
                            onCheckedChange={() => toggleRow(student.id)}
                            className="rounded"
                          />
                        </TableCell>

                        <TableCell className="py-5">
                          <button
                            className="flex items-center gap-3 text-left"
                            onClick={() =>
                              setView({ type: "profile", studentId: student.id })
                            }
                          >
                            <Avatar className="w-12 h-12 rounded-xl">
                              <AvatarImage src={student.avatar} />
                              <AvatarFallback className="bg-brand-light text-brand-blue font-bold text-sm rounded-xl">
                                {student.initials}
                              </AvatarFallback>
                            </Avatar>
                            <p className="font-bold text-brand-navy text-[15px] leading-tight hover:underline">
                              {student.name}
                            </p>
                          </button>
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant="outline"
                            className="text-xs font-mono font-semibold px-2.5 py-1 rounded-md border-border text-muted-foreground"
                          >
                            {student.studentCode}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <p className="text-sm text-foreground">{student.email}</p>
                        </TableCell>

                        <TableCell className="max-w-48">
                          <div className="flex flex-wrap gap-1">
                            {student.subjects.length === 0 ? (
                              <span className="text-xs text-muted-foreground">
                                None assigned
                              </span>
                            ) : (
                              student.subjects.map((subj) => (
                                <Badge
                                  key={subj.id}
                                  variant="outline"
                                  className="text-[10px] font-medium px-2 py-0.5 rounded-full border-border text-muted-foreground"
                                >
                                  {subj.name}
                                </Badge>
                              ))
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center justify-end gap-1 pr-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Edit Details"
                              className="w-8 h-8 text-muted-foreground hover:text-foreground"
                              onClick={() => openEditForm(student)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Send Message"
                              className="w-8 h-8 text-muted-foreground hover:text-foreground"
                              onClick={() => openMessageDialog([student])}
                            >
                              <Mail className="w-4 h-4" />
                            </Button>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="w-8 h-8 text-muted-foreground hover:text-foreground"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="min-w-44">
                                <DropdownMenuItem
                                  onClick={() =>
                                    setView({ type: "profile", studentId: student.id })
                                  }
                                >
                                  View Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => openAssignDialog([student])}
                                >
                                  Assign Subjects
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => setRemoveTarget(student)}
                                >
                                  Remove Student
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between px-5 py-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Showing {filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1} to{" "}
                  {Math.min(currentPage * PAGE_SIZE, filtered.length)} of{" "}
                  {filtered.length} students
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 text-muted-foreground"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>

                  {paginationItems.map((page, i) => (
                    <Button
                      key={i}
                      variant={page === currentPage ? "default" : "ghost"}
                      size="icon"
                      disabled={page === "..."}
                      className={`w-8 h-8 text-sm font-medium ${
                        page === currentPage
                          ? "bg-brand-navy text-white hover:bg-brand-blue"
                          : "text-muted-foreground"
                      }`}
                      onClick={() =>
                        typeof page === "number" && setCurrentPage(page)
                      }
                    >
                      {page}
                    </Button>
                  ))}

                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 text-muted-foreground"
                    disabled={currentPage === totalPages}
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* ── LIVE DIRECTORY TAB ───────────────────────────────────────────── */}
          <TabsContent value="live" className="mt-0">
            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              {[
                {
                  label: "AVG SCORE",
                  value: `${stats.avg}%`,
                  sub: null,
                  subColor: "text-green-500",
                },
                {
                  label: "COMPLETION",
                  value: `${stats.comp}%`,
                  sub: "Target: 85%",
                  subColor: "text-muted-foreground",
                },
                {
                  label: "NEEDS FOCUS",
                  value: String(stats.needsFocus),
                  sub: "Students",
                  subColor: "text-muted-foreground",
                  valueColor: "text-red-500",
                },
                {
                  label: "ONLINE NOW",
                  value: String(stats.onlineNow),
                  sub: "Active today",
                  subColor: "text-green-500",
                  valueColor: "text-green-600",
                },
                {
                  label: "LAST SYNC",
                  value: formatSyncAgo(syncSeconds),
                  sub: null,
                  icon: true,
                },
              ].map((stat, i) => (
                <Card key={i} className="bg-white rounded-2xl shadow-none">
                  <CardContent className="pt-5 pb-5 px-5">
                    <p className="text-[11px] font-semibold tracking-widest text-muted-foreground uppercase mb-2">
                      {stat.label}
                    </p>
                    <div className="flex items-end justify-between">
                      <div>
                        <p
                          className={`text-3xl font-bold ${stat.valueColor ?? "text-brand-navy"}`}
                        >
                          {stat.value}
                        </p>
                        {stat.sub && (
                          <p className={`text-sm font-medium mt-0.5 ${stat.subColor}`}>
                            {stat.sub}
                          </p>
                        )}
                      </div>
                      {stat.icon && (
                        <button
                          onClick={handleSync}
                          title="Sync now"
                          className="p-1 rounded-md hover:bg-muted transition-colors"
                        >
                          <RefreshCw
                            className={`w-5 h-5 text-muted-foreground ${
                              rosterQuery.isFetching ? "animate-spin" : ""
                            }`}
                          />
                        </button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Live cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((student) => {
                const online = isOnlineNow(student.lastActive);
                return (
                  <Card
                    key={student.id}
                    className="bg-white rounded-2xl shadow-none cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() =>
                      setView({ type: "profile", studentId: student.id })
                    }
                  >
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="relative">
                          <Avatar className="w-11 h-11 rounded-xl">
                            <AvatarImage src={student.avatar} />
                            <AvatarFallback className="bg-brand-light text-brand-blue font-bold text-sm rounded-xl">
                              {student.initials}
                            </AvatarFallback>
                          </Avatar>
                          <span
                            className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                              online ? "bg-green-400 animate-pulse" : "bg-gray-300"
                            }`}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-brand-navy text-sm leading-tight truncate">
                            {student.name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {online ? "Active now" : student.lastActive}
                          </p>
                        </div>
                        <span className="text-lg font-bold text-foreground flex items-center">
                          {student.score}%
                          <TrendIcon trend={student.trend} />
                        </span>
                      </div>

                      <Progress value={student.completion} className="h-2 rounded-full mb-1.5" />
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          {student.completion}% Completion
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {student.totalSpent}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-1 mt-3">
                        {student.subjects.slice(0, 2).map((subject) => (
                          <Badge
                            key={subject.id}
                            variant="outline"
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-border text-muted-foreground w-fit"
                          >
                            {subject.name}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {filtered.length === 0 && (
                <p className="col-span-full text-center py-12 text-muted-foreground text-sm">
                  No students match the current filter.
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ── Message Dialog ─────────────────────────────────────────────────── */}
      <Dialog open={messageOpen} onOpenChange={setMessageOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {messageSent
                ? "Message Sent!"
                : `Message ${messageTargets.length} Student${messageTargets.length !== 1 ? "s" : ""}`}
            </DialogTitle>
            {!messageSent && (
              <DialogDescription>
                {messageTargets.map((s) => s.name).join(", ")}
              </DialogDescription>
            )}
          </DialogHeader>

          {messageSent ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              ✓ Your message has been sent successfully.
            </p>
          ) : (
            <div className="flex flex-col gap-3 py-2">
              <Input
                placeholder="Subject"
                value={messageSubject}
                onChange={(e) => setMessageSubject(e.target.value)}
              />
              <Textarea
                placeholder="Write your message..."
                rows={5}
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
              />
            </div>
          )}

          {!messageSent && (
            <DialogFooter>
              <Button variant="outline" onClick={() => setMessageOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-brand-navy text-white hover:bg-brand-blue"
                disabled={
                  !messageSubject.trim() ||
                  !messageBody.trim() ||
                  sendMessageMutation.isPending
                }
                onClick={handleSendMessage}
              >
                <Mail className="w-4 h-4 mr-2" />
                {sendMessageMutation.isPending ? "Sending…" : "Send Message"}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Remove Confirmation Dialog ─────────────────────────────────────── */}
      <Dialog
        open={!!removeTarget}
        onOpenChange={(open) => !open && setRemoveTarget(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Remove Student</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove{" "}
              <span className="font-semibold text-foreground">
                {removeTarget?.name}
              </span>{" "}
              ({removeTarget?.studentCode}) from your roster? This unlinks them from
              you — it does not delete their account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmRemove}
              disabled={removeStudentMutation.isPending}
            >
              {removeStudentMutation.isPending ? "Removing…" : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Add / Edit Student Dialog ─────────────────────────────────────── */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {formMode === "add" ? "Add Existing Student" : "Edit Student Details"}
            </DialogTitle>
            <DialogDescription>
              {formMode === "add"
                ? "Search for a student already registered on Vortuiz and link them to your roster."
                : "Update this student's department, grade level, and subject assignments."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            {formMode === "add" ? (
              <div className="relative">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">
                  Search Student
                </label>
                <Input
                  placeholder="Search by name or email"
                  value={formSearchQuery}
                  onChange={(e) => {
                    setFormSearchQuery(e.target.value);
                    setFormSelectedCandidate(null);
                  }}
                />

                {formSelectedCandidate ? (
                  <div className="mt-2 flex items-center justify-between rounded-lg border border-border bg-muted/40 px-3 py-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {formSelectedCandidate.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formSelectedCandidate.email}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFormSelectedCandidate(null)}
                    >
                      Change
                    </Button>
                  </div>
                ) : (
                  formSearchQuery.trim().length >= 2 &&
                  candidateMatches.length > 0 && (
                    <div className="absolute left-0 right-0 top-full z-10 mt-2 overflow-hidden rounded-xl border border-border bg-white shadow-lg">
                      {candidateMatches.map((student) => (
                        <button
                          key={student.id}
                          type="button"
                          onClick={() => setFormSelectedCandidate(student)}
                          className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left transition-colors hover:bg-muted/60"
                        >
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {student.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {student.email}
                            </p>
                          </div>
                          <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                            {student.studentCode}
                          </span>
                        </button>
                      ))}
                    </div>
                  )
                )}
                {candidateSearchQuery.error && (
                  <p className="mt-2 text-xs text-red-500">
                    Search failed: {(candidateSearchQuery.error as Error).message}
                  </p>
                )}
                {formSearchQuery.trim().length >= 2 &&
                  !candidateSearchQuery.isLoading &&
                  !candidateSearchQuery.error &&
                  candidateMatches.length === 0 &&
                  !formSelectedCandidate && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      No unaffiliated students found for that search.
                    </p>
                  )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">
                    Full Name
                  </label>
                  <Input value={editingStudent?.name ?? ""} disabled />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">
                    Email
                  </label>
                  <Input value={editingStudent?.email ?? ""} disabled />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">
                    Department
                  </label>
                  <Input
                    value={formDepartment}
                    onChange={(e) => setFormDepartment(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">
                    Grade Level
                  </label>
                  <Input
                    value={formGradeLevel}
                    onChange={(e) => setFormGradeLevel(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                Assign Subjects
              </label>
              <div className="grid grid-cols-2 gap-2">
                {allSubjects.map((subject) => (
                  <label
                    key={subject.id}
                    className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg border border-border cursor-pointer hover:bg-muted/50"
                  >
                    <Checkbox
                      checked={formSubjectIds.includes(subject.id)}
                      onCheckedChange={() => toggleFormSubject(subject.id)}
                    />
                    {subject.name}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {formError && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {formError}
            </p>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-brand-navy text-white hover:bg-brand-blue"
              disabled={!formCanSave || formSaving}
              onClick={handleSaveForm}
            >
              {formMode === "add" ? (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  {formSaving ? "Adding…" : "Add Student"}
                </>
              ) : (
                <>
                  <Pencil className="w-4 h-4 mr-2" />
                  {formSaving ? "Saving…" : "Save Changes"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Assign Subjects Dialog ────────────────────────────────────────── */}
      <Dialog
        open={assignTargets.length > 0}
        onOpenChange={(open) => {
          if (!open) {
            setAssignTargets([]);
            setAssignSelected([]);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Assign Subjects
              {assignTargets.length === 1
                ? ` — ${assignTargets[0].name}`
                : ` to ${assignTargets.length} Students`}
            </DialogTitle>
            <DialogDescription>
              {assignTargets.length === 1
                ? "Choose the subjects this student is enrolled in."
                : "Selected subjects will be added to each student's existing subjects."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-2 py-2">
            {allSubjects.map((subject) => (
              <label
                key={subject.id}
                className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg border border-border cursor-pointer hover:bg-muted/50"
              >
                <Checkbox
                  checked={assignSelected.includes(subject.id)}
                  onCheckedChange={() => toggleAssignSubject(subject.id)}
                />
                {subject.name}
              </label>
            ))}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAssignTargets([]);
                setAssignSelected([]);
              }}
            >
              Cancel
            </Button>
            <Button
              className="bg-brand-navy text-white hover:bg-brand-blue"
              onClick={handleSaveAssign}
              disabled={assignSubjectsMutation.isPending}
            >
              <BookMarked className="w-4 h-4 mr-2" />
              {assignSubjectsMutation.isPending ? "Saving…" : "Save Assignment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}