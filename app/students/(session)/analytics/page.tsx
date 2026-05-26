"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Award,
  BarChart2,
  ChevronRight,
  FlaskConical,
  Lock,
  RotateCcw,
  Sigma,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Period = "last_6_months" | "last_3_months" | "last_month" | "all_time";

interface ScorePoint { month: string; score: number; }
interface QuizResult {
  id: string;
  title: string;
  subject: string;
  icon: React.ReactNode;
  date: string;
  score: number;
}
interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
  locked: boolean;
}
interface Skill { label: string; value: number; angle: number; }

// ─── Data ─────────────────────────────────────────────────────────────────────
const SCORE_DATA: Record<Period, ScorePoint[]> = {
  last_6_months: [
    { month: "JAN", score: 58 },
    { month: "FEB", score: 72 },
    { month: "MAR", score: 85 },
    { month: "APR", score: 91 },
    { month: "MAY", score: 74 },
    { month: "JUN", score: 92 },
  ],
  last_3_months: [
    { month: "APR", score: 91 },
    { month: "MAY", score: 74 },
    { month: "JUN", score: 92 },
  ],
  last_month: [
    { month: "Week 1", score: 88 },
    { month: "Week 2", score: 91 },
    { month: "Week 3", score: 74 },
    { month: "Week 4", score: 92 },
  ],
  all_time: [
    { month: "2022", score: 65 },
    { month: "2023 H1", score: 74 },
    { month: "2023 H2", score: 85 },
    { month: "2024 H1", score: 92 },
  ],
};

const QUIZ_RESULTS: QuizResult[] = [
  { id: "1", title: "Cellular Biology Advanced",      subject: "Biology",   icon: <FlaskConical className="h-4 w-4" />, date: "Oct 24, 2023", score: 98 },
  { id: "2", title: "Calculus II: Integrals",         subject: "Math",      icon: <Sigma        className="h-4 w-4" />, date: "Oct 22, 2023", score: 84 },
  { id: "3", title: "Organic Chemistry Fundamentals", subject: "Chemistry", icon: <FlaskConical className="h-4 w-4" />, date: "Oct 20, 2023", score: 92 },
];

const ACHIEVEMENTS: Achievement[] = [
  {
    id: "century",
    title: "Century Club",
    description: "Completed 100 quizzes total",
    icon: <Trophy className="h-5 w-5 text-amber-600" />,
    iconBg: "bg-amber-100",
    locked: false,
  },
  {
    id: "speed",
    title: "Speed Demon",
    description: "Finished math quiz in 2 mins",
    icon: <Zap className="h-5 w-5 text-blue-600" />,
    iconBg: "bg-blue-100",
    locked: false,
  },
  {
    id: "perfect",
    title: "Perfect Month",
    description: "Locked · Complete daily quizzes",
    icon: <Lock className="h-5 w-5 text-slate-400" />,
    iconBg: "bg-slate-100",
    locked: true,
  },
];

const SKILLS: Skill[] = [
  { label: "BIOLOGY",   value: 92, angle: -90  },
  { label: "CHEMISTRY", value: 78, angle: 0    },
  { label: "PHYSICS",   value: 65, angle: 90   },
  { label: "MATH",      value: 55, angle: 180  },
];

// ─── Animated counter ─────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 900, trigger = true) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let start: number;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      // ease out
      setVal(Math.floor((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, trigger]);
  return val;
}

