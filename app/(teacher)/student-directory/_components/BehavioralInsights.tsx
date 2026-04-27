"use client";

import { Zap, AlertTriangle, Target, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BehavioralInsight {
  id: string;
  icon: "fast" | "review" | "resilience" | "methodical";
  title: string;
  description: string;
}

export interface QuizAttempt {
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

export interface BehavioralInsightsProps {
  insights?: BehavioralInsight[];
  quizAttempts?: QuizAttempt[];
  onViewFullHistory?: () => void;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_INSIGHTS: BehavioralInsight[] = [
  {
    id: "fast-execution",
    icon: "fast",
    title: "Fast Execution",
    description:
      "Spends 30% less time on easy questions than the median, preserving energy for complex tasks.",
  },
  {
    id: "review-gap",
    icon: "review",
    title: "Review Gap",
    description:
      "Tends to finalize answers 5 mins early without using the remaining time to review 'marked' questions.",
  },
  {
    id: "high-resilience",
    icon: "resilience",
    title: "High Resilience",
    description:
      "Maintains 90%+ accuracy even after 3 consecutive wrong answers. No evidence of 'tilted' guessing.",
  },
  {
    id: "methodical-work",
    icon: "methodical",
    title: "Methodical Work",
    description:
      "Uses digital scratchpad for 85% of Math problems. Demonstrates clear step-by-step logic.",
  },
];

const DEFAULT_QUIZ_ATTEMPTS: QuizAttempt[] = [
  {
    id: "qa-1",
    title: "Advanced Molecular Biology",
    subtitle: "Genetics Unit · 45 Questions",
    date: "Oct 24, 2023",
    score: 42,
    maxScore: 45,
    percentage: 93.3,
    timePerQuestion: "42s",
    status: "PASSED",
  },
  {
    id: "qa-2",
    title: "Thermodynamics Midterm",
    subtitle: "Physics II · 30 Questions",
    date: "Oct 18, 2023",
    score: 25,
    maxScore: 30,
    percentage: 83.3,
    timePerQuestion: "1m 12s",
    status: "PASSED",
  },
  {
    id: "qa-3",
    title: "Calculus Integration Basics",
    subtitle: "Math Foundation · 20 Questions",
    date: "Oct 12, 2023",
    score: 19,
    maxScore: 20,
    percentage: 95.0,
    timePerQuestion: "55s",
    status: "PASSED",
  },
  {
    id: "qa-4",
    title: "Inorganic Chemistry Quiz 2",
    subtitle: "Chemistry · 40 Questions",
    date: "Oct 05, 2023",
    score: 22,
    maxScore: 40,
    percentage: 55.0,
    timePerQuestion: "1m 45s",
    status: "FAILED",
  },
];

// ─── Icon map ─────────────────────────────────────────────────────────────────

const iconConfig: Record<
  BehavioralInsight["icon"],
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

// ─── Component ────────────────────────────────────────────────────────────────

export default function BehavioralInsights({
  insights = DEFAULT_INSIGHTS,
  quizAttempts = DEFAULT_QUIZ_ATTEMPTS,
  onViewFullHistory,
}: BehavioralInsightsProps) {
  return (
    <div className="space-y-6">
      {/* ── Behavioral Insights Header ───────────────────────────────────── */}
      <div>
        <h2 className="text-xl font-bold text-brand-dark flex items-center gap-2 mb-4">
          <span className="text-lg">🧠</span> Behavioral Insights
        </h2>

        {/* Insight Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {insights.map((insight) => {
            const cfg = iconConfig[insight.icon];
            return (
              <div
                key={insight.id}
                className={`rounded-2xl border p-4 ${cfg.bg}`}
              >
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
      </div>

      {/* ── Recent Quiz Attempts ─────────────────────────────────────────── */}
      <Card className="bg-white rounded-2xl shadow-none border border-border">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-brand-dark">
              Recent Quiz Attempts
            </h3>
            {onViewFullHistory && (
              <button
                onClick={onViewFullHistory}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1"
              >
                View Full History →
              </button>
            )}
          </div>

          {/* Table */}
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
                    {/* Title */}
                    <td className="py-4 pr-4">
                      <p className="font-semibold text-brand-dark">
                        {attempt.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {attempt.subtitle}
                      </p>
                    </td>

                    {/* Date */}
                    <td className="py-4 px-4 text-muted-foreground whitespace-nowrap">
                      {attempt.date}
                    </td>

                    {/* Score */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <p className="font-bold text-brand-dark">
                        {attempt.score}/{attempt.maxScore}
                      </p>
                      <p
                        className={`text-xs font-semibold ${
                          attempt.status === "PASSED"
                            ? "text-green-600"
                            : "text-red-500"
                        }`}
                      >
                        {attempt.percentage.toFixed(1)}%
                      </p>
                    </td>

                    {/* Time per question */}
                    <td className="py-4 px-4 text-muted-foreground whitespace-nowrap">
                      {attempt.timePerQuestion}
                    </td>

                    {/* Status */}
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
        </CardContent>
      </Card>
    </div>
  );
}
