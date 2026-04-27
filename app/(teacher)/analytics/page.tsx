"use client";

import { useMemo, useState } from "react";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  CartesianGrid,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  SlidersHorizontal,
  TrendingUp,
  CheckCircle2,
  Users,
  Trophy,
} from "lucide-react";
import Topbar from "@/components/ui/Topbar";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TrendPoint {
  day: string;
  thisPeriod: number;
  lastPeriod: number;
}

interface MissedQuestion {
  id: string;
  question: string;
  quiz: string;
  commonError: string;
  errorHighlight?: boolean;
  missedPct: number;
}

interface SubjectMastery {
  subject: string;
  score: number;
}

interface HeatmapCell {
  day: string;
  slots: number[]; // 0–4 intensity
}

// ─── Seed Data ────────────────────────────────────────────────────────────────

const TREND_DATA: TrendPoint[] = [
  { day: "DAY 1",  thisPeriod: 62,  lastPeriod: 58 },
  { day: "DAY 5",  thisPeriod: 65,  lastPeriod: 61 },
  { day: "DAY 10", thisPeriod: 70,  lastPeriod: 63 },
  { day: "DAY 15", thisPeriod: 75,  lastPeriod: 66 },
  { day: "DAY 20", thisPeriod: 80,  lastPeriod: 70 },
  { day: "DAY 25", thisPeriod: 86,  lastPeriod: 73 },
  { day: "DAY 30", thisPeriod: 92,  lastPeriod: 76 },
];

const MISSED_QUESTIONS: MissedQuestion[] = [
  {
    id: "mq-1",
    question: "Identify the primary function of the Golgi Apparatus in cellular protein synthesis.",
    quiz: "QUIZ: BIOLOGY BASICS 101",
    commonError: "Energy production (ATP)",
    errorHighlight: true,
    missedPct: 68,
  },
  {
    id: "mq-2",
    question: "Which chemical element has the symbol 'Pb' on the periodic table?",
    quiz: "QUIZ: PERIODIC ELEMENTS",
    commonError: "Phosphorus",
    errorHighlight: true,
    missedPct: 54,
  },
  {
    id: "mq-3",
    question: "What is the value of the speed of light in a vacuum?",
    quiz: "QUIZ: WAVE PHYSICS",
    commonError: "3.0 × 10⁺⁷ m/s",
    errorHighlight: false,
    missedPct: 42,
  },
];

const SUBJECT_MASTERY: SubjectMastery[] = [
  { subject: "Biology",          score: 89 },
  { subject: "Chemistry",        score: 76 },
  { subject: "Physics",          score: 64 },
  { subject: "Environmental Sci",score: 94 },
];

