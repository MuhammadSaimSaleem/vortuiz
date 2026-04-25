"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Mail,
  Download,
  TrendingUp,
  Trophy,
  Zap,
  AlertTriangle,
  Target,
  BookOpen,
  MoreVertical,
  ArrowLeft,
  CalendarDays,
  IdCard,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StudentProfileData {
  id: string;
  name: string;
  initials: string;
  avatar?: string;
  studentId: string;
  enrolled: string;
  topPercentile: number; // e.g. 5 → "TOP 5%"
  overallPercentile: number; // e.g. 92
  percentileDelta: number; // e.g. +4.2
  accuracyStudent: number; // e.g. 88
  accuracyClass: number; // e.g. 72
  topSubject: string;
  topSubjectPercentile: number;
  skills: { subject: string; score: number }[]; // score 0-100
  insights: {
    icon: "fast" | "warning" | "resilience" | "methodical";
    title: string;
    body: string;
  }[];
  quizAttempts: {
    title: string;
    subtitle: string;
    date: string;
    score: string;
    scorePercent: number;
    timePerQuestion: string;
    status: "PASSED" | "FAILED";
  }[];
}

interface StudentProfileProps {
  student: StudentProfileData;
  onBack?: () => void;
  onMessage?: (student: StudentProfileData) => void;
}

// ─── Radar Chart (pure SVG, no deps) ─────────────────────────────────────────

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
      {/* Grid rings */}
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

      {/* Axis lines */}
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

      {/* Class avg area */}
      <polygon
        points={avgPoints}
        fill="oklch(0.85 0.05 260 / 0.35)"
        stroke="oklch(0.75 0.05 260)"
        strokeWidth="1.5"
      />

      {/* Student area */}
      <polygon
        points={studentPoints}
        fill="oklch(0.55 0.20 260 / 0.18)"
        stroke="var(--brand-dark)"
        strokeWidth="2"
      />

      {/* Axis labels */}
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

// ─── Insight icon map ─────────────────────────────────────────────────────────

