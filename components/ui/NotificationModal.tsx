"use client";

import { useState, useRef, useEffect, useCallback, startTransition } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  Info,
  Trophy,
  BookOpen,
  ChevronRight,
  Clock,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

// ─── Types ────────────────────────────────────────────────────────────────────
type NotifKind = "quiz" | "achievement" | "system";

interface NotificationRow {
  id: string; 
  user_id: string;
  title: string | null;
  body: string | null;
  icon: string | null;
  tag: string | null;
  created_at: string;
  is_read: boolean;
  kind: string | null;
}

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
  userId: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function toNotifKind(raw: string | null | undefined): NotifKind {
  if (raw === "quiz" || raw === "achievement" || raw === "system") return raw;
  return "system";
}

function rowToNotification(row: NotificationRow): Notification {
  return {
    id: row.id, 
    kind: toNotifKind(row.kind),
    tag: row.tag ?? "",
    title: row.title ?? "(Untitled)",
    body: row.body ?? "",
    time: formatRelativeTime(row.created_at),
    read: row.is_read,
  };
}

function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

const iconConfig: Record<NotifKind, { icon: React.ReactNode; bg: string; color: string }> = {
  quiz:        { icon: <BookOpen className="h-5 w-5" />, bg: "bg-blue-50",   color: "text-brand-blue"  },
  achievement: { icon: <Trophy   className="h-5 w-5" />, bg: "bg-orange-50", color: "text-orange-500" },
  system:      { icon: <Info     className="h-5 w-5" />, bg: "bg-slate-100", color: "text-slate-500"  },
};

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

function NotifItem({ notif, onRead }: { notif: Notification; onRead: (id: string) => void }) {
  const cfg = iconConfig[notif.kind];
  return (
    <div
      onClick={() => onRead(notif.id)}
      className={`flex items-start gap-3.5 px-5 py-4 cursor-pointer transition-colors hover:bg-slate-50
        ${!notif.read ? "bg-white" : "bg-slate-50/50"}`}
    >
      <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${cfg.bg} ${cfg.color}`}>
        {cfg.icon}
      </div>
      <div className="flex-1 min-w-0">
        <TagLabel kind={notif.kind} label={notif.tag} />
        <p className={`text-sm font-bold mt-0.5 leading-tight ${notif.read ? "text-slate-500" : "text-brand-dark"}`}>
          {notif.title}
        </p>
        <p className="text-xs text-brand-subtitle leading-relaxed mt-1">{notif.body}</p>
        <p className="text-[11px] text-slate-400 font-medium mt-2">{notif.time}</p>
      </div>
      <div className="shrink-0 pt-1">
        {!notif.read ? <span className="h-2 w-2 rounded-full bg-brand-blue block" /> : <span className="h-2 w-2 block" />}
      </div>
    </div>
  );
}

// ─── Main dropdown ────────────────────────────────────────────────────────────
export default function NotificationDropdown({ open, setOpen, userId }: NotificationDropdownProps) {
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const unread = notifs.filter(n => !n.read).length;

  // ── Fetch notifications from Supabase ────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);

    const { data, error: sbError } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (sbError) {
      setError("Failed to load notifications.");
    } else {
      const mappedData = (data as NotificationRow[]).map(rowToNotification);
      setNotifs(mappedData);
    }

    setLoading(false);
  }, [userId]);

  useEffect(() => {
    if (userId) {
      startTransition(() => { fetchNotifications(); });
    }
  }, [userId, open, fetchNotifications]);

  // ── Real-time subscription ────────────────────────────────────────────────
  useEffect(() => {
    if (!userId) return;

    const roomName = `notifications_room_${userId}`;
    const channel = supabase
      .channel(roomName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newNotif = rowToNotification(payload.new as NotificationRow);
            if (payload.new.user_id === userId) {
              setNotifs(prev => [newNotif, ...prev]);
            }
          } else if (payload.eventType === "UPDATE") {
            const updated = rowToNotification(payload.new as NotificationRow);
            setNotifs(prev => prev.map(n => n.id === updated.id ? updated : n));
          } else if (payload.eventType === "DELETE") {
            const deletedId = String((payload.old as NotificationRow).id);
            setNotifs(prev => prev.filter(n => n.id !== deletedId));
          }
        }
      )
      .subscribe();

    return () => { 
      supabase.removeChannel(channel); 
    };
  }, [userId]);

  // ── Close on outside click ────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [setOpen]);

  // ── Mark a single notification as read ───────────────────────────────────
  const markRead = async (id: string) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

    const { error: sbError } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id) 
      .eq("user_id", userId);

    if (sbError) {
      setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: false } : n));
    }
  };

  // ── Mark all notifications as read ───────────────────────────────────────
  const markAllRead = async () => {
    const unreadIds = notifs.filter(n => !n.read).map(n => n.id);
    if (unreadIds.length === 0) return;

    setNotifs(prev => prev.map(n => ({ ...n, read: true })));

    const { error: sbError } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .in("id", unreadIds) 
      .eq("user_id", userId);

    if (sbError) {
      setNotifs(prev =>
        prev.map(n => unreadIds.includes(n.id) ? { ...n, read: false } : n)
      );
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`relative h-9 w-9 flex items-center justify-center rounded-xl transition-all
          ${open 
            ? "bg-slate-100 text-brand-blue" 
            : "hover:bg-slate-100 text-slate-500"
          }`}
      >
        <Bell 
          className={`h-4 w-4 transition-colors
            ${unread > 0 ? "text-brand-blue fill-brand-blue/10" : ""}
            ${open ? "text-brand-blue" : ""}
          `} 
        />
        {unread > 0 && (
          <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-brand-blue flex items-center justify-center border-2 border-white ring-1 ring-brand-blue/10">
            <span className="text-[9px] font-bold text-white leading-none">{unread}</span>
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-[calc(100%+8px)] w-95 rounded-2xl border border-border bg-white shadow-2xl shadow-slate-200/80 overflow-hidden z-50"
          style={{ animation: "dropIn .15s ease" }}
        >
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

          <div className="divide-y divide-border max-h-105 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-5 w-5 text-brand-blue animate-spin" />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2 text-center px-6">
                <p className="text-sm font-semibold text-red-500">{error}</p>
                <button onClick={fetchNotifications} className="text-xs text-brand-blue hover:underline">
                  Try again
                </button>
              </div>
            ) : notifs.length === 0 ? (
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

          <div className="border-t border-border">
            <Link
              href="#"
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