const HEATMAP_DATA: HeatmapCell[] = [
  { day: "MON", slots: [1, 2, 3] },
  { day: "TUE", slots: [2, 3, 4] },
  { day: "WED", slots: [3, 4, 3] },
  { day: "THU", slots: [2, 3, 4] },
  { day: "FRI", slots: [1, 2, 3] },
  { day: "SAT", slots: [0, 1, 2] },
  { day: "SUN", slots: [1, 3, 2] },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function heatmapColor(intensity: number): string {
  const colors = [
    "bg-blue-100",
    "bg-blue-200",
    "bg-blue-400",
    "bg-blue-600",
    "bg-brand-navy",
  ];
  return colors[Math.min(intensity, 4)];
}

function subjectBarColor(score: number): string {
  if (score >= 90) return "bg-green-500";
  if (score >= 75) return "bg-brand-navy";
  if (score >= 60) return "bg-blue-400";
  return "bg-red-400";
}

function missedColor(pct: number): string {
  if (pct >= 60) return "text-red-500 font-bold";
  if (pct >= 45) return "text-orange-500 font-bold";
  return "text-gray-600 font-semibold";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  delta,
  deltaColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  delta?: string;
  deltaColor?: string;
}) {
  return (
    <Card className="bg-white rounded-2xl shadow-none border border-border flex-1 min-w-0">
      <CardContent className="pt-5 pb-5 px-5">
        <div className="flex items-start justify-between mb-3">
          <div className="text-muted-foreground">{icon}</div>
          {delta && (
            <span className={`text-xs font-semibold ${deltaColor ?? "text-green-500"}`}>
              {delta}
            </span>
          )}
        </div>
        <p className="text-[11px] font-semibold tracking-widest text-muted-foreground uppercase mb-1">
          {label}
        </p>
        <p className="text-2xl font-bold text-brand-navy truncate">{value}</p>
      </CardContent>
    </Card>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-border rounded-xl shadow-md px-4 py-3 text-sm">
      <p className="text-xs font-semibold text-muted-foreground mb-1">{label}</p>
      <p className="font-bold text-brand-navy">This Period: {payload[0]?.value}%</p>
      <p className="text-muted-foreground">Last Period: {payload[1]?.value}%</p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PerformanceAnalytics() {
  const [activeTab, setActiveTab] = useState<"thisPeriod" | "lastPeriod">("thisPeriod");

  const stats = useMemo(() => ({
    avgScore: "84.5%",
    completionRate: "92.1%",
    studentsActive: "156",
    topTopic: "Photosynthe...",
  }), []);

  return (
    <div>
      
      <Topbar/>
      
      <div className="min-h-screen bg-surface font-sans flex flex-col items-center">
        <div className="p-6 flex max-w-7xl flex-col gap-6">
          {/* ── Page Header ─────────────────────────────────────────────────────── */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-heading font-bold text-brand-navy">Performance Analytics</h1>
              <p className="text-sm text-brand-subtitle mt-1">
                Real-time data for Fall Semester 2024 · Period: Last 30 Days
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="text-sm font-medium border-border bg-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
              <Button className="bg-brand-navy text-white text-sm font-semibold px-5 hover:bg-brand-navy/90 transition-colors">
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filter View
              </Button>
            </div>
          </div>
          {/* ── Stat Cards Row ───────────────────────────────────────────────────── */}
          <div className="flex gap-4 flex-wrap">
            <StatCard
              icon={<TrendingUp className="w-5 h-5" />}
              label="Average Class Score"
              value={stats.avgScore}
              delta="+4.2%"
              deltaColor="text-green-500"
            />
            <StatCard
              icon={<CheckCircle2 className="w-5 h-5" />}
              label="Quiz Completion Rate"
              value={stats.completionRate}
              delta="Stable"
              deltaColor="text-muted-foreground"
            />
            <StatCard
              icon={<Users className="w-5 h-5" />}
              label="Total Students Active"
              value={stats.studentsActive}
              delta="+12"
              deltaColor="text-green-500"
            />
            <StatCard
              icon={<Trophy className="w-5 h-5" />}
              label="Highest Scoring Topic"
              value={stats.topTopic}
            />
          </div>
          {/* ── Class Performance Trends ─────────────────────────────────────────── */}
          <Card className="bg-white rounded-2xl shadow-none border border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <h2 className="text-lg font-bold text-brand-navy">Class Performance Trends</h2>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-brand-navy inline-block" />
                    <span className="text-muted-foreground font-medium">This Period</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-gray-300 inline-block" />
                    <span className="text-muted-foreground font-medium">Last Period</span>
                  </span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="thisGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1e2d5a" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#1e2d5a" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="lastGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 600, letterSpacing: 1 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[50, 100]}
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="lastPeriod"
                    stroke="#cbd5e1"
                    strokeWidth={2}
                    fill="url(#lastGradient)"
                    dot={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="thisPeriod"
                    stroke="#1e2d5a"
                    strokeWidth={2.5}
                    fill="url(#thisGradient)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          {/* ── Bottom Row ───────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Most Missed Questions (3/5) */}
            <Card className="bg-white rounded-2xl shadow-none border border-border lg:col-span-3">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-brand-navy">Most Missed Questions</h2>
                  <Badge className="bg-red-100 text-red-600 border-0 text-xs font-semibold px-3 py-1 rounded-full">
                    Action Required
                  </Badge>
                </div>
                {/* Table header */}
                <div className="grid grid-cols-5 gap-x-4 pb-2 border-b border-border">
                  <p className="text-[11px] col-span-3 font-semibold tracking-widest text-muted-foreground uppercase">
                    Question Detail
                  </p>
                  <p className="text-[11px] font-semibold tracking-widest text-muted-foreground uppercase text-center">
                    Common Error
                  </p>
                  <p className="text-[11px] font-semibold tracking-widest text-muted-foreground uppercase text-center">
                    Missed %
                  </p>
                </div>
                {/* Rows */}
                <div className="divide-y divide-gray-50">
                  {MISSED_QUESTIONS.map((q) => (
                    <div
                      key={q.id}
                      className="grid grid-cols-5 gap-x-4 py-4 items-center"
                    >
                      <div className="col-span-3">
                        <p className="text-sm text-brand-dark font-medium leading-snug">
                          "{q.question}"
                        </p>
                        <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase mt-1">
                          {q.quiz}
                        </p>
                      </div>
                      <p
                        className={`text-sm text-center whitespace-WRAP ${
                          q.errorHighlight ? "text-red-500 font-semibold" : "text-muted-foreground"
                        }`}
                      >
                        {q.commonError}
                      </p>
                      <p className={`text-sm text-center whitespace-nowrap ${missedColor(q.missedPct)}`}>
                        {q.missedPct}%
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            {/* Subject Mastery (2/5) */}
            <Card className="bg-white rounded-2xl shadow-none border border-border lg:col-span-2">
              <CardContent className="p-6">
                <h2 className="text-lg font-bold text-brand-navy mb-5">Subject Mastery</h2>
                <div className="space-y-5">
                  {SUBJECT_MASTERY.map((s) => (
                    <div key={s.subject}>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-sm font-medium text-brand-dark">{s.subject}</span>
                        <span className="text-sm font-bold text-brand-dark">{s.score}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${subjectBarColor(s.score)} transition-all duration-500`}
                          style={{ width: `${s.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <button className="mt-10   text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors w-full text-center">
                  View Detailed breakdown
                </button>
              </CardContent>
            </Card>
          </div>
          {/* ── Student Engagement + Heatmap Row ────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Student Engagement (2/5) */}
            <div className="lg:col-span-2 bg-brand-dark rounded-2xl p-6 text-white relative overflow-hidden">
              {/* Decorative circle */}
              <div className="absolute -bottom-10 -right-10 w-44 h-44 rounded-full bg-white/5 pointer-events-none" />
              <div className="absolute -bottom-4 -right-4 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />
              <h2 className="text-lg font-bold mb-1">Student Engagement</h2>
              <p className="text-sm text-white/60 mb-6">
                Average interaction time across all active modules
              </p>
              <div className="flex items-end gap-8">
                <div>
                  <p className="text-4xl font-bold tracking-tight">24m 12s</p>
                  <p className="text-[11px] font-semibold tracking-widest text-white/50 uppercase mt-1">
                    Avg. Time Per Session
                  </p>
                </div>
                <div>
                  <p className="text-4xl font-bold tracking-tight">88%</p>
                  <p className="text-[11px] font-semibold tracking-widest text-white/50 uppercase mt-1">
                    Participation Rate
                  </p>
                </div>
              </div>
            </div>
            {/* Class Activity Heatmap (3/5) */}
            <Card className="bg-white rounded-2xl shadow-none border border-border lg:col-span-3">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-5 flex-wrap gap-2">
                  <h2 className="text-lg font-bold text-brand-navy">Class Activity Heatmap</h2>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                    <span>LOW</span>
                    {["bg-blue-100", "bg-blue-300", "bg-blue-500", "bg-brand-dark"].map((c, i) => (
                      <span key={i} className={`w-5 h-5 rounded ${c} inline-block`} />
                    ))}
                    <span>HIGH</span>
                  </div>
                </div>
                {/* Heatmap grid */}
                <div className="space-y-2 flex flex-row gap-2">
                  {HEATMAP_DATA.map((col) => (
                    <div key={col.day} className="flex flex-col flex-1 gap-1 items-center">
                      {/* The Grid Column */}
                      <div className="flex flex-col gap-1.5 w-20">
                        {col.slots.map((intensity, i) => (
                          <div
                            key={i}
                            className={`aspect-square w-full rounded-sm ${heatmapColor(intensity)} transition-all hover:ring-2 hover:ring-offset-2 hover:ring-blue-200 cursor-pointer`}
                          />
                        ))}
                      </div>
                      
                      {/* Day Label */}
                      <span className="text-[11px] font-bold tracking-widest text-brand-subtitle uppercase">
                        {col.day}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}