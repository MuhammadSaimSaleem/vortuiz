"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Filter,
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
} from "lucide-react";
import StudentProfile from "./_components/StudentProfile";
import type { StudentProfileData } from "./_components/StudentProfile";

// ─── Types ────────────────────────────────────────────────────────────────────

type Trend = "up" | "down" | "neutral";

// At the top of StudentRoster()
type View =
  | { type: "roster" }
  | { type: "profile"; studentId: string };

interface Student {
  id: string;
  name: string;
  email: string;
  parent: string;
  avatar: string;
  initials: string;
  groups: string[];
  score: number;
  trend: Trend;
  completion: number;
  lastActive: string;
  totalSpent: string;
  groupStyle: string;
}

// ─── Seed Data ────────────────────────────────────────────────────────────────

const SEED_STUDENTS: Student[] = [
  {
    id: "ST-88291",
    name: "Julian Reed",
    email: "j.reed@academy.edu",
    parent: "Mary Reed",
    avatar: "",
    initials: "JR",
    groups: ["HONORS", "CHESS CLUB"],
    score: 94.5,
    trend: "up",
    completion: 89,
    lastActive: "Today, 10:24 AM",
    totalSpent: "42h total spent",
    groupStyle: "honors",
  },
  {
    id: "ST-88295",
    name: "Elena Moretti",
    email: "elena.m@academy.edu",
    parent: "Fabio Moretti",
    avatar: "",
    initials: "EM",
    groups: ["NEEDS SUPPORT"],
    score: 62.1,
    trend: "down",
    completion: 45,
    lastActive: "Oct 24, 2023",
    totalSpent: "12h total spent",
    groupStyle: "needs-support",
  },
  {
    id: "ST-88302",
    name: "Marcus Thompson",
    email: "m.thompson@academy.edu",
    parent: "Sarah Thompson",
    avatar: "",
    initials: "MT",
    groups: ["CLASS 10B"],
    score: 81.8,
    trend: "neutral",
    completion: 92,
    lastActive: "Yesterday, 04:50 PM",
    totalSpent: "35h total spent",
    groupStyle: "class",
  },
  {
    id: "ST-88310",
    name: "Sophie Chen",
    email: "s.chen@academy.edu",
    parent: "Wei Chen",
    avatar: "",
    initials: "SC",
    groups: ["HONORS", "MATH OLYMPIAD"],
    score: 98.2,
    trend: "up",
    completion: 100,
    lastActive: "Today, 09:12 AM",
    totalSpent: "58h total spent",
    groupStyle: "honors",
  },
  {
    id: "ST-88315",
    name: "Liam Okafor",
    email: "l.okafor@academy.edu",
    parent: "Ngozi Okafor",
    avatar: "",
    initials: "LO",
    groups: ["CLASS 10B", "HONORS"],
    score: 88.3,
    trend: "up",
    completion: 78,
    lastActive: "Today, 08:55 AM",
    totalSpent: "31h total spent",
    groupStyle: "honors",
  },
  {
    id: "ST-88320",
    name: "Priya Nair",
    email: "p.nair@academy.edu",
    parent: "Suresh Nair",
    avatar: "",
    initials: "PN",
    groups: ["NEEDS SUPPORT"],
    score: 57.4,
    trend: "down",
    completion: 38,
    lastActive: "Nov 02, 2023",
    totalSpent: "8h total spent",
    groupStyle: "needs-support",
  },
  {
    id: "ST-88325",
    name: "Carlos Rivera",
    email: "c.rivera@academy.edu",
    parent: "Ana Rivera",
    avatar: "",
    initials: "CR",
    groups: ["CLASS 10B"],
    score: 75.0,
    trend: "neutral",
    completion: 70,
    lastActive: "Yesterday, 02:10 PM",
    totalSpent: "27h total spent",
    groupStyle: "class",
  },
  {
    id: "ST-88330",
    name: "Aisha Kamara",
    email: "a.kamara@academy.edu",
    parent: "Fatou Kamara",
    avatar: "",
    initials: "AK",
    groups: ["HONORS", "CHESS CLUB"],
    score: 91.6,
    trend: "up",
    completion: 95,
    lastActive: "Today, 11:00 AM",
    totalSpent: "50h total spent",
    groupStyle: "honors",
  },
];

