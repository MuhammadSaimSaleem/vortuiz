"use client";

import { createElement, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  Atom,
  Brain,
  BookOpen,
  Calculator,
  ChevronLeft,
  ChevronRight,
  Check,
  Code2,
  Dumbbell,
  Filter,
  FlaskConical,
  Globe2,
  Landmark,
  Languages,
  Leaf,
  ListFilter,
  Loader2,
  Microscope,
  Music2,
  Palette,
  Pencil,
  PenTool,
  Plus,
  ScrollText,
  TrendingUp,
  Trash2,
  Scroll,
  Book,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Subject {
  id: string;
  name: string;
  code: string;
  slug: string;
  description: string | null;
  icon_name: string | null;
  color_theme: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

interface SubjectWithStats extends Subject {
  quizCount: number;
  lastUpdated: string; // ISO string
}

interface SubjectFormValues {
  name: string;
  code: string;
  slug: string;
  description: string;
  icon_name: string;
  color_theme: string;
}

const PAGE_SIZE = 5;
const EMPTY_FORM: SubjectFormValues = {
  name: "",
  code: "",
  slug: "",
  description: "",
  icon_name: "book-open",
  color_theme: "slate",
};

// ─── Icon options ─────────────────────────────────────────────────────────────
const ICON_OPTIONS: { value: string; label: string; Icon: React.ElementType }[] = [
  { value: "book-open", label: "General", Icon: BookOpen },
  { value: "calculator", label: "Math", Icon: Calculator },
  { value: "atom", label: "Physics", Icon: Atom },
  { value: "flask-conical", label: "Chemistry", Icon: FlaskConical },
  { value: "microscope", label: "Biology", Icon: Microscope },
  { value: "code-2", label: "Computer Sci.", Icon: Code2 },
  { value: "globe", label: "Geography", Icon: Globe2 },
  { value: "landmark", label: "History", Icon: Landmark },
  { value: "scroll-text", label: "Literature", Icon: ScrollText },
  { value: "languages", label: "Languages", Icon: Languages },
  { value: "palette", label: "Art & Design", Icon: Palette },
  { value: "music-2", label: "Music", Icon: Music2 },
  { value: "dumbbell", label: "PE / Sports", Icon: Dumbbell },
  { value: "brain", label: "Psychology", Icon: Brain },
  { value: "pen-tool", label: "Design", Icon: PenTool },
  { value: "leaf", label: "Environmental", Icon: Leaf },
];

function getIconComponent(iconName?: string | null) {
  return ICON_OPTIONS.find((i) => i.value === iconName)?.Icon ?? BookOpen;
}

// ─── Color options ────────────────────────────────────────────────────────────
export const COLOR_OPTIONS: {
  value: string;
  label: string;
  bg: string;
  text: string;
  dot: string;
}[] = [
  { value: "slate", label: "Slate", bg: "bg-slate-100", text: "text-slate-700", dot: "bg-slate-400" },
  { value: "blue", label: "Blue", bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-400" },
  { value: "sky", label: "Sky", bg: "bg-sky-100", text: "text-sky-700", dot: "bg-sky-400" },
  { value: "cyan", label: "Cyan", bg: "bg-cyan-100", text: "text-cyan-700", dot: "bg-cyan-400" },
  { value: "teal", label: "Teal", bg: "bg-teal-100", text: "text-teal-700", dot: "bg-teal-400" },
  { value: "green", label: "Green", bg: "bg-green-100", text: "text-green-700", dot: "bg-green-400" },
  { value: "lime", label: "Lime", bg: "bg-lime-100", text: "text-lime-700", dot: "bg-lime-400" },
  { value: "amber", label: "Amber", bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-400" },
  { value: "orange", label: "Orange", bg: "bg-orange-100", text: "text-orange-700", dot: "bg-orange-400" },
  { value: "rose", label: "Rose", bg: "bg-rose-100", text: "text-rose-700", dot: "bg-rose-400" },
  { value: "pink", label: "Pink", bg: "bg-pink-100", text: "text-pink-700", dot: "bg-pink-400" },
  { value: "purple", label: "Purple", bg: "bg-purple-100", text: "text-purple-700", dot: "bg-purple-400" },
  { value: "violet", label: "Violet", bg: "bg-violet-100", text: "text-violet-700", dot: "bg-violet-400" },
  { value: "indigo", label: "Indigo", bg: "bg-indigo-100", text: "text-indigo-700", dot: "bg-indigo-400" },
];

function getColorClasses(colorTheme?: string | null) {
  return COLOR_OPTIONS.find((c) => c.value === colorTheme) ?? COLOR_OPTIONS[0];
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

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

// ─── Icon Picker ──────────────────────────────────────────────────────────────
function IconPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          className="h-10 w-10 rounded-xl border border-border bg-slate-50 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
        >
          {createElement(getIconComponent(value), { className: "h-4.5 w-4.5" })}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2 rounded-xl" align="start">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 px-1 pb-2">
          Choose Icon
        </p>
        <div className="grid grid-cols-4 gap-1.5">
          {ICON_OPTIONS.map(({ value: iconValue, label, Icon }) => (
            <button
              key={iconValue}
              type="button"
              title={label}
              onClick={() => {
                onChange(iconValue);
                setOpen(false);
              }}
              className={`h-10 w-10 rounded-lg flex items-center justify-center transition-colors ${
                value === iconValue
                  ? "bg-brand-navy text-white"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ─── Color Picker ─────────────────────────────────────────────────────────────
export function ColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = getColorClasses(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="h-10 px-3 rounded-xl border border-border bg-slate-50 flex items-center gap-2 text-sm text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
        >
          <span className={`h-3.5 w-3.5 rounded-full ${selected.dot}`} />
          {selected.label}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2 rounded-xl" align="start">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 px-1 pb-2">
          Choose Color
        </p>
        <div className="grid grid-cols-2 gap-1">
          {COLOR_OPTIONS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => {
                onChange(c.value);
                setOpen(false);
              }}
              className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                value === c.value ? "bg-slate-100" : "hover:bg-slate-50"
              }`}
            >
              <span className={`h-3 w-3 rounded-full ${c.dot}`} />
              {c.label}
              {value === c.value && <Check className="h-3 w-3 ml-auto text-brand-navy" />}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ─── Subject Row ──────────────────────────────────────────────────────────────
function SubjectRow({
  subject,
  onEdit,
  onDelete,
  onView,
}: {
  subject: SubjectWithStats;
  onEdit: (s: SubjectWithStats) => void;
  onDelete: (s: SubjectWithStats) => void;
  onView: (s: SubjectWithStats) => void;
}) {
  const colors = getColorClasses(subject.color_theme);

  return (
    <div className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_112px_auto] md:grid-cols-[1fr_112px_128px_auto] lg:grid-cols-[1fr_112px_128px_128px_176px] items-center gap-4 px-5 py-4 border-b border-border last:border-0 hover:bg-slate-50/60 transition-colors group">
      {/* Avatar + Name Details */}
      <div className="flex items-center gap-4 min-w-0">
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${colors.bg} ${colors.text}`}>
          {createElement(getIconComponent(subject.icon_name), { className: "h-4.5 w-4.5" })}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-col gap-1 max-w-125">
            <p className="font-bold text-brand-navy text-sm leading-tight truncate">{subject.name}</p>
            <p className="text-slate-400 text-xs leading-tight truncate">{subject.description}</p>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 font-mono sm:hidden">{subject.code}</p>
        </div>
      </div>

      {/* Code */}
      <div className="hidden sm:block">
        <p className="text-xs font-mono text-slate-500 tracking-wide">{subject.code}</p>
      </div>

      {/* Quiz count badge */}
      <div className="hidden md:block">
        <Badge className="bg-blue-50 text-brand-blue border-0 text-xs font-semibold px-3 py-1 rounded-full">
          {subject.quizCount} {subject.quizCount === 1 ? "Quiz" : "Quizzes"}
        </Badge>
      </div>

      {/* Last updated */}
      <div className="hidden lg:block">
        <p className="text-xs text-slate-500">{formatDate(subject.lastUpdated)}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 col-start-2 sm:col-start-auto">
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
          className="h-8 px-4 text-xs font-semibold rounded-xl border-border text-brand-navy hover:bg-brand-navy hover:text-white transition-colors whitespace-nowrap"
          onClick={() => onView(subject)}
        >
          View Quizzes
        </Button>
      </div>
    </div>
  );
}

// ─── Subject Form Dialog (Create / Edit) ───────────────────────────────────────
function SubjectFormDialog({
  open,
  mode,
  initial,
  submitting,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  mode: "create" | "edit";
  initial?: SubjectWithStats | null;
  submitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: SubjectFormValues) => void;
}) {
  const [values, setValues] = useState<SubjectFormValues>(EMPTY_FORM);
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    if (open) {
      queueMicrotask(() => {
        if (mode === "edit" && initial) {
          setValues({
            name: initial.name,
            code: initial.code,
            slug: initial.slug,
            description: initial.description ?? "",
            icon_name: initial.icon_name ?? "book-open",
            color_theme: initial.color_theme ?? "slate",
          });
          setSlugTouched(true);
        } else {
          setValues(EMPTY_FORM);
          setSlugTouched(false);
        }
      });
    }
  }, [open, mode, initial]);

  const handleNameChange = (name: string) => {
    setValues((v) => ({
      ...v,
      name,
      slug: slugTouched ? v.slug : slugify(name),
    }));
  };

  const handleSubmit = () => {
    if (!values.name.trim() || !values.code.trim()) {
      toast.error("Name and code are required");
      return;
    }
    onSubmit({
      ...values,
      slug: values.slug.trim() || slugify(values.name),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Add New Subject" : "Edit Subject"}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create a new subject to organize quizzes under."
              : "Update this subject's details."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="flex items-end gap-3">
            <IconPicker value={values.icon_name} onChange={(icon_name) => setValues((v) => ({ ...v, icon_name }))} />
            <ColorPicker value={values.color_theme} onChange={(color_theme) => setValues((v) => ({ ...v, color_theme }))} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="subject-name" className="text-xs font-semibold text-slate-600">
              Name
            </Label>
            <Input
              id="subject-name"
              placeholder="e.g. Mathematics"
              value={values.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="subject-code" className="text-xs font-semibold text-slate-600">
                Code
              </Label>
              <Input
                id="subject-code"
                placeholder="e.g. MATH-101"
                value={values.code}
                onChange={(e) => setValues((v) => ({ ...v, code: e.target.value.toUpperCase() }))}
                className="rounded-xl font-mono uppercase"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="subject-slug" className="text-xs font-semibold text-slate-600">
                Slug
              </Label>
              <Input
                id="subject-slug"
                placeholder="e.g. mathematics"
                value={values.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setValues((v) => ({ ...v, slug: e.target.value }));
                }}
                className="rounded-xl font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="subject-description" className="text-xs font-semibold text-slate-600">
              Description
            </Label>
            <Textarea
              id="subject-description"
              placeholder="Optional short description of this subject"
              value={values.description}
              onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
              className="rounded-xl resize-none"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            className="rounded-xl bg-brand-navy hover:bg-brand-blue text-white"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
            {mode === "create" ? "Create Subject" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SubjectManagementPage() {
  const router = useRouter();

  const [subjects, setSubjects] = useState<SubjectWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<"name" | "quizzes" | "updated">("name");

  const [deleteTarget, setDeleteTarget] = useState<SubjectWithStats | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [formTarget, setFormTarget] = useState<SubjectWithStats | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // ── Fetch subjects + derived quiz stats ──────────────────────────────────
  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const { data: subjectsData, error: subjectsError } = await supabase
        .from("subjects")
        .select("*")
        .order("name", { ascending: true });

      if (subjectsError) throw subjectsError;

      const { data: quizzesData, error: quizzesError } = await supabase
        .from("quizzes")
        .select("subject_id, created_at");

      if (quizzesError) throw quizzesError;

      const statsMap = new Map<string, { count: number; lastUpdated: string }>();
      (quizzesData ?? []).forEach((q) => {
        if (!q.subject_id) return;
        const existing = statsMap.get(q.subject_id);
        if (!existing) {
          statsMap.set(q.subject_id, { count: 1, lastUpdated: q.created_at });
        } else {
          existing.count += 1;
          if (new Date(q.created_at) > new Date(existing.lastUpdated)) {
            existing.lastUpdated = q.created_at;
          }
        }
      });

      const merged: SubjectWithStats[] = (subjectsData ?? []).map((s) => ({
        ...s,
        quizCount: statsMap.get(s.id)?.count ?? 0,
        lastUpdated: statsMap.get(s.id)?.lastUpdated ?? s.updated_at,
      }));

      setSubjects(merged);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load subjects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    queueMicrotask(() => {
      fetchSubjects();
    });
  }, []);

  const totalSubjects = subjects.length;
  const totalQuizzes = useMemo(
    () => subjects.reduce((sum, s) => sum + s.quizCount, 0),
    [subjects]
  );
  const totalPages = Math.max(1, Math.ceil(totalSubjects / PAGE_SIZE));

  const sorted = useMemo(() => {
    return [...subjects].sort((a, b) => {
      if (sortOrder === "quizzes") return b.quizCount - a.quizCount;
      if (sortOrder === "updated")
        return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
      return a.name.localeCompare(b.name);
    });
  }, [subjects, sortOrder]);

  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const openCreateDialog = () => {
    setFormMode("create");
    setFormTarget(null);
    setFormOpen(true);
  };

  const openEditDialog = (subject: SubjectWithStats) => {
    setFormMode("edit");
    setFormTarget(subject);
    setFormOpen(true);
  };

  const handleFormSubmit = async (values: SubjectFormValues) => {
    setSubmitting(true);
    try {
      if (formMode === "create") {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          toast.error("You must be logged in to create a subject");
          return;
        }

        const { data, error } = await supabase
          .from("subjects")
          .insert({
            name: values.name.trim(),
            code: values.code.trim(),
            slug: values.slug.trim(),
            description: values.description.trim() || null,
            icon_name: values.icon_name,
            color_theme: values.color_theme,
            created_by: user.id,
          })
          .select()
          .single();

        if (error) throw error;
        toast.success(`"${data.name}" created`);
      } else if (formTarget) {
        const { data, error } = await supabase
          .from("subjects")
          .update({
            name: values.name.trim(),
            code: values.code.trim(),
            slug: values.slug.trim(),
            description: values.description.trim() || null,
            icon_name: values.icon_name,
            color_theme: values.color_theme,
            updated_at: new Date().toISOString(),
          })
          .eq("id", formTarget.id)
          .select()
          .single();

        if (error) throw error;
        toast.success(`"${data.name}" updated`);
      }

      setFormOpen(false);
      fetchSubjects();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const { error } = await supabase.from("subjects").delete().eq("id", deleteTarget.id);
      if (error) throw error;

      toast.success(`"${deleteTarget.name}" deleted`);
      setDeleteTarget(null);

      const newTotal = subjects.length - 1;
      const newPages = Math.max(1, Math.ceil(newTotal / PAGE_SIZE));
      if (page > newPages) setPage(newPages);

      fetchSubjects();
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Failed to delete subject";
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  };

  const handleViewQuizzes = (subject: SubjectWithStats) => {
    router.push(`/teachers/quiz/view?subject=${subject.id}`);
  };

  return (
    <div className="flex min-h-screen bg-surface flex-1 flex-col">
      <main className="flex-1 px-6 py-6 space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-brand-navy">Subject Management</h1>
            <p className="text-sm text-slate-400 mt-1">Organize and manage your academic curriculum and quiz banks.</p>
          </div>
          <Button
            className="bg-brand-navy hover:bg-brand-blue text-white font-bold text-sm h-10 px-5 rounded-xl transition-colors shrink-0"
            onClick={openCreateDialog}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add New Subject
          </Button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            icon={<Book className="h-5 w-5 text-slate-500" />}
            label="Total Subjects"
            value={loading ? "—" : totalSubjects}
          />
          <StatCard
            icon={<Scroll className="h-5 w-5 text-slate-500" />}
            
            label="Total Quizzes"
            value={loading ? "—" : totalQuizzes}
          />
          <StatCard
            icon={<TrendingUp className="h-5 w-5 text-orange-500" />}
            label="Active Engagement"
            value="Currently None"
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
              {totalSubjects === 0
                ? "No subjects yet"
                : `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, totalSubjects)} of ${totalSubjects} subjects`}
            </p>
          </div>

          {/* Column headers */}
          <div className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_112px_auto] md:grid-cols-[1fr_112px_128px_auto] lg:grid-cols-[1fr_112px_128px_128px_176px] items-center gap-4 px-5 py-3 border-b border-border bg-slate-50/50">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Subject Name</p>
            </div>
            <div className="hidden sm:block">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Code</p>
            </div>
            <div className="hidden md:block">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Quizzes</p>
            </div>
            <div className="hidden lg:block">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Last Updated</p>
            </div>
            <div className="text-right pr-4 col-start-2 sm:col-start-auto">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Actions</p>
            </div>
          </div>

          {/* Rows */}
          {loading ? (
            <div className="flex items-center justify-center py-16 text-slate-400 gap-2 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading subjects…
            </div>
          ) : paginated.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <p className="text-sm font-semibold text-brand-navy">No subjects found</p>
              <p className="text-xs text-slate-400 mt-1 mb-4">Add your first subject to start organizing quizzes.</p>
              <Button
                size="sm"
                className="bg-brand-navy hover:bg-brand-blue text-white rounded-xl"
                onClick={openCreateDialog}
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Add New Subject
              </Button>
            </div>
          ) : (
            paginated.map((subject) => (
              <SubjectRow
                key={subject.id}
                subject={subject}
                onEdit={openEditDialog}
                onDelete={(s) => setDeleteTarget(s)}
                onView={handleViewQuizzes}
              />
            ))
          )}

          {/* Pagination */}
          {!loading && totalSubjects > 0 && (
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
          )}
        </div>
      </main>

      {/* Create / Edit dialog */}
      <SubjectFormDialog
        open={formOpen}
        mode={formMode}
        initial={formTarget}
        submitting={submitting}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
      />

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{deleteTarget?.name}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the subject and all quizzes under it. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl" disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-xl bg-red-500 hover:bg-red-600 text-white"
            >
              {deleting && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}