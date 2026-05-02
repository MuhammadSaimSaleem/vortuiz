"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  Info,
  Trophy,
  BookOpen,
  ChevronRight,
  Clock,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type NotifKind = "quiz" | "achievement" | "system";

interface Notification {
  id: string;
  kind: NotifKind;
  tag: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

interface NotificationDropdownProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

// ─── Seed data ────────────────────────────────────────────────────────────────
const INITIAL: Notification[] = [
  {
    id: "n1",
    kind: "quiz",
    tag: "New Quiz Assigned",
    title: "Fundamentals of UX Design",
    body: "A new examination has been assigned to your profile by Prof. Miller.",
    time: "2 mins ago",
    read: false,
  },
  {
    id: "n2",
    kind: "achievement",
    tag: "Achievement Earned",
    title: "Weekly Top Scorer!",
    body: "Congratulations! You've ranked in the top 5% of all active test-takers this week.",
    time: "1 hour ago",
    read: false,
  },
  {
    id: "n3",
    kind: "system",
    tag: "System Update",
    title: "Version 2.4.0 Live",
    body: "We've introduced a new distraction-free focus mode for high-stakes exams.",
    time: "4 hours ago",
    read: false,
  },
];

// ─── Icon config ──────────────────────────────────────────────────────────────
const iconConfig: Record<NotifKind, { icon: React.ReactNode; bg: string; color: string }> = {
  quiz:        { icon: <BookOpen className="h-5 w-5" />, bg: "bg-blue-50",   color: "text-brand-blue"  },
  achievement: { icon: <Trophy   className="h-5 w-5" />, bg: "bg-orange-50", color: "text-orange-500" },
  system:      { icon: <Info     className="h-5 w-5" />, bg: "bg-slate-100", color: "text-slate-500"  },
};

// ─── Tag label ────────────────────────────────────────────────────────────────
function TagLabel({ kind, label }: { kind: NotifKind; label: string }) {
  const colors: Record<NotifKind, string> = {
    quiz:        "text-brand-blue",
    achievement: "text-orange-500",
    system:      "text-slate-400",
  };
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${colors[kind]}`}>
      {kind === "quiz"        && <Clock   className="h-2.5 w-2.5" />}
      {kind === "achievement" && <Trophy  className="h-2.5 w-2.5" />}
      {kind === "system"      && <Info    className="h-2.5 w-2.5" />}
      {label}
    </span>
  );
}

// ─── Notification item ────────────────────────────────────────────────────────
function NotifItem({
  notif,
  onRead,
}: {
  notif: Notification;
  onRead: (id: string) => void;
}) {
  const cfg = iconConfig[notif.kind];

  return (
    <div
      onClick={() => onRead(notif.id)}
      className={`flex items-start gap-3.5 px-5 py-4 cursor-pointer transition-colors hover:bg-slate-50
        ${!notif.read ? "bg-white" : "bg-slate-50/50"}`}
    >
      {/* Icon */}
      <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${cfg.bg} ${cfg.color}`}>
        {cfg.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <TagLabel kind={notif.kind} label={notif.tag} />
        <p className={`text-sm font-bold mt-0.5 leading-tight ${notif.read ? "text-slate-500" : "text-brand-dark"}`}>
          {notif.title}
        </p>
        <p className="text-xs text-brand-subtitle leading-relaxed mt-1">{notif.body}</p>
        <p className="text-[11px] text-slate-400 font-medium mt-2">{notif.time}</p>
      </div>

      {/* Unread dot */}
      <div className="shrink-0 pt-1">
        {!notif.read
          ? <span className="h-2 w-2 rounded-full bg-brand-blue block" />
          : <span className="h-2 w-2 block" />
        }
      </div>
    </div>
  );
}

// ─── Main dropdown ────────────────────────────────────────────────────────────
 export default function NotificationDropdown({ open, setOpen }: NotificationDropdownProps) {
  const [notifs, setNotifs] = useState<Notification[]>(INITIAL);
  const ref = useRef<HTMLDivElement>(null);

  const unread = notifs.filter(n => !n.read).length;

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [setOpen]);

  const markRead = (id: string) => 
    setNotifs((p: Notification[]) => 
      p.map(n => n.id === id ? { ...n, read: true } : n)
    );

  const markAllRead = () => 
    setNotifs((p: Notification[]) => 
      p.map(n => ({ ...n, read: true }))
    );

  return (
    <div ref={ref} className="relative">
      {/* Bell button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative h-9 w-9 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors"
      >
        <Bell className="h-4 w-4 text-slate-500" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-brand-blue flex items-center justify-center">
            <span className="text-[9px] font-bold text-white leading-none">{unread}</span>
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute right-0 top-[calc(100%+8px)] w-95 rounded-2xl border border-border bg-white shadow-2xl shadow-slate-200/80 overflow-hidden z-50"
          style={{ animation: "dropIn .15s ease" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-brand-dark">Notifications</h3>
              {unread > 0 && (
                <span className="h-5 w-5 rounded-full bg-brand-blue flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white">{unread}</span>
                </span>
              )}
            </div>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-brand-blue hover:opacity-70 transition-opacity"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark All as Read
              </button>
            )}
          </div>

          {/* Notification list */}
          <div className="divide-y divide-border max-h-105 overflow-y-auto">
            {notifs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2 text-center px-6">
                <div className="h-12 w-12 rounded-2xl bg-brand-light flex items-center justify-center mb-1">
                  <Bell className="h-5 w-5 text-brand-blue" />
                </div>
                <p className="text-sm font-semibold text-brand-dark">All caught up!</p>
                <p className="text-xs text-brand-subtitle">No new notifications right now.</p>
              </div>
            ) : (
              notifs.map(n => <NotifItem key={n.id} notif={n} onRead={markRead} />)
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border">
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 py-4 text-sm font-bold text-brand-navy hover:bg-slate-50 transition-colors"
            >
              View All Notifications
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}

      <style>{`
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px) scale(.98); }
          to   { opacity: 1; transform: none; }
        }
      `}</style>
    </div>
  );
}