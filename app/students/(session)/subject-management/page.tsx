"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Filter,
  ListFilter,
  Pencil,
  Plus,
  TrendingUp,
  Trash2,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Subject {
  id: string;
  name: string;
  category: string;
  code: string;
  quizCount: number;
  lastUpdated: string;
  color: string; // tailwind bg color class
  textColor: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const ALL_SUBJECTS: Subject[] = [
  { id: "1", name: "Mathematics", category: "Science & Engineering", code: "MATH-101", quizCount: 42, lastUpdated: "Oct 24, 2023", color: "bg-blue-100", textColor: "text-blue-700" },
  { id: "2", name: "Biology", category: "Life Sciences", code: "BIOL-204", quizCount: 28, lastUpdated: "Nov 02, 2023", color: "bg-green-100", textColor: "text-green-700" },
  { id: "3", name: "Physics", category: "Science & Engineering", code: "PHYS-102", quizCount: 35, lastUpdated: "Oct 28, 2023", color: "bg-purple-100", textColor: "text-purple-700" },
  { id: "4", name: "Computer Science", category: "Information Technology", code: "CSCI-301", quizCount: 51, lastUpdated: "Nov 15, 2023", color: "bg-amber-100", textColor: "text-amber-700" },
  { id: "5", name: "Chemistry", category: "Life Sciences", code: "CHEM-201", quizCount: 19, lastUpdated: "Oct 30, 2023", color: "bg-rose-100", textColor: "text-rose-700" },
  { id: "6", name: "History", category: "Humanities", code: "HIST-110", quizCount: 23, lastUpdated: "Nov 05, 2023", color: "bg-orange-100", textColor: "text-orange-700" },
  { id: "7", name: "Literature", category: "Humanities", code: "LIT-202", quizCount: 14, lastUpdated: "Nov 08, 2023", color: "bg-teal-100", textColor: "text-teal-700" },
  { id: "8", name: "Economics", category: "Social Sciences", code: "ECON-301", quizCount: 31, lastUpdated: "Nov 12, 2023", color: "bg-indigo-100", textColor: "text-indigo-700" },
  { id: "9", name: "Geography", category: "Social Sciences", code: "GEO-105", quizCount: 17, lastUpdated: "Nov 01, 2023", color: "bg-cyan-100", textColor: "text-cyan-700" },
  { id: "10", name: "Art & Design", category: "Creative Arts", code: "ART-150", quizCount: 9, lastUpdated: "Oct 20, 2023", color: "bg-pink-100", textColor: "text-pink-700" },
  { id: "11", name: "Music Theory", category: "Creative Arts", code: "MUS-110", quizCount: 12, lastUpdated: "Oct 22, 2023", color: "bg-violet-100", textColor: "text-violet-700" },
  { id: "12", name: "Physical Education", category: "Health & Sports", code: "PE-101", quizCount: 7, lastUpdated: "Oct 19, 2023", color: "bg-lime-100", textColor: "text-lime-700" },
];

const PAGE_SIZE = 4;

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-white p-5 flex items-center gap-4">
      <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${accent ? "bg-orange-100" : "bg-slate-100"}`}>
        {icon}
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-0.5">{label}</p>
        <p className={`text-2xl font-bold ${accent ? "text-orange-500" : "text-brand-navy"}`}>{value}</p>
      </div>
    </div>
  );
}

// ─── Subject Row ──────────────────────────────────────────────────────────────
function SubjectRow({
  subject,
  onEdit,
  onDelete,
}: {
  subject: Subject;
  onEdit: (s: Subject) => void;
  onDelete: (s: Subject) => void;
}) {
  return (
    <div className="flex items-center gap-4 px-5 py-4 border-b border-border last:border-0 hover:bg-slate-50/60 transition-colors group">
      {/* Avatar */}
      <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-base ${subject.color} ${subject.textColor}`}>
        {subject.name[0]}
      </div>

      {/* Name + category */}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-brand-navy text-sm leading-tight">{subject.name}</p>
        <p className="text-xs text-slate-400 mt-0.5">{subject.category}</p>
      </div>

      {/* Code */}
      <div className="w-28 shrink-0 hidden sm:block">
        <p className="text-xs font-mono text-slate-500 tracking-wide">{subject.code}</p>
      </div>

      {/* Quiz count badge */}
      <div className="w-32 shrink-0 hidden md:block">
        <Badge className="bg-blue-50 text-brand-blue border-0 text-xs font-semibold px-3 py-1 rounded-full">
          {subject.quizCount} Quizzes
        </Badge>
      </div>

      {/* Last updated */}
      <div className="w-32 shrink-0 hidden lg:block">
        <p className="text-xs text-slate-500">{subject.lastUpdated}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => onEdit(subject)}
          className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-brand-navy hover:bg-slate-100 transition-colors"
          aria-label="Edit subject"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onDelete(subject)}
          className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          aria-label="Delete subject"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-4 text-xs font-semibold rounded-xl border-border text-brand-navy hover:bg-brand-navy hover:text-white transition-colors"
          onClick={() => toast.info(`Viewing quizzes for ${subject.name}`)}
        >
          View Quizzes
        </Button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SubjectManagementPage() {
  const [subjects, setSubjects] = useState<Subject[]>(ALL_SUBJECTS);
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Subject | null>(null);
  const [sortOrder, setSortOrder] = useState<"name" | "quizzes" | "updated">("name");

  const totalSubjects = subjects.length;
  const totalQuizzes = subjects.reduce((sum, s) => sum + s.quizCount, 0);
  const totalPages = Math.ceil(totalSubjects / PAGE_SIZE);

  const sorted = [...subjects].sort((a, b) => {
    if (sortOrder === "quizzes") return b.quizCount - a.quizCount;
    if (sortOrder === "updated") return b.lastUpdated.localeCompare(a.lastUpdated);
    return a.name.localeCompare(b.name);
  });

  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = () => {
    if (!deleteTarget) return;
    setSubjects((prev) => prev.filter((s) => s.id !== deleteTarget.id));
    toast.success(`"${deleteTarget.name}" deleted`);
    setDeleteTarget(null);
    // reset to last valid page if needed
    const newTotal = subjects.length - 1;
    const newPages = Math.ceil(newTotal / PAGE_SIZE);
    if (page > newPages) setPage(Math.max(1, newPages));
  };

  return (
    <div className="flex min-h-screen bg-surface flex-1 flex-col">
      <main className="flex-1 px-6 py-6 space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-brand-navy">Subject Management</h1>
            <p className="text-sm text-slate-400 mt-1">Organize and manage your academic curriculum and quiz banks.</p>
          </div>
          <Button
            className="bg-brand-navy hover:bg-brand-blue text-white font-bold text-sm h-10 px-5 rounded-xl transition-colors shrink-0"
            onClick={() => toast.info("Add New Subject clicked")}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add New Subject
          </Button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            icon={<BookOpen className="h-5 w-5 text-slate-500" />}
            label="Total Subjects"
            value={totalSubjects}
          />
          <StatCard
            icon={
              <svg className="h-5 w-5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            }
            label="Total Quizzes"
            value={totalQuizzes}
          />
          <StatCard
            icon={<TrendingUp className="h-5 w-5 text-orange-500" />}
            label="Active Engagement"
            value="+24%"
            accent
          />
        </div>

        {/* Table Card */}
        <div className="rounded-2xl border border-border bg-white overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border gap-3">
            <div className="flex items-center gap-2">
              {/* Filter button */}
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3.5 text-xs font-semibold rounded-xl border-border text-slate-600 gap-1.5"
                onClick={() => toast.info("Filter clicked")}
              >
                <Filter className="h-3.5 w-3.5" />
                Filter
              </Button>

              {/* Sort dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-3.5 text-xs font-semibold rounded-xl border-border text-slate-600 gap-1.5"
                  >
                    <ListFilter className="h-3.5 w-3.5" />
                    Sort
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="rounded-xl text-sm">
                  <DropdownMenuItem onClick={() => { setSortOrder("name"); setPage(1); }}>
                    Sort by Name
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setSortOrder("quizzes"); setPage(1); }}>
                    Sort by Quizzes
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setSortOrder("updated"); setPage(1); }}>
                    Sort by Last Updated
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <p className="text-xs text-slate-400 font-medium">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, totalSubjects)} of {totalSubjects} subjects
            </p>
          </div>

          {/* Column headers */}
          <div className="flex items-center gap-4 px-5 py-3 border-b border-border bg-slate-50/50">
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Subject Name</p>
            </div>
            <div className="w-28 shrink-0 hidden sm:block">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Code</p>
            </div>
            <div className="w-32 shrink-0 hidden md:block">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Quizzes</p>
            </div>
            <div className="w-32 shrink-0 hidden lg:block">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Last Updated</p>
            </div>
            <div className="shrink-0 w-44 text-right">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Actions</p>
            </div>
          </div>

          {/* Rows */}
          {paginated.map((subject) => (
            <SubjectRow
              key={subject.id}
              subject={subject}
              onEdit={(s) => toast.info(`Edit "${s.name}"`)}
              onDelete={(s) => setDeleteTarget(s)}
            />
          ))}

          {/* Pagination */}
          <div className="flex items-center justify-center gap-2 px-5 py-4 border-t border-border">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-brand-navy hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`h-8 w-8 rounded-lg text-sm font-semibold transition-colors ${
                  p === page
                    ? "bg-brand-navy text-white"
                    : "text-slate-500 hover:bg-slate-100 hover:text-brand-navy"
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-brand-navy hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-colors"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </main>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{deleteTarget?.name}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the subject and all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="rounded-xl bg-red-500 hover:bg-red-600 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}