// ─── SVG line chart ───────────────────────────────────────────────────────────
function ScoreChart({ data }: { data: ScorePoint[] }) {
  const W = 460, H = 180, PAD = { t: 12, r: 16, b: 0, l: 16 };
  const xs = data.map((_, i) => PAD.l + (i / (data.length - 1)) * (W - PAD.l - PAD.r));
  const min = Math.min(...data.map(d => d.score));
  const max = Math.max(...data.map(d => d.score));
  const range = max - min || 1;
  const ys = data.map(d => PAD.t + (1 - (d.score - min) / range) * (H - PAD.t - PAD.b));

  const path = xs.reduce((acc, x, i) => {
    if (i === 0) return `M${x},${ys[i]}`;
    const prev = xs[i - 1];
    const cp1x = prev + (x - prev) / 2;
    const cp2x = prev + (x - prev) / 2;
    return `${acc} C${cp1x},${ys[i - 1]} ${cp2x},${ys[i]} ${x},${ys[i]}`;
  }, "");

  const fillPath = `${path} L${xs[xs.length - 1]},${H} L${xs[0]},${H} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H + 8}`} className="w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#1e3a8a" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fillPath} fill="url(#chartFill)" />
      <path d={path} fill="none" stroke="#1e3a8a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Dots */}
      {xs.map((x, i) => (
        <circle key={i} cx={x} cy={ys[i]} r="4" fill="white" stroke="#1e3a8a" strokeWidth="2.5" />
      ))}
    </svg>
  );
}