const PAGE_SIZE = 4;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const groupBadgeStyles: Record<string, string> = {
  honors: "bg-blue-100 text-blue-700 border-blue-200",
  "needs-support": "bg-red-100 text-red-600 border-red-200",
  class: "bg-gray-100 text-gray-600 border-gray-200",
  default: "bg-gray-100 text-gray-600 border-gray-200",
};

function getGroupStyle(group: string): string {
  const lower = group.toLowerCase();
  if (lower.includes("honors") || lower.includes("olympiad"))
    return groupBadgeStyles["honors"];
  if (lower.includes("support")) return groupBadgeStyles["needs-support"];
  if (lower.includes("class")) return groupBadgeStyles["class"];
  return groupBadgeStyles["default"];
}

function TrendIcon({ trend }: { trend: string }) {
  if (trend === "up")
    return <TrendingUp className="w-4 h-4 text-green-500 inline ml-1" />;
  if (trend === "down")
    return <TrendingDown className="w-4 h-4 text-red-500 inline ml-1" />;
  return <Minus className="w-4 h-4 text-gray-400 inline ml-1" />;
}

function exportToCSV(students: Student[]) {
  const headers = [
    "ID",
    "Name",
    "Email",
    "Parent",
    "Groups",
    "Score",
    "Completion",
    "Last Active",
    "Total Spent",
  ];
  const rows = students.map((s) => [
    s.id,
    s.name,
    s.email,
    s.parent,
    s.groups.join("; "),
    `${s.score}%`,
    `${s.completion}%`,
    s.lastActive,
    s.totalSpent,
  ]);
  const csv = [headers, ...rows]
    .map((r) => r.map((c) => `"${c}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "students.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function formatSyncAgo(seconds: number): string {
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return `${Math.floor(seconds / 3600)}h ago`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function StudentRoster() {
  const [view, setView] = useState<View>({ type: "roster" });
  // ── Data state ──────────────────────────────────────────────────────────────
  const [students, setStudents] = useState<Student[]>(SEED_STUDENTS);

  // ── Selection ───────────────────────────────────────────────────────────────
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // ── Filter & Sort ───────────────────────────────────────────────────────────
  const [groupFilter, setGroupFilter] = useState("all");
  const [sortKey, setSortKey] = useState("perf-high");
  const [currentPage, setCurrentPage] = useState(1);

  // ── Dialogs ─────────────────────────────────────────────────────────────────
  const [messageOpen, setMessageOpen] = useState(false);
  const [messageSubject, setMessageSubject] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [messageSent, setMessageSent] = useState(false);
  const [messageTargets, setMessageTargets] = useState<Student[]>([]);

  const [removeTarget, setRemoveTarget] = useState<Student | null>(null);
  const [profileTarget, setProfileTarget] = useState<Student | null>(null);

  // ── Last sync ────────────────────────────────────────────────────────────────
  const [syncSeconds, setSyncSeconds] = useState(240); // 4m
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const id = setInterval(
      () => setSyncSeconds((s) => s + 1),
      1000
    );
    return () => clearInterval(id);
  }, []);

  const handleSync = useCallback(() => {
    setSyncing(true);
    setTimeout(() => {
      setSyncSeconds(0);
      setSyncing(false);
    }, 1200);
  }, []);

  // ── Derived data ─────────────────────────────────────────────────────────────

  function toProfileData(s: Student): StudentProfileData {
    return {
      id: s.id,
      name: s.name,
      initials: s.initials,
      avatar: s.avatar,
      studentId: s.id,
      enrolled: "Sept 2023",          // extend Student type if you have this
      topPercentile: s.score >= 90 ? 5 : s.score >= 80 ? 15 : 25,
      overallPercentile: s.score,
      percentileDelta: s.trend === "up" ? 4.2 : s.trend === "down" ? -2.1 : 0,
      accuracyStudent: s.score,
      accuracyClass: 72,
      topSubject: "Organic Chem",     // extend Student type for real data
      topSubjectPercentile: 98,
      skills: [
        { subject: "Biology",   score: 85 },
        { subject: "Physics",   score: 78 },
        { subject: "Chemistry", score: s.score },
        { subject: "Maths",     score: 82 },
        { subject: "History",   score: 70 },
      ],
      insights: [ /* your real insights */ ],
      quizAttempts: [ /* your real attempts */ ],
    };
  }

  const allGroups = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => s.groups.forEach((g) => set.add(g)));
    return Array.from(set).sort();
  }, [students]);

  const filtered = useMemo(() => {
    let list = [...students];
    if (groupFilter !== "all") {
      const target = groupFilter.toUpperCase().replace(/-/g, " ");
      list = list.filter((s) =>
        s.groups.some((g) => g.toUpperCase() === target)
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
        // "Today" first, then "Yesterday", then others
        list.sort((a, b) => {
          const rank = (s: string) =>
            s.startsWith("Today") ? 0 : s.startsWith("Yesterday") ? 1 : 2;
          return rank(a.lastActive) - rank(b.lastActive);
        });
        break;
    }
    return list;
  }, [students, groupFilter, sortKey]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  // reset page when filter/sort changes
  const handleGroupFilter = (v: string) => {
    setGroupFilter(v);
    setCurrentPage(1);
    setSelectedRows([]);
  };

  const handleSortKey = (v: string) => {
    setSortKey(v);
    setCurrentPage(1);
    setSelectedRows([]);
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
    return {
      avg: avg.toFixed(1),
      comp: comp.toFixed(1),
      needsFocus,
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
    // In production this would call an API
    console.log("Sending message", {
      to: messageTargets.map((s) => s.email),
      subject: messageSubject,
      body: messageBody,
    });
    setMessageSent(true);
    setTimeout(() => setMessageOpen(false), 1500);
  };

  // ── Remove helpers ───────────────────────────────────────────────────────────
  const confirmRemove = () => {
    if (!removeTarget) return;
    setStudents((prev) => prev.filter((s) => s.id !== removeTarget.id));
    setSelectedRows((prev) => prev.filter((id) => id !== removeTarget.id));
    setRemoveTarget(null);
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

  if (view.type === "profile") {
    const student = students.find((s) => s.id === view.studentId)!;
    return (
      <div className="min-h-screen bg-surface font-sans">
        <StudentProfile
          student={toProfileData(student)}
          onBack={() => setView({ type: "roster" })}
          onMessage={() => {
            // reuse your existing message dialog:
            setView({ type: "roster" });
            openMessageDialog([student]);
          }}
        />
      </div>
    );
  }

  return (        
      <div className="min-h-screen bg-surface font-sans flex flex-col ">
        <div className="p-6 flex flex-col max-w-400 mx-auto w-full">

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-heading font-bold text-brand-navy">Student Directory</h1>
            <p className="text-sm text-brand-subtitle mt-1">
              Real-time data for current students taking quiz
            </p>
          </div>
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-4 gap-3 flex-wrap w-full">
            <div className="flex gap-3">
              {/* Group Filter */}
              <Select value={groupFilter} onValueChange={handleGroupFilter}>
                <SelectTrigger className="w-44 bg-white border border-border rounded-lg text-sm font-medium">
                  <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="All Groups" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="all">All Groups</SelectItem>
                  {allGroups.map((g) => (
                    <SelectItem key={g} value={g.toLowerCase().replace(/ /g, "-")}>
                      {g.charAt(0) + g.slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

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

            <div className="flex gap-3">
              {/* Export */}
              <Button
                variant="outline"
                className="h-11 px-5 gap-2 border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 shadow-sm"
                onClick={() => exportToCSV(filtered)}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>

              {/* Message Students */}
              <Button
                className="h-11 px-5 gap-2 bg-brand-navy hover:bg-brand-navy/90 text-white rounded-xl shadow-md transition-all"
                onClick={handleMessageStudents}
              >
                <Mail className="w-4 h-4 mr-2" />
                {selectedRows.length > 0
                  ? `Message (${selectedRows.length})`
                  : "Message Students"}
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
                    Contact Info
                  </TableHead>
                  <TableHead className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                    Groups
                  </TableHead>
                  <TableHead className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                    Performance
                  </TableHead>
                  <TableHead className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                    Engagement
                  </TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
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
                      {/* Checkbox */}
                      <TableCell className="pl-5">
                        <Checkbox
                          checked={selectedRows.includes(student.id)}
                          onCheckedChange={() => toggleRow(student.id)}
                          className="rounded"
                        />
                      </TableCell>

                      {/* Student Profile */}
                      <TableCell className="py-5">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-12 h-12 rounded-xl">
                            <AvatarImage src={student.avatar} />
                            <AvatarFallback className="bg-brand-light text-brand-blue font-bold text-sm rounded-xl">
                              {student.initials}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold text-brand-navy text-[15px] leading-tight">
                              {student.name}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              ID: {student.id}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Contact Info */}
                      <TableCell>
                        <p className="text-sm text-foreground">{student.email}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Parent: {student.parent}
                        </p>
                      </TableCell>

                      {/* Groups */}
                      <TableCell>
                        <div className="flex flex-col gap-1.5">
                          {student.groups.map((group) => (
                            <Badge
                              key={group}
                              variant="outline"
                              className={`text-[11px] font-semibold tracking-wide px-2.5 py-0.5 rounded-full border w-fit ${getGroupStyle(group)}`}
                            >
                              {group}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>

                      {/* Performance */}
                      <TableCell className="min-w-40">
                        <div className="flex items-center gap-1 mb-1.5">
                          <span className="text-[17px] font-bold text-foreground">
                            {student.score}%
                          </span>
                          <TrendIcon trend={student.trend} />
                        </div>
                        <Progress
                          value={student.completion}
                          className="h-2 rounded-full bg-red"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {student.completion}% Completion
                        </p>
                      </TableCell>

                      {/* Engagement */}
                      <TableCell>
                        <p className="text-sm font-medium text-foreground">
                          {student.lastActive}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {student.totalSpent}
                        </p>
                      </TableCell>

                      {/* Actions */}
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
                          <DropdownMenuContent align="end" className="min-w-40">
                            <DropdownMenuItem onClick={() => setView({ type: "profile", studentId: student.id })}>
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openMessageDialog([student])}
                            >
                              Send Message
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => setRemoveTarget(student)}>
                              Remove Student
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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

          {/* Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: "AVG SCORE",
                value: `${stats.avg}%`,
                sub: "+2.4%",
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
                          className={`w-5 h-5 text-muted-foreground ${syncing ? "animate-spin" : ""}`}
                        />
                      </button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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
                  disabled={!messageSubject.trim() || !messageBody.trim()}
                  onClick={handleSendMessage}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Send Message
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
                ({removeTarget?.id}) from the roster? This cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRemoveTarget(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmRemove}>
                Remove
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── Profile Dialog ────────────────────────────────────────────────── */}
        <Dialog
          open={!!profileTarget}
          onOpenChange={(open) => !open && setProfileTarget(null)}
        >
          {profileTarget && (
            <DialogContent className="sm:max-w-sm">
              <DialogHeader>
                <DialogTitle>Student Profile</DialogTitle>
              </DialogHeader>
              <div className="flex items-center gap-4 py-2">
                <Avatar className="w-16 h-16 rounded-xl">
                  <AvatarImage src={profileTarget.avatar} />
                  <AvatarFallback className="bg-brand-light text-brand-blue font-bold text-lg rounded-xl">
                    {profileTarget.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-bold text-brand-navy text-lg">
                    {profileTarget.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {profileTarget.id}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-y-3 text-sm py-1">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium">{profileTarget.email}</span>
                <span className="text-muted-foreground">Parent</span>
                <span className="font-medium">{profileTarget.parent}</span>
                <span className="text-muted-foreground">Score</span>
                <span className="font-medium flex items-center gap-1">
                  {profileTarget.score}%
                  <TrendIcon trend={profileTarget.trend} />
                </span>
                <span className="text-muted-foreground">Completion</span>
                <span className="font-medium">{profileTarget.completion}%</span>
                <span className="text-muted-foreground">Last Active</span>
                <span className="font-medium">{profileTarget.lastActive}</span>
                <span className="text-muted-foreground">Time Spent</span>
                <span className="font-medium">{profileTarget.totalSpent}</span>
                <span className="text-muted-foreground">Groups</span>
                <div className="flex flex-wrap gap-1">
                  {profileTarget.groups.map((g) => (
                    <Badge
                      key={g}
                      variant="outline"
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${getGroupStyle(g)}`}
                    >
                      {g}
                    </Badge>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button
                  className="bg-brand-navy text-white hover:bg-brand-blue w-full"
                  onClick={() => {
                    setProfileTarget(null);
                    openMessageDialog([profileTarget]);
                  }}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </DialogFooter>
            </DialogContent>
          )}
        </Dialog>
      </div>
  );
}