const insightMeta = {
  fast: {
    icon: <Zap className="w-5 h-5" />,
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-100",
    iconBg: "bg-blue-100",
  },
  warning: {
    icon: <AlertTriangle className="w-5 h-5" />,
    color: "text-orange-500",
    bg: "bg-orange-50 border-orange-100",
    iconBg: "bg-orange-100",
  },
  resilience: {
    icon: <Target className="w-5 h-5" />,
    color: "text-green-600",
    bg: "bg-green-50 border-green-100",
    iconBg: "bg-green-100",
  },
  methodical: {
    icon: <BookOpen className="w-5 h-5" />,
    color: "text-purple-600",
    bg: "bg-purple-50 border-purple-100",
    iconBg: "bg-purple-100",
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function StudentProfile({
  student,
  onBack,
  onMessage,
}: StudentProfileProps) {
  const [messageOpen, setMessageOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    setSent(true);
    setTimeout(() => setMessageOpen(false), 1500);
  };

  const openMessage = () => {
    setSubject("");
    setBody("");
    setSent(false);
    if (onMessage) onMessage(student);
    else setMessageOpen(true);
  };

  return (
    <div className="min-h-screen bg-surface font-sans p-6">
      {/* Back button */}
      {onBack && (
        <Button
          variant="ghost"
          className="mb-4 text-muted-foreground hover:text-foreground -ml-2"
          onClick={onBack}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Directory
        </Button>
      )}

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <Card className="bg-white rounded-2xl shadow-none mb-5">
        <CardContent className="px-6 py-5 flex flex-wrap items-center gap-5">
          <div className="relative">
            <Avatar className="w-20 h-20 rounded-2xl">
              <AvatarImage src={student.avatar ?? ""} />
              <AvatarFallback className="bg-brand-light text-brand-blue font-bold text-xl rounded-2xl">
                {student.initials}
              </AvatarFallback>
            </Avatar>
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-brand-dark">
                {student.name}
              </h1>
              <Badge className="bg-brand-blue text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                TOP {student.topPercentile}%
              </Badge>
            </div>
            <div className="flex flex-wrap gap-4 mt-1.5">
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <IdCard className="w-4 h-4" />
                Student ID: #{student.studentId}
              </span>
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <CalendarDays className="w-4 h-4" />
                Enrolled: {student.enrolled}
              </span>
            </div>
          </div>

          <div className="flex gap-3 ml-auto">
            <Button
              variant="outline"
              className="border-border bg-white text-sm font-medium"
              onClick={openMessage}
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
        {/* Radar */}
        <Card className="lg:col-span-2 bg-white rounded-2xl shadow-none">
          <CardContent className="px-6 py-5">
            <div className="flex items-start justify-between mb-1">
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  Skill Proficiency
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Performance across core curriculum areas
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
            <RadarChart skills={student.skills} />
          </CardContent>
        </Card>

        {/* Right stats column */}
        <div className="flex flex-col gap-4">
          {/* Overall Percentile */}
          <Card className="bg-white rounded-2xl shadow-none">
            <CardContent className="px-5 py-5">
              <p className="text-[11px] font-semibold tracking-widest text-muted-foreground uppercase mb-2">
                Overall Percentile
              </p>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-4xl font-bold text-foreground">
                  {student.overallPercentile}%
                </span>
                <span className="text-sm font-semibold text-green-500 mb-1 flex items-center gap-0.5">
                  <TrendingUp className="w-3.5 h-3.5" />+
                  {student.percentileDelta}%
                </span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-dark rounded-full transition-all"
                  style={{ width: `${student.overallPercentile}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Accuracy vs Class */}
          <Card className="bg-white rounded-2xl shadow-none">
            <CardContent className="px-5 py-5">
              <p className="text-[11px] font-semibold tracking-widest text-muted-foreground uppercase mb-4">
                Accuracy vs Class
              </p>
              <div className="flex flex-col gap-3">
                {[
                  {
                    label: student.name.split(" ")[0],
                    val: student.accuracyStudent,
                    bar: "bg-brand-dark",
                  },
                  {
                    label: "Class Average",
                    val: student.accuracyClass,
                    bar: "bg-muted-foreground/30",
                  },
                ].map((row) => (
                  <div key={row.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-foreground">
                        {row.label}
                      </span>
                      <span className="text-muted-foreground font-semibold">
                        {row.val}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${row.bar} rounded-full transition-all`}
                        style={{ width: `${row.val}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Subject */}
          <Card className="bg-brand-dark rounded-2xl shadow-none text-white">
            <CardContent className="px-5 py-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-yellow-300" />
                </span>
                <p className="text-sm font-semibold text-white/80">
                  Top Subject
                </p>
              </div>
              <p className="text-3xl font-bold mb-1">{student.topSubject}</p>
              <p className="text-sm text-white/60">
                {student.topSubjectPercentile}th percentile among all students
                this term.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Behavioral Insights ─────────────────────────────────────────────── */}
      <div className="mb-5">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-4">
          <span className="w-7 h-7 rounded-lg bg-brand-light flex items-center justify-center">
            <Target className="w-4 h-4 text-brand-blue" />
          </span>
          Behavioral Insights
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {student.insights.map((insight, i) => {
            const meta = insightMeta[insight.icon];
            return (
              <Card
                key={i}
                className={`rounded-2xl shadow-none border ${meta.bg}`}
              >
                <CardContent className="px-4 py-4">
                  <span
                    className={`w-9 h-9 rounded-xl ${meta.iconBg} flex items-center justify-center ${meta.color} mb-3`}
                  >
                    {meta.icon}
                  </span>
                  <p className={`font-bold text-sm mb-1 ${meta.color}`}>
                    {insight.title}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {insight.body}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* ── Recent Quiz Attempts ─────────────────────────────────────────────── */}
      <Card className="bg-white rounded-2xl shadow-none">
        <CardContent className="px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">
              Recent Quiz Attempts
            </h2>
            <Button
              variant="ghost"
              className="text-brand-blue text-sm font-semibold hover:bg-brand-light"
            >
              View Full History →
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="border-b border-border">
                {["Quiz Title", "Date", "Score", "Time/Question", "Status"].map(
                  (h) => (
                    <TableHead
                      key={h}
                      className="text-xs font-semibold tracking-widest text-muted-foreground uppercase"
                    >
                      {h}
                    </TableHead>
                  )
                )}
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {student.quizAttempts.map((attempt, i) => (
                <TableRow
                  key={i}
                  className="border-b border-border last:border-0 hover:bg-brand-light/40 transition-colors"
                >
                  <TableCell className="py-4">
                    <p className="font-semibold text-[14px] text-foreground">
                      {attempt.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {attempt.subtitle}
                    </p>
                  </TableCell>
                  <TableCell className="text-sm text-foreground">
                    {attempt.date}
                  </TableCell>
                  <TableCell>
                    <p className="font-bold text-[15px] text-foreground">
                      {attempt.score}
                    </p>
                    <p
                      className={`text-xs font-semibold mt-0.5 ${attempt.scorePercent >= 70 ? "text-green-500" : "text-red-500"}`}
                    >
                      {attempt.scorePercent.toFixed(1)}%
                    </p>
                  </TableCell>
                  <TableCell className="text-sm text-foreground">
                    {attempt.timePerQuestion}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        attempt.status === "PASSED"
                          ? "bg-green-100 text-green-700 border-green-200"
                          : "bg-red-100 text-red-600 border-red-200"
                      }`}
                      variant="outline"
                    >
                      {attempt.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
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
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Download Report</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ── Message Dialog (standalone fallback) ──────────────────────────── */}
      <Dialog open={messageOpen} onOpenChange={setMessageOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {sent ? "Message Sent!" : `Message ${student.name}`}
            </DialogTitle>
            {!sent && (
              <DialogDescription>
                Sending to {student.name} · ID #{student.studentId}
              </DialogDescription>
            )}
          </DialogHeader>
          {sent ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              ✓ Your message has been sent successfully.
            </p>
          ) : (
            <div className="flex flex-col gap-3 py-2">
              <Input
                placeholder="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
              <Textarea
                placeholder="Write your message..."
                rows={5}
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
            </div>
          )}
          {!sent && (
            <DialogFooter>
              <Button variant="outline" onClick={() => setMessageOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-brand-dark text-white hover:bg-brand-blue"
                disabled={!subject.trim() || !body.trim()}
                onClick={handleSend}
              >
                <Mail className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Default demo data (for standalone use / dev) ─────────────────────────────

export const julianAlvarez: StudentProfileData = {
  id: "ST-88291",
  name: "Julian Alvarez",
  initials: "JA",
  avatar: "",
  studentId: "QS-992841",
  enrolled: "Sept 2023",
  topPercentile: 5,
  overallPercentile: 92,
  percentileDelta: 4.2,
  accuracyStudent: 88,
  accuracyClass: 72,
  topSubject: "Organic Chem",
  topSubjectPercentile: 98,
  skills: [
    { subject: "Biology", score: 85 },
    { subject: "Physics", score: 78 },
    { subject: "Chemistry", score: 95 },
    { subject: "Maths", score: 82 },
    { subject: "History", score: 70 },
  ],
  insights: [
    {
      icon: "fast",
      title: "Fast Execution",
      body: "Spends 30% less time on easy questions than the median, preserving energy for complex tasks.",
    },
    {
      icon: "warning",
      title: "Review Gap",
      body: "Tends to finalise answers 5 mins early without using the remaining time to review 'marked' questions.",
    },
    {
      icon: "resilience",
      title: "High Resilience",
      body: "Maintains 90%+ accuracy even after 3 consecutive wrong answers. No evidence of 'tilted' guessing.",
    },
    {
      icon: "methodical",
      title: "Methodical Work",
      body: "Uses digital scratchpad for 85% of Math problems. Demonstrates clear step-by-step logic.",
    },
  ],
  quizAttempts: [
    {
      title: "Advanced Molecular Biology",
      subtitle: "Genetics Unit · 45 Questions",
      date: "Oct 24, 2023",
      score: "42/45",
      scorePercent: 93.3,
      timePerQuestion: "42s",
      status: "PASSED",
    },
    {
      title: "Thermodynamics Midterm",
      subtitle: "Physics II · 30 Questions",
      date: "Oct 18, 2023",
      score: "25/30",
      scorePercent: 83.3,
      timePerQuestion: "1m 12s",
      status: "PASSED",
    },
    {
      title: "Calculus Integration Basics",
      subtitle: "Math Foundation · 20 Questions",
      date: "Oct 12, 2023",
      score: "19/20",
      scorePercent: 95.0,
      timePerQuestion: "55s",
      status: "PASSED",
    },
    {
      title: "Inorganic Chemistry Quiz 2",
      subtitle: "Chemistry · 40 Questions",
      date: "Oct 05, 2023",
      score: "22/40",
      scorePercent: 55.0,
      timePerQuestion: "1m 45s",
      status: "FAILED",
    },
  ],
};