// ─── Radar / skill mastery ────────────────────────────────────────────────────
function SkillRadar() {
  const cx = 100, cy = 100, maxR = 70;
  const toXY = (angle: number, r: number) => ({
    x: cx + r * Math.cos((angle - 90) * Math.PI / 180),
    y: cy + r * Math.sin((angle - 90) * Math.PI / 180),
  });

  const valuePoints = SKILLS.map(s => toXY(s.angle, (s.value / 100) * maxR));

  const valuePath = valuePoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + " Z";

  return (
    <svg viewBox="-18 -15 230 230" className="w-full mx-auto">
      {/* Grid rings */}
      {[0.25, 0.5, 0.75, 1].map(r => (
        <polygon key={r}
          points={SKILLS.map(s => { const p = toXY(s.angle, r * maxR); return `${p.x},${p.y}`; }).join(" ")}
          fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      ))}
      {/* Axes */}
      {SKILLS.map(s => {
        const outer = toXY(s.angle, maxR);
        return <line key={s.label} x1={cx} y1={cy} x2={outer.x} y2={outer.y} stroke="rgba(255,255,255,0.2)" strokeWidth="1" />;
      })}
      {/* Value area */}
      <path d={valuePath} fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
      {/* Dots */}
      {valuePoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="white" />
      ))}
      {/* Labels */}
      {SKILLS.map(s => {
        const p = toXY(s.angle, maxR);

        const rad = (s.angle - 90) * Math.PI / 180;
        const nudgeX = Math.cos(rad) * 24;
        const nudgeY = Math.sin(rad) * 18;

        return (
          <text key={s.label} x={p.x + nudgeX} y={p.y + nudgeY} textAnchor="middle" dominantBaseline="middle"
            fontSize="7" fontWeight="700" letterSpacing="1" fill="rgba(255,255,255,0.75)">
            {s.label}
          </text>
        );
      })}
    </svg>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, tag, tagColor }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tag: string;
  tagColor: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-white p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="h-9 w-9 rounded-xl bg-brand-light flex items-center justify-center">
          {icon}
        </div>
        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${tagColor}`}>{tag}</span>
      </div>
      <div>
        <p className="text-xs font-semibold text-brand-subtitle uppercase tracking-wider mb-1">{label}</p>
        <p className="text-2xl font-bold text-brand-dark">{value}</p>
      </div>
    </div>
  );
}

// ─── Score badge ──────────────────────────────────────────────────────────────
function ScoreBadge({ score }: { score: number }) {
  const color = score >= 90 ? "text-emerald-600 bg-emerald-50" : score >= 75 ? "text-blue-600 bg-blue-50" : "text-amber-600 bg-amber-50";
  return (
    <span className={`text-sm font-bold px-3 py-1 rounded-full ${color}`}>{score}%</span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function PerformancePage() {
  const [period, setPeriod] = useState<Period>("last_6_months");
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const totalQuizzes  = useCountUp(148, 900, mounted);
  const avgScore      = useCountUp(924, 900, mounted); // ×0.1 → 92.4
  const streak        = useCountUp(14,  700, mounted);
  const certificates  = useCountUp(9,   600, mounted);

  const chartData = SCORE_DATA[period];

  return (
    <div className="min-h-full bg-surface p-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-baseline gap-3 mb-1">
            <h1 className="text-3xl font-bold text-brand-dark tracking-tight">Performance Analytics</h1>
          </div>
          <p className="text-sm text-brand-subtitle">
            Welcome back, <span className="font-bold text-brand-dark">Alex Johnson</span>. You are currently ranked in the top 5% of learners this semester.
          </p>
        </div>

        {/* GPA + Rank */}
        <div className="flex gap-px rounded-2xl border border-border overflow-hidden shrink-0 ml-6">
          <div className="bg-white px-6 py-4 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-brand-subtitle mb-1">Cumulative GPA</p>
            <p className="text-2xl font-bold text-brand-dark">3.88</p>
          </div>
          <div className="w-px bg-border" />
          <div className="bg-white px-6 py-4 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-brand-subtitle mb-1">Overall Rank</p>
            <p className="text-2xl font-bold text-brand-dark">#42</p>
          </div>
        </div>
      </div>

      {/* ── Stat cards row ── */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<BarChart2 className="h-4 w-4 text-brand-blue" />}
          label="Total Quizzes"
          value={mounted ? totalQuizzes.toString() : "148"}
          tag="+12%"
          tagColor="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          icon={<Target className="h-4 w-4 text-brand-blue" />}
          label="Average Score"
          value={mounted ? `${(avgScore / 10).toFixed(1)}%` : "92.4%"}
          tag="Stable"
          tagColor="bg-slate-100 text-slate-500"
        />
        <StatCard
          icon={<Zap className="h-4 w-4 text-brand-blue" />}
          label="Study Streak"
          value={mounted ? `${streak} Days` : "14 Days"}
          tag="Record"
          tagColor="bg-amber-50 text-amber-600"
        />
        <StatCard
          icon={<Award className="h-4 w-4 text-brand-blue" />}
          label="Certificates"
          value={mounted ? certificates.toString() : "9"}
          tag="+2"
          tagColor="bg-brand-light text-brand-blue"
        />
      </div>

      {/* ── Main 2-col layout ── */}
      <div className="grid grid-cols-[1fr_280px] gap-5 ">
        {/* Left column */}
        <div className="space-y-5 min-h-screen overflow-hidden">
          {/* Score trends */}
          <div className="rounded-2xl border border-border bg-white p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-brand-dark">Score Trends</h2>
              <Select value={period} onValueChange={v => setPeriod(v as Period)}>
                <SelectTrigger className="h-8 text-xs border-border rounded-xl w-36 focus:ring-brand-blue">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last_6_months">Last 6 Months</SelectItem>
                  <SelectItem value="last_3_months">Last 3 Months</SelectItem>
                  <SelectItem value="last_month">Last Month</SelectItem>
                  <SelectItem value="all_time">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Chart */}
            <div className="relative">
              <ScoreChart data={chartData} />
              {/* Month labels */}
              <div className="flex justify-between mt-3 px-4">
                {chartData.map(d => (
                  <span key={d.month} className="text-[11px] font-semibold text-brand-subtitle">{d.month}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Recent quiz results */}
          <div className="rounded-2xl border border-border bg-white p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-brand-dark">Recent Quiz Results</h2>
              <Link href="/history"
                className="text-xs font-semibold text-brand-blue hover:opacity-80 transition-opacity flex items-center gap-1">
                View All History <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Table header */}
            <div className="grid grid-cols-[1fr_100px_80px_80px] gap-3 px-3 mb-2">
              {["QUIZ TITLE", "DATE", "SCORE", "ACTION"].map(h => (
                <p key={h} className="text-[10px] font-bold uppercase tracking-widest text-brand-subtitle">{h}</p>
              ))}
            </div>

            <div className="space-y-1">
              {QUIZ_RESULTS.map((quiz) => (
                <div key={quiz.id}
                  className="grid grid-cols-[1fr_100px_80px_80px] gap-3 items-center px-3 py-3 rounded-xl hover:bg-slate-50 transition-colors group">
                  {/* Title */}
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-brand-light flex items-center justify-center shrink-0 text-brand-blue">
                      {quiz.icon}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-brand-dark leading-tight">{quiz.title}</p>
                      <p className="text-[11px] text-brand-subtitle">{quiz.subject}</p>
                    </div>
                  </div>
                  {/* Date */}
                  <p className="text-xs text-brand-subtitle">{quiz.date}</p>
                  {/* Score */}
                  <ScoreBadge score={quiz.score} />
                  {/* Action */}
                  <button className="text-xs font-semibold text-slate-400 border border-border rounded-lg px-3 py-1.5 hover:border-brand-blue hover:text-brand-blue transition-colors flex items-center gap-1">
                    <RotateCcw className="h-3 w-3" /> Review
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">

          {/* Keep it up XP card */}
          <div className="rounded-2xl bg-brand-navy p-5 text-white relative overflow-hidden">
            <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-white/5" />
            <div className="absolute top-2 right-2">
              <TrendingUp className="h-12 w-12 text-white/10" />
            </div>
            <p className="text-sm font-bold text-white mb-1.5 relative z-10">Keep it up!</p>
            <p className="text-xs text-blue-200 leading-relaxed mb-4 relative z-10">
              You&apos;re only <span className="font-bold text-white">400 XP</span> away from reaching Level 13 and unlocking the &apos;Master Researcher&apos; title.
            </p>
            {/* XP progress bar */}
            <div className="relative z-10">
              <div className="flex justify-between text-[10px] text-blue-300 mb-1.5 font-semibold">
                <span>Level 12</span>
                <span>Level 13</span>
              </div>
              <div className="h-2 rounded-full bg-white/15 overflow-hidden">
                <div className="h-full rounded-full bg-white/70 transition-all duration-1000"
                  style={{ width: "68%" }} />
              </div>
              <p className="text-[10px] text-blue-300 mt-1.5">3,200 / 3,600 XP</p>
            </div>
          </div>

          {/* Skill Mastery */}
          <div className="rounded-2xl bg-brand-navy overflow-hidden p-5 text-white">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-4 w-4 text-blue-300" />
              <h2 className="text-sm font-bold text-white">Skill Mastery</h2>
            </div>

            <SkillRadar />

            {/* Skill bars */}
            <div className="space-y-2 mt-4">
              {SKILLS.map(s => (
                <div key={s.label}>
                  <div className="flex justify-between text-[10px] font-semibold text-blue-200 mb-1">
                    <span>{s.label}</span>
                    <span>{s.value}%</span>
                  </div>
                  <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full rounded-full bg-white/60 transition-all duration-700"
                      style={{ width: `${s.value}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-blue-200 leading-relaxed mt-4">
              Your proficiency in <span className="font-bold text-white">Biology</span> is exceptional. Consider focusing more on <span className="font-bold text-white">Math</span> to balance your score.
            </p>
          </div>

          {/* Recent Achievements */}
          <div className="rounded-2xl border border-border bg-white p-5">
            <h2 className="text-sm font-bold text-brand-dark mb-4">Recent Achievements</h2>
            <div className="space-y-3">
              {ACHIEVEMENTS.map(a => (
                <div key={a.id} className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors ${a.locked ? "opacity-50" : "hover:bg-slate-50"}`}>
                  <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${a.iconBg}`}>
                    {a.icon}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-brand-dark leading-tight">{a.title}</p>
                    <p className="text-xs text-brand-subtitle">{a.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}