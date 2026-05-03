"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Download,
  Eye,
  FlaskConical,
  FunctionSquare,
  Lock,
  MoreVertical,
  Star,
  TrendingUp,
  Trophy,
  Users,
  Zap,
  Calendar,
  Search,
  Medal,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Badge {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  borderColor: string;
  locked: boolean;
  lockedHint?: string;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  xp: number;
  isYou?: boolean;
  initials: string;
  avatarBg: string;
  trend?: "up" | "down" | "same";
}

interface Certificate {
  id: string;
  title: string;
  completedOn: string;
  grade: string;
  icon: React.ReactNode;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const BADGES: Badge[] = [
  {
    id: "fastest-finger",
    title: "Fastest Finger",
    subtitle: "Answered in 2s",
    icon: <Zap className="h-8 w-8" />,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-500",
    borderColor: "border-amber-100",
    locked: false,
  },
  {
    id: "perfect-week",
    title: "Perfect Week",
    subtitle: "7 Day Streak",
    icon: <Calendar className="h-8 w-8" />,
    iconBg: "bg-teal-50",
    iconColor: "text-teal-500",
    borderColor: "border-teal-100",
    locked: false,
  },
  {
    id: "quiz-master",
    title: "Quiz Master",
    subtitle: "100% Core Exams",
    icon: <Trophy className="h-8 w-8" />,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-500",
    borderColor: "border-blue-100",
    locked: false,
  },
  {
    id: "knowledge-seeker",
    title: "Knowledge Seeker",
    subtitle: "10 Courses Needed",
    icon: <Search className="h-8 w-8" />,
    iconBg: "bg-slate-100",
    iconColor: "text-slate-400",
    borderColor: "border-slate-100",
    locked: true,
    lockedHint: "10 Courses Needed",
  },
  {
    id: "peer-helper",
    title: "Peer Helper",
    subtitle: "Help 5 Students",
    icon: <Users className="h-8 w-8" />,
    iconBg: "bg-slate-100",
    iconColor: "text-slate-400",
    borderColor: "border-slate-100",
    locked: true,
    lockedHint: "Help 5 Students",
  },
];

const LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1,  name: "Sarah Chen",       xp: 12840, initials: "SC", avatarBg: "bg-gradient-to-br from-violet-500 to-purple-600", trend: "same"  },
  { rank: 2,  name: "Mark Walton",      xp: 11200, initials: "MW", avatarBg: "bg-gradient-to-br from-slate-400 to-slate-500",   trend: "up"    },
  { rank: 3,  name: "Jessica Low",      xp: 9950,  initials: "JL", avatarBg: "bg-gradient-to-br from-amber-400 to-orange-500",  trend: "down"  },
  { rank: 42, name: "Alex Johnson (You)", xp: 4250, initials: "AJ", avatarBg: "bg-gradient-to-br from-brand-navy to-brand-blue", isYou: true, trend: "up" },
];

const CERTIFICATES: Certificate[] = [
  {
    id: "bio",
    title: "Introduction to Biology",
    completedOn: "Oct 12, 2023",
    grade: "A+",
    icon: <FlaskConical className="h-6 w-6 text-brand-blue" />,
  },
  {
    id: "algebra",
    title: "Advanced Algebra",
    completedOn: "Aug 05, 2023",
    grade: "A",
    icon: <FunctionSquare className="h-6 w-6 text-brand-blue" />,
  },
  {
    id: "history",
    title: "World History: Modern Era",
    completedOn: "Jun 18, 2023",
    grade: "A-",
    icon: <BookOpen className="h-6 w-6 text-brand-blue" />,
  },
];

const RANK_COLORS: Record<number, string> = {
  1: "text-amber-500",
  2: "text-slate-400",
  3: "text-amber-700",
};

// ─── XP Progress bar ──────────────────────────────────────────────────────────
function XPBar() {
  const currentXP = 4250;
  const targetXP  = 5000;
  const pct       = Math.round((currentXP / targetXP) * 100);

  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-bold text-brand-dark">Next Level: 13</p>
        <p className="text-sm font-semibold text-brand-subtitle">750 XP remaining</p>
      </div>
      <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-brand-navy transition-all duration-1000"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── Badge card ───────────────────────────────────────────────────────────────
function BadgeCard({ badge }: { badge: Badge }) {
  return (
    <div className={`relative flex flex-col items-center rounded-2xl border bg-white p-6 gap-3 transition-all duration-200
      ${badge.locked ? "opacity-55" : "hover:shadow-md hover:-translate-y-0.5 cursor-pointer"}
      ${badge.borderColor}`}>
      {badge.locked && (
        <div className="absolute top-3 right-3">
          <Lock className="h-3.5 w-3.5 text-slate-400" />
        </div>
      )}
      <div className={`h-16 w-16 rounded-2xl flex items-center justify-center ${badge.iconBg}`}>
        <span className={badge.iconColor}>{badge.icon}</span>
      </div>
      <div className="text-center">
        <p className={`text-sm font-bold leading-tight ${badge.locked ? "text-slate-400" : "text-brand-dark"}`}>
          {badge.title}
        </p>
        <p className="text-xs text-brand-subtitle mt-0.5">{badge.subtitle}</p>
      </div>
    </div>
  );
}

// ─── Leaderboard entry ────────────────────────────────────────────────────────
function LeaderboardRow({ entry }: { entry: LeaderboardEntry }) {
  if (entry.isYou) {
    return (
      <div className="flex items-center gap-3 bg-brand-navy rounded-2xl px-4 py-3 mt-2">
        <span className="text-lg font-bold text-white w-8 shrink-0">{entry.rank}</span>
        <div className={`h-9 w-9 rounded-full ${entry.avatarBg} flex items-center justify-center shrink-0`}>
          <span className="text-xs font-bold text-white">{entry.initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white truncate">{entry.name}</p>
          <p className="text-xs text-blue-300">{entry.xp.toLocaleString()} XP</p>
        </div>
        <TrendingUp className="h-4 w-4 text-emerald-400 shrink-0" />
      </div>
    );
  }

  const rankColor = RANK_COLORS[entry.rank] ?? "text-slate-500";

  return (
    <div className="flex items-center gap-3 px-1 py-2.5 hover:bg-slate-50 rounded-xl transition-colors">
      <span className={`text-lg font-bold w-8 shrink-0 ${rankColor}`}>{entry.rank}</span>
      <div className={`h-9 w-9 rounded-full ${entry.avatarBg} flex items-center justify-center shrink-0`}>
        <span className="text-xs font-bold text-white">{entry.initials}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-brand-dark truncate">{entry.name}</p>
        <p className="text-xs text-brand-subtitle">{entry.xp.toLocaleString()} XP</p>
      </div>
      {entry.rank <= 3 && (
        <Medal className={`h-4 w-4 shrink-0 ${rankColor}`} />
      )}
    </div>
  );
}

// ─── Certificate row ──────────────────────────────────────────────────────────
function CertificateRow({ cert }: { cert: Certificate }) {
  return (
    <div className="flex items-center gap-5 px-6 py-5 bg-white rounded-2xl border border-border hover:shadow-sm transition-all">
      {/* Icon tile */}
      <div className="relative shrink-0">
        <div className="h-14 w-14 rounded-xl bg-slate-100 flex items-center justify-center">
          {cert.icon}
        </div>
        {/* Green dot */}
        <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-base font-bold text-brand-dark">{cert.title}</p>
        <p className="text-sm text-brand-subtitle mt-0.5">
          Completed on {cert.completedOn} &nbsp;·&nbsp; Grade:&nbsp;
          <span className="font-bold text-brand-dark">{cert.grade}</span>
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <Button variant="outline" size="sm"
          className="h-9 px-4 border-border text-sm font-semibold text-brand-dark rounded-xl gap-1.5 hover:border-brand-blue hover:text-brand-blue transition-colors">
          <Eye className="h-3.5 w-3.5" /> View
        </Button>
        <Button size="sm"
          className="h-9 px-4 bg-brand-navy hover:bg-brand-blue text-white text-sm font-semibold rounded-xl gap-1.5 transition-colors">
          <Download className="h-3.5 w-3.5" /> Download PDF
        </Button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AchievementsPage() {
  const [showAllBadges, setShowAllBadges] = useState(false);

  return (
    <div className="min-h-full bg-surface p-6 space-y-6">

      {/* ── Student Profile header ── */}
      <div className="rounded-2xl border border-border bg-white px-7 py-6">
        <p className="text-[11px] font-bold uppercase tracking-widest text-brand-subtitle mb-2">
          Student Profile
        </p>
        <div className="flex items-end gap-6 flex-wrap">
          {/* Name + meta */}
          <div className="flex-1 min-w-50">
            <h1 className="text-3xl font-bold text-brand-dark tracking-tight mb-3">Abdullah Shoukat</h1>
            <div className="flex items-center gap-3">
              {/* Level pill */}
              <span className="text-sm font-bold text-brand-navy bg-brand-light px-3 py-1 rounded-full">
                Level 12
              </span>
              {/* XP */}
              <span className="flex items-center gap-1.5 text-sm font-semibold text-brand-subtitle">
                <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                4,250 XP
              </span>
            </div>
          </div>

          {/* XP progress */}
          <XPBar />
        </div>
      </div>

      {/* ── Main 2-col layout ── */}
      <div className="grid grid-cols-[1fr_280px] gap-5 items-start">

        {/* Left column */}
        <div className="space-y-6">

          {/* Milestone Badges */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-brand-dark">Milestone Badges</h2>
              <button
                onClick={() => setShowAllBadges(p => !p)}
                className="text-sm font-semibold text-brand-blue hover:opacity-70 transition-opacity"
              >
                {showAllBadges ? "Show Less" : "View All"}
              </button>
            </div>

            <div className="grid grid-cols-4 gap-4">
              {(showAllBadges ? BADGES : BADGES.slice(0, 4)).map(badge => (
                <BadgeCard key={badge.id} badge={badge} />
              ))}
              {/* Extra locked row when expanded */}
              {!showAllBadges && BADGES.length > 4 && (
                <BadgeCard badge={BADGES[4]} />
              )}
            </div>
          </div>

          {/* Earned Certificates */}
          <div>
            <h2 className="text-xl font-bold text-brand-dark mb-4">Earned Certificates</h2>
            <div className="space-y-3">
              {CERTIFICATES.map(cert => (
                <CertificateRow key={cert.id} cert={cert} />
              ))}
            </div>
          </div>
        </div>

        {/* Right column — Leaderboard */}
        <div className="rounded-2xl border border-border bg-white p-5 sticky top-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-brand-dark">Leaderboard</h2>
            <Trophy className="h-5 w-5 text-amber-500" />
          </div>

          <div className="space-y-1">
            {LEADERBOARD.filter(e => !e.isYou).map(entry => (
              <LeaderboardRow key={entry.rank} entry={entry} />
            ))}
          </div>

          {/* Gap indicator */}
          <div className="flex justify-center my-2">
            <MoreVertical className="h-4 w-4 text-slate-300" />
          </div>

          {/* You row */}
          {LEADERBOARD.filter(e => e.isYou).map(entry => (
            <LeaderboardRow key={entry.rank} entry={entry} />
          ))}
        </div>
      </div>
    </div>
  );
}