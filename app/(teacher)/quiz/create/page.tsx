"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlignLeft,
  ArrowLeft,
  BarChart2,
  Bell,
  BookOpen,
  CheckCheck,
  CheckCircle2,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Circle,
  Clock,
  Code2,
  Copy,
  Cpu,
  FlaskConical,
  Globe,
  GripVertical,
  HelpCircle,
  History,
  Languages,
  LayoutList,
  List,
  MoreHorizontal,
  Music,
  Palette,
  Pencil,
  Plus,
  Search,
  Settings,
  Sigma,
  Sparkles,
  Star,
  Target,
  ToggleLeft,
  Trash2,
  Upload,
  AlertCircle,
  X,
} from "lucide-react";
import TopBar from "@/components/ui/Topbar";

// ─── Types ────────────────────────────────────────────────────────────────────
type QuestionType = "MULTIPLE CHOICE" | "TRUE / FALSE" | "SHORT ANSWER" | "CHECKBOX";
type AppStep = "subject" | "builder";

interface Subject {
  id: string;
  label: string;
  department: string;
  icon: React.ReactNode;
  bg: string;
  iconColor: string;
  accent: string;
  description: string;
}

interface Option {
  id: string;
  text: string;
  correct: boolean;
}

interface Question {
  id: string;
  number: number;
  text: string;
  type: QuestionType;
  points: number;
  options: Option[];
  required: boolean;
  collapsed: boolean;
}

type ToastKind = "success" | "error" | "info";
interface Toast { id: string; message: string; kind: ToastKind; }

// ─── Subject catalogue ────────────────────────────────────────────────────────
const subjects: Subject[] = [
  { id: "science",     label: "Science",      department: "Science Department",      icon: <FlaskConical className="h-8 w-8" />, bg: "bg-blue-50",    iconColor: "text-blue-500",   accent: "border-blue-200 hover:border-blue-400",   description: "Biology, Chemistry, Physics & Earth Science" },
  { id: "mathematics", label: "Mathematics",  department: "Mathematics Department",  icon: <Sigma        className="h-8 w-8" />, bg: "bg-orange-50",  iconColor: "text-orange-500", accent: "border-orange-200 hover:border-orange-400", description: "Algebra, Calculus, Geometry & Statistics" },
  { id: "languages",   label: "Languages",    department: "Languages Department",    icon: <Languages    className="h-8 w-8" />, bg: "bg-emerald-50", iconColor: "text-emerald-600",accent: "border-emerald-200 hover:border-emerald-400",description: "English, Literature, ESL & World Languages" },
  { id: "arts",        label: "Arts",         department: "Arts Department",         icon: <Palette      className="h-8 w-8" />, bg: "bg-purple-50",  iconColor: "text-purple-500", accent: "border-purple-200 hover:border-purple-400", description: "Visual Arts, Drama, Music & Media" },
  { id: "history",     label: "History",      department: "History Department",      icon: <History      className="h-8 w-8" />, bg: "bg-rose-50",    iconColor: "text-rose-500",   accent: "border-rose-200 hover:border-rose-400",    description: "World History, Civics, Geography & Politics" },
  { id: "technology",  label: "Technology",   department: "Technology Department",   icon: <Cpu          className="h-8 w-8" />, bg: "bg-cyan-50",    iconColor: "text-cyan-600",   accent: "border-cyan-200 hover:border-cyan-400",    description: "Computer Science, ICT & Digital Literacy" },
  { id: "music",       label: "Music",        department: "Music Department",        icon: <Music        className="h-8 w-8" />, bg: "bg-pink-50",    iconColor: "text-pink-500",   accent: "border-pink-200 hover:border-pink-400",    description: "Theory, Composition, Instruments & Ensemble" },
  { id: "geography",   label: "Geography",    department: "Geography Department",    icon: <Globe        className="h-8 w-8" />, bg: "bg-teal-50",    iconColor: "text-teal-600",   accent: "border-teal-200 hover:border-teal-400",    description: "Physical, Human & Environmental Geography" },
  { id: "computing",   label: "Computing",    department: "Computing Department",    icon: <Code2        className="h-8 w-8" />, bg: "bg-violet-50",  iconColor: "text-violet-600", accent: "border-violet-200 hover:border-violet-400", description: "Programming, Algorithms, Data & Networks" },
  { id: "literature",  label: "Literature",   department: "Literature Department",   icon: <BookOpen     className="h-8 w-8" />, bg: "bg-amber-50",   iconColor: "text-amber-600",  accent: "border-amber-200 hover:border-amber-400",  description: "Fiction, Poetry, Drama & Critical Analysis" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

function defaultOptions(type: QuestionType): Option[] {
  if (type === "TRUE / FALSE")
    return [
      { id: uid(), text: "True",  correct: false },
      { id: uid(), text: "False", correct: false },
    ];
  if (type === "SHORT ANSWER") return [];
  return [{ id: uid(), text: "Option A", correct: false }];
}

function renumber(qs: Question[]): Question[] {
  return qs.map((q, i) => ({ ...q, number: i + 1 }));
}

function getDifficulty(estimatedMins: number, timeLimit: number): { label: string; cls: string } {
  const usage = timeLimit > 0 ? (estimatedMins / timeLimit) * 100 : 0;
  if (usage === 0 || usage <= 40) return { label: "Easy",        cls: "text-emerald-500" };
  if (usage <= 70)                 return { label: "Intermediate", cls: "text-orange-500" };
  if (usage <= 100)                return { label: "Hard",         cls: "text-red-500"    };
  return                                  { label: "Impossible",   cls: "text-purple-600" };
}

// ─── qTypes config ────────────────────────────────────────────────────────────
const qTypes: { label: QuestionType; icon: React.ReactNode; color: string }[] = [
  { label: "MULTIPLE CHOICE", icon: <LayoutList className="h-5 w-5" />, color: "text-brand-blue bg-brand-light" },
  { label: "TRUE / FALSE",    icon: <ToggleLeft  className="h-5 w-5" />, color: "text-orange-500 bg-orange-50"  },
  { label: "SHORT ANSWER",    icon: <AlignLeft   className="h-5 w-5" />, color: "text-emerald-600 bg-emerald-50"},
  { label: "CHECKBOX",        icon: <CheckSquare className="h-5 w-5" />, color: "text-purple-500 bg-purple-50"  },
];

// ─── Toast system ─────────────────────────────────────────────────────────────
function ToastContainer({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: string) => void }) {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id}
          className={`flex items-center gap-3 rounded-xl px-4 py-3 shadow-lg text-sm font-medium text-white pointer-events-auto
            ${t.kind === "success" ? "bg-emerald-600" : t.kind === "error" ? "bg-red-500" : "bg-brand-navy"}`}
          style={{ animation: "slideUp .2s ease" }}
        >
          {t.kind === "success" && <CheckCheck   className="h-4 w-4 shrink-0" />}
          {t.kind === "error"   && <AlertCircle  className="h-4 w-4 shrink-0" />}
          {t.kind === "info"    && <Sparkles     className="h-4 w-4 shrink-0" />}
          {t.message}
          <button onClick={() => dismiss(t.id)} className="ml-2 opacity-70 hover:opacity-100">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}

function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((message: string, kind: ToastKind = "success") => {
    const id = uid();
    setToasts(p => [...p, { id, message, kind }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  }, []);
  const dismiss = useCallback((id: string) => setToasts(p => p.filter(t => t.id !== id)), []);
  return { toasts, push, dismiss };
}

// ─── SubjectSelectionScreen ───────────────────────────────────────────────────
function SubjectSelectionScreen({
  onSelect,
}: {
  onSelect: (subject: Subject) => void;
}) {
  const [search, setSearch] = useState("");
  const [hovered, setHovered] = useState<string | null>(null);

  const filtered = subjects.filter(s =>
    s.label.toLowerCase().includes(search.toLowerCase()) ||
    s.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 max-w-215 mx-auto w-full px-6 py-10">
      {/* Header */}
      <div className="mb-10">
        <p className="text-[11px] font-bold uppercase tracking-widest text-brand-blue mb-2">
          Step 1 of 2
        </p>
        <h1 className="text-3xl font-bold text-brand-navy tracking-tight mb-2">
          Choose a Subject or Department
        </h1>
        <p className="text-brand-subtitle text-sm leading-relaxed max-w-lg">
          Select the subject area for your quiz. This sets the department context and helps organise your quiz in the library.
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-7">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-subtitle" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search subjects…"
          className="w-full h-11 pl-11 pr-4 rounded-xl border border-border bg-white text-sm text-slate-700 placeholder:text-brand-subtitle focus:outline-none focus:ring-2 focus:ring-brand-blue transition-shadow"
        />
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white py-16 text-center">
          <p className="text-sm font-medium text-brand-subtitle">No subjects match &ldquo;{search}&rdquo;</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {filtered.map(subject => (
            <button
              key={subject.id}
              onClick={() => onSelect(subject)}
              onMouseEnter={() => setHovered(subject.id)}
              onMouseLeave={() => setHovered(null)}
              className={`relative flex flex-col items-center rounded-2xl border-2 bg-white p-5 transition-all duration-200 group
                ${hovered === subject.id ? subject.accent.split(" ")[1] + " shadow-md scale-[1.03]" : "border-border"}
                focus:outline-none focus:ring-2 focus:ring-brand-blue`}
            >
              {/* Icon tile */}
              <div className={`w-full aspect-square rounded-xl ${subject.bg} flex items-center justify-center mb-4 transition-transform duration-200 ${hovered === subject.id ? "scale-105" : ""}`}>
                <span className={subject.iconColor}>{subject.icon}</span>
              </div>

              {/* Label */}
              <p className={`text-sm font-bold text-center transition-colors ${hovered === subject.id ? "text-brand-navy" : "text-slate-600"}`}>
                {subject.label}
              </p>

              {/* Hover arrow */}
              <div className={`absolute top-3 right-3 transition-all duration-200 ${hovered === subject.id ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-1"}`}>
                <ChevronRight className="h-4 w-4 text-brand-blue" />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Footer hint */}
      <p className="text-center text-xs text-slate-300 mt-10">
        {subjects.length} subjects available · You can change this later in Quiz Settings
      </p>
    </div>
  );
}

// ─── QuizStatsPanel ───────────────────────────────────────────────────────────
function QuizStatsPanel({ questions, onGenerate, timeLimit }: {
  questions: Question[];
  onGenerate: () => void;
  timeLimit: number;
}) {
  const totalPoints   = questions.reduce((a, q) => a + q.points, 0);
  const estimatedMins = Math.ceil(questions.length * 1.5);
  const mcCount       = questions.filter(q => q.type === "MULTIPLE CHOICE").length;
  const tfCount       = questions.filter(q => q.type === "TRUE / FALSE").length;
  const saCount       = questions.filter(q => q.type === "SHORT ANSWER").length;
  const cbCount       = questions.filter(q => q.type === "CHECKBOX").length;
  const total         = questions.length || 1;

  const { label: diffLabel, cls: diffCls } = getDifficulty(estimatedMins, timeLimit);

  return (
    <div className="flex flex-col gap-4 sticky top-20">
      {/* Summary */}
      <div className="rounded-2xl border border-border bg-white p-5">
        <p className="text-[11px] font-bold uppercase tracking-widest text-brand-subtitle mb-4">Quiz Summary</p>
        <div className="space-y-3">
          {[
            { label: "Total Questions", value: String(questions.length), icon: <List   className="h-4 w-4 text-brand-blue"  /> },
            { label: "Total Points",    value: String(totalPoints),      icon: <Star   className="h-4 w-4 text-amber-500"  /> },
            { label: "Est. Duration",   value: `${estimatedMins} min`,   icon: <Clock  className="h-4 w-4 text-emerald-500"/> },
            { label: "Difficulty",      value: diffLabel,                icon: <Target className="h-4 w-4 text-orange-500" />, valueClass: diffCls },
          ].map(({ label, value, icon, valueClass }) => (
            <div key={label} className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-brand-subtitle">{icon}{label}</div>
              <span className={`text-xs font-bold ${valueClass ?? "text-brand-navy"}`}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* AI Suggestions */}
      <div className="rounded-2xl border border-border bg-linear-to-br from-brand-navy to-brand-blue p-5 text-white relative overflow-hidden">
        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/5 pointer-events-none" />
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-blue-200" />
          <p className="text-xs font-bold uppercase tracking-wider text-blue-200">AI Suggestions</p>
        </div>
        <p className="text-sm text-blue-100 leading-relaxed mb-4">
          Add 2 more questions on Cell Membrane Transport to cover the full chapter.
        </p>
        <Button size="sm" onClick={onGenerate}
          className="w-full bg-white/15 hover:bg-white/25 text-white border border-white/20 text-xs font-semibold rounded-xl h-8 transition-colors">
          <Sparkles className="h-3.5 w-3.5 mr-1.5" />Generate Questions
        </Button>
      </div>

      {/* Question type distribution */}
      <div className="rounded-2xl border border-border bg-white p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart2 className="h-4 w-4 text-brand-blue" />
          <p className="text-[11px] font-bold uppercase tracking-widest text-brand-subtitle">Question Types</p>
        </div>
        <div className="space-y-2.5">
          {[
            { label: "Multiple Choice", count: mcCount, color: "bg-brand-navy" },
            { label: "True / False",    count: tfCount, color: "bg-orange-400" },
            { label: "Short Answer",    count: saCount, color: "bg-emerald-400"},
            { label: "Checkbox",        count: cbCount, color: "bg-purple-400" },
          ].map(({ label, count, color }) => (
            <div key={label}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-500 font-medium">{label}</span>
                <span className="text-brand-subtitle">{count}</span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${color}`}
                  style={{ width: `${Math.round((count / total) * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Collaborators */}
      <div className="rounded-2xl border border-border bg-white p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-bold uppercase tracking-widest text-brand-subtitle">Collaborators</p>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Plus className="h-3.5 w-3.5 text-brand-subtitle" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-brand-navy text-white border-none text-xs">Invite collaborator</TooltipContent>
          </Tooltip>
        </div>
        <div className="flex -space-x-2">
          {(["BG", "MT", "SK"] as const).map((initials, i) => (
            <Tooltip key={initials}>
              <TooltipTrigger asChild>
                <Avatar className="h-8 w-8 border-2 border-white cursor-pointer">
                  <AvatarFallback className={`text-[10px] font-bold text-white ${["bg-brand-navy","bg-purple-500","bg-emerald-600"][i]}`}>
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent className="bg-brand-navy text-white border-none text-xs">{initials}</TooltipContent>
            </Tooltip>
          ))}
          <div className="h-8 w-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center">
            <span className="text-[10px] font-bold text-brand-subtitle">+2</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── QuestionCard ─────────────────────────────────────────────────────────────
function QuestionCard({
  question, isFirst, isLast,
  onToggleCorrect, onAddOption, onDeleteOption,
  onUpdateOptionText, onUpdateQuestionText,
  onUpdatePoints, onToggleRequired,
  onDone, onDelete, onDuplicate,
  onMoveUp, onMoveDown, onCollapse, onChangeType,
}: {
  question: Question; isFirst: boolean; isLast: boolean;
  onToggleCorrect:     (qId: string, oId: string) => void;
  onAddOption:         (qId: string) => void;
  onDeleteOption:      (qId: string, oId: string) => void;
  onUpdateOptionText:  (qId: string, oId: string, text: string) => void;
  onUpdateQuestionText:(qId: string, text: string) => void;
  onUpdatePoints:      (qId: string, pts: number) => void;
  onToggleRequired:    (qId: string) => void;
  onDone:              (qId: string) => void;
  onDelete:            (qId: string) => void;
  onDuplicate:         (qId: string) => void;
  onMoveUp:            (qId: string) => void;
  onMoveDown:          (qId: string) => void;
  onCollapse:          (qId: string) => void;
  onChangeType:        (qId: string, type: QuestionType) => void;
}) {
  const isShortAnswer = question.type === "SHORT ANSWER";

  return (
    <div className={`rounded-2xl border-2 bg-white transition-colors ${question.collapsed ? "border-border" : "border-brand-blue"}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-5 pb-3">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-widest text-brand-blue mb-1">
            Question {String(question.number).padStart(2, "0")}
          </p>
          {question.collapsed ? (
            <p className="text-sm font-semibold text-brand-navy truncate">{question.text || "Untitled question"}</p>
          ) : (
            <Input value={question.text}
              onChange={e => onUpdateQuestionText(question.id, e.target.value)}
              placeholder="Type your question here…"
              className="h-9 text-sm font-semibold border-border focus-visible:ring-brand-blue rounded-xl" />
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-4">
          <Select value={question.type} onValueChange={v => onChangeType(question.id, v as QuestionType)}>
            <SelectTrigger className="h-7 text-[11px] font-bold border-0 bg-brand-navy text-white rounded-full px-3 focus:ring-0 w-auto gap-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {qTypes.map(t => <SelectItem key={t.label} value={t.label} className="text-xs">{t.label}</SelectItem>)}
            </SelectContent>
          </Select>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-300 hover:text-slate-500"
                disabled={isFirst} onClick={() => onMoveUp(question.id)}>
                <ChevronUp className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-brand-navy text-white border-none text-xs">Move up</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-300 hover:text-slate-500"
                disabled={isLast} onClick={() => onMoveDown(question.id)}>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-brand-navy text-white border-none text-xs">Move down</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="default" size="icon" className="h-7 w-7 bg-slate-100 text-brand-navy hover:text-slate-500"
                onClick={() => onCollapse(question.id)}>
                {question.collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-brand-navy text-white border-none text-xs">
              {question.collapsed ? "Expand" : "Collapse"}
            </TooltipContent>
          </Tooltip>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-brand-subtitle">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="gap-2" onClick={() => onDuplicate(question.id)}>
                <Copy className="h-3.5 w-3.5" /> Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 text-red-500" onClick={() => onDelete(question.id)}>
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Expanded body */}
      {!question.collapsed && (
        <div className="px-6 pb-6">
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
            <input type="number" min={1} max={100} value={question.points}
              onChange={e => onUpdatePoints(question.id, Math.max(1, parseInt(e.target.value) || 1))}
              className="w-14 text-xs font-bold text-brand-navy border border-border rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-blue" />
            <span className="text-xs text-brand-subtitle">Points</span>
          </div>

          {isShortAnswer ? (
            <div className="rounded-xl border border-dashed border-border bg-slate-50 p-5 text-center text-sm text-brand-subtitle mb-4">
              Students will type a free-text answer. No options needed.
            </div>
          ) : (
            <div className="space-y-2.5 mb-4">
              {question.options.map(opt => (
                <div key={opt.id} className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 transition-all
                  ${opt.correct ? "border-brand-blue bg-brand-light" : "border-border bg-white hover:border-slate-300"}`}>
                  <GripVertical className="h-4 w-4 text-slate-200 shrink-0 cursor-grab" />
                  <button onClick={() => onToggleCorrect(question.id, opt.id)} className="shrink-0">
                    {opt.correct
                      ? <CheckCircle2 className="h-4 w-4 text-brand-blue" />
                      : <Circle       className="h-4 w-4 text-slate-300"  />}
                  </button>
                  <input value={opt.text}
                    onChange={e => onUpdateOptionText(question.id, opt.id, e.target.value)}
                    className="flex-1 text-sm bg-transparent border-none outline-none font-medium text-slate-700 placeholder:text-slate-300"
                    placeholder="Option text…" />
                  {opt.correct && (
                    <Badge className="bg-brand-navy text-white border-0 text-[10px] font-bold px-2 py-0.5 shrink-0">✓</Badge>
                  )}
                  {question.options.length > 1 && (
                    <button onClick={() => onDeleteOption(question.id, opt.id)}
                      className="shrink-0 text-slate-200 hover:text-red-400 transition-colors">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            {!isShortAnswer ? (
              <button onClick={() => onAddOption(question.id)}
                className="flex items-center gap-1.5 text-xs font-semibold text-brand-blue hover:opacity-80 transition-opacity">
                <Plus className="h-3.5 w-3.5" /> Add Option
              </button>
            ) : <span />}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-brand-subtitle">Required</span>
                <Switch checked={question.required} onCheckedChange={() => onToggleRequired(question.id)}
                  className="data-[state=checked]:bg-brand-navy" />
              </div>
              <Button size="sm" onClick={() => onDone(question.id)}
                className="bg-brand-navy hover:bg-brand-blue text-white font-semibold text-xs h-8 px-5 rounded-lg transition-colors">
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Dialogs ──────────────────────────────────────────────────────────────────
function ClearAllDialog({ open, onConfirm, onCancel }: { open: boolean; onConfirm: () => void; onCancel: () => void }) {
  return (
    <Dialog open={open} onOpenChange={v => !v && onCancel()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Clear all questions?</DialogTitle>
          <DialogDescription>This will permanently delete all questions. This cannot be undone.</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button className="bg-red-500 hover:bg-red-600 text-white" onClick={onConfirm}>Yes, clear all</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PublishDialog({ open, onConfirm, onCancel, title }: { open: boolean; onConfirm: () => void; onCancel: () => void; title: string }) {
  return (
    <Dialog open={open} onOpenChange={v => !v && onCancel()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Publish &ldquo;{title || "Untitled Quiz"}&rdquo;?</DialogTitle>
          <DialogDescription>
            Once published, students with the join code can access this quiz. You can still edit it afterwards.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button className="bg-brand-navy hover:bg-brand-blue text-white" onClick={onConfirm}>Publish</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function QuizBuilderPage() {
  const [step,           setStep]           = useState<AppStep>("subject");
  const [selectedSubject,setSelectedSubject]= useState<Subject | null>(null);

  // Quiz settings
  const [title,       setTitle]       = useState("");
  const [description, setDescription] = useState("");
  const [timeLimit,   setTimeLimit]   = useState(45);
  const [grading,     setGrading]     = useState("standard");
  const [coverImage,  setCoverImage]  = useState<string | null>(null);

  // Questions
  const [questions, setQuestions] = useState<Question[]>([]);

  // Dialogs
  const [showClearDialog,   setShowClearDialog]   = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);

  const { toasts, push, dismiss } = useToasts();
  const coverRef = useRef<HTMLInputElement>(null);

  // ── Subject selection ──────────────────────────────────────────────────────
  const handleSelectSubject = (subject: Subject) => {
    setSelectedSubject(subject);
    setStep("builder");
    push(`${subject.label} department selected`, "info");
  };

  // ── Quiz settings ──────────────────────────────────────────────────────────
  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverImage(URL.createObjectURL(file));
    push("Cover image uploaded");
  };

  const handleSaveDraft = () => {
    if (!title.trim()) { push("Please add a quiz title before saving.", "error"); return; }
    push("Draft saved successfully!");
  };

  const handlePublishClick = () => {
    if (!title.trim())          { push("Quiz title is required to publish.", "error"); return; }
    if (questions.length === 0) { push("Add at least one question to publish.", "error"); return; }
    const noAnswer = questions.find(q => q.type !== "SHORT ANSWER" && !q.options.some(o => o.correct));
    if (noAnswer) { push(`Question ${noAnswer.number} has no correct answer marked.`, "error"); return; }
    setShowPublishDialog(true);
  };

  const handlePublishConfirm = () => {
    setShowPublishDialog(false);
    push("Quiz published! Share the join code with your students.", "success");
  };

  // ── Question handlers ──────────────────────────────────────────────────────
  const handleCreateQuestion = (type: QuestionType) => {
    setQuestions(prev => renumber([...prev, {
      id: uid(), number: 0, text: "", type, points: 5, required: true, collapsed: false,
      options: defaultOptions(type),
    }]));
    push(`${type.charAt(0) + type.slice(1).toLowerCase()} question added`, "info");
  };

  const handleDeleteQuestion = (qId: string) => {
    setQuestions(prev => renumber(prev.filter(q => q.id !== qId)));
    push("Question deleted");
  };

  const handleDuplicateQuestion = (qId: string) => {
    setQuestions(prev => {
      const idx = prev.findIndex(q => q.id === qId);
      if (idx === -1) return prev;
      const copy: Question = { ...prev[idx], id: uid(), options: prev[idx].options.map(o => ({ ...o, id: uid() })), collapsed: false };
      return renumber([...prev.slice(0, idx + 1), copy, ...prev.slice(idx + 1)]);
    });
    push("Question duplicated");
  };

  const handleMoveUp = (qId: string) =>
    setQuestions(prev => {
      const idx = prev.findIndex(q => q.id === qId);
      if (idx <= 0) return prev;
      const next = [...prev]; [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return renumber(next);
    });

  const handleMoveDown = (qId: string) =>
    setQuestions(prev => {
      const idx = prev.findIndex(q => q.id === qId);
      if (idx === -1 || idx >= prev.length - 1) return prev;
      const next = [...prev]; [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return renumber(next);
    });

  const handleCollapse  = (qId: string) => setQuestions(prev => prev.map(q => q.id === qId ? { ...q, collapsed: !q.collapsed } : q));
  const handleDone      = (qId: string) => setQuestions(prev => prev.map(q => q.id === qId ? { ...q, collapsed: true }  : q));
  const handleToggleAll = () => setQuestions(prev => {
    const hasOpen = prev.some(q => !q.collapsed);
    return prev.map(q => ({ ...q, collapsed: hasOpen }));
  });
  const handleClearAll  = () => { setQuestions([]); setShowClearDialog(false); push("All questions cleared"); };

  const handleToggleCorrect    = (qId: string, oId: string) =>
    setQuestions(prev => prev.map(q => q.id !== qId ? q : {
      ...q, options: q.options.map(o =>
        q.type === "MULTIPLE CHOICE" ? { ...o, correct: o.id === oId } : { ...o, correct: o.id === oId ? !o.correct : o.correct }
      ),
    }));

  const handleAddOption        = (qId: string) => setQuestions(prev => prev.map(q => q.id !== qId ? q : { ...q, options: [...q.options, { id: uid(), text: "", correct: false }] }));
  const handleDeleteOption     = (qId: string, oId: string) => setQuestions(prev => prev.map(q => q.id !== qId ? q : { ...q, options: q.options.filter(o => o.id !== oId) }));
  const handleUpdateOptionText = (qId: string, oId: string, text: string) => setQuestions(prev => prev.map(q => q.id !== qId ? q : { ...q, options: q.options.map(o => o.id === oId ? { ...o, text } : o) }));
  const handleUpdateQuestionText = (qId: string, text: string) => setQuestions(prev => prev.map(q => q.id === qId ? { ...q, text } : q));
  const handleUpdatePoints     = (qId: string, pts: number)    => setQuestions(prev => prev.map(q => q.id === qId ? { ...q, points: pts } : q));
  const handleToggleRequired   = (qId: string)                 => setQuestions(prev => prev.map(q => q.id === qId ? { ...q, required: !q.required } : q));
  const handleChangeType       = (qId: string, type: QuestionType) => setQuestions(prev => prev.map(q => q.id !== qId ? q : { ...q, type, options: defaultOptions(type) }));

  const handleGenerate = () => {
    setQuestions(prev => renumber([...prev,
      {
        id: uid(), number: 0, text: "What is the primary function of the cell membrane?",
        type: "MULTIPLE CHOICE", points: 5, required: true, collapsed: false,
        options: [
          { id: uid(), text: "Producing energy",              correct: false },
          { id: uid(), text: "Controlling what enters/exits", correct: true  },
          { id: uid(), text: "Storing genetic information",   correct: false },
          { id: uid(), text: "Synthesising proteins",         correct: false },
        ],
      },
      {
        id: uid(), number: 0, text: "Cell membrane transport requires energy in all cases.",
        type: "TRUE / FALSE", points: 5, required: true, collapsed: false,
        options: [
          { id: uid(), text: "True",  correct: false },
          { id: uid(), text: "False", correct: true  },
        ],
      },
    ]));
    push("2 AI questions added on Cell Membrane Transport!", "info");
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-surface flex flex-col">
        <TopBar
          onSaveDraft={handleSaveDraft}
          onPublish={handlePublishClick}
          showActions={step === "builder"}
        />

        {/* ── Step indicator strip (Now shown on both screens) ── */}
        <div className="border-b border-border bg-white">
          <div className="max-w-215 px-8 py-3 flex items-center gap-3">
            {[
              { n: 1, label: "Choose Subject", active: true },
              { n: 2, label: "Build Quiz",     active: step === "builder" },
            ].map((s, i) => (
              <div key={s.n} className="flex items-center gap-2">
                {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-slate-300" />}
                <div className={`flex items-center gap-2 text-xs font-semibold ${s.active ? "text-brand-navy" : "text-slate-300"}`}>
                  <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold
                    ${s.active ? "bg-brand-navy text-white" : "bg-slate-100 text-brand-subtitle"}`}>
                    {s.n}
                  </span>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Subject selection ── */}
        {step === "subject" && (
          <SubjectSelectionScreen onSelect={handleSelectSubject} />
        )}

        {/* ── Builder ── */}
        {step === "builder" && selectedSubject && (
          <div className="flex-1 max-w-300 mx-auto w-full px-6 py-6 grid grid-cols-[1fr_300px] gap-6 items-start">
            <div className="space-y-6">
              {/* Breadcrumb + back */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <button onClick={() => setStep("subject")}
                      className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-brand-subtitle hover:text-brand-blue transition-colors">
                      <ArrowLeft className="h-3 w-3" /> Change subject
                    </button>
                    <span className="text-slate-300 text-xs">/</span>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-brand-blue">
                      {selectedSubject.department}
                    </span>
                  </div>
                  <h1 className="text-3xl font-bold text-brand-navy tracking-tight">
                    New {selectedSubject.label} Assessment
                  </h1>
                </div>
                {/* Subject chip */}
                <div className={`flex items-center gap-2.5 rounded-xl border border-border px-3 py-2 ${selectedSubject.bg} shrink-0`}>
                  <span className={selectedSubject.iconColor}>
                    {/* render a smaller copy of the icon */}
                    <span className="[&>svg]:h-4 [&>svg]:w-4">{selectedSubject.icon}</span>
                  </span>
                  <span className={`text-xs font-bold ${selectedSubject.iconColor}`}>{selectedSubject.label}</span>
                </div>
              </div>

              {/* Quiz Settings */}
              <div className="rounded-2xl border border-border bg-white p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Settings className="h-5 w-5 text-brand-blue" />
                  <h2 className="text-lg font-bold text-brand-navy">Quiz Settings</h2>
                </div>
                <div className="grid grid-cols-[1fr_220px] gap-5">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-brand-subtitle uppercase tracking-wider">Quiz Title</Label>
                      <Input value={title} onChange={e => setTitle(e.target.value)}
                        placeholder="Enter quiz title"
                        className="h-10 text-sm border-border focus-visible:ring-brand-blue rounded-xl" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-brand-subtitle uppercase tracking-wider">Description</Label>
                      <Textarea value={description} onChange={e => setDescription(e.target.value)}
                        placeholder="Describe what this quiz covers…"
                        rows={4} className="text-sm border-border focus-visible:ring-brand-blue rounded-xl resize-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-brand-subtitle uppercase tracking-wider">Time Limit (mins)</Label>
                        <div className="flex items-center gap-2 h-10 border border-border rounded-xl px-3 bg-white">
                          <Clock className="h-3.5 w-3.5 text-brand-subtitle shrink-0" />
                          <input type="number" min={1} max={300} value={timeLimit}
                            onChange={e => setTimeLimit(Math.max(1, parseInt(e.target.value) || 1))}
                            className="flex-1 text-sm border-0 p-0 bg-transparent focus:outline-none" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-brand-subtitle uppercase tracking-wider">Grading</Label>
                        <Select value={grading} onValueChange={setGrading}>
                          <SelectTrigger className="h-10 text-sm border-border rounded-xl focus:ring-brand-blue">
                            <div className="flex items-center gap-2">
                              <Star className="h-3.5 w-3.5 text-brand-subtitle" />
                              <SelectValue />
                            </div>
                          </SelectTrigger>
                          <SelectContent position="popper">
                            <SelectItem value="standard">Standard</SelectItem>
                            <SelectItem value="weighted">Weighted</SelectItem>
                            <SelectItem value="pass-fail">Pass / Fail</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Cover image */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-brand-subtitle uppercase tracking-wider">Cover Image</Label>
                    <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
                    <div onClick={() => coverRef.current?.click()}
                      className="h-42.5 rounded-xl border-2 border-dashed border-border bg-slate-50 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-100 transition-colors overflow-hidden relative">
                      {coverImage ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={coverImage} alt="cover" className="absolute inset-0 w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <span className="text-white text-xs font-semibold flex items-center gap-1.5">
                              <Upload className="h-3.5 w-3.5" /> Change image
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="h-10 w-10 rounded-xl bg-brand-light flex items-center justify-center">
                            <Plus className="h-5 w-5 text-brand-blue" />
                          </div>
                          <p className="text-xs text-brand-subtitle font-medium text-center px-4">Click to upload cover image</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Question Builder */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Plus className="h-5 w-5 text-brand-blue" />
                    <h2 className="text-lg font-bold text-brand-navy">Question Builder</h2>
                    <Badge className="bg-brand-light text-brand-blue border-0 text-xs font-bold px-2.5 py-0.5 rounded-full">
                      {questions.length}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" className="h-8 w-8 border-border rounded-lg" onClick={handleToggleAll}>
                          <List className="h-4 w-4 text-brand-subtitle" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-brand-navy text-white border-none text-xs">Toggle all</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" className="h-8 w-8 border-border rounded-lg"
                          onClick={() => questions.length > 0 && setShowClearDialog(true)}>
                          <Trash2 className="h-4 w-4 text-brand-subtitle" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-brand-navy text-white border-none text-xs">Clear all</TooltipContent>
                    </Tooltip>
                    <Button size="sm" onClick={() => handleCreateQuestion("MULTIPLE CHOICE")}
                      className="bg-brand-navy hover:bg-brand-blue text-white font-semibold text-xs h-8 px-4 rounded-xl gap-1.5 transition-colors">
                      <Plus className="h-3.5 w-3.5" /> Create Question
                    </Button>
                  </div>
                </div>

                {questions.length === 0 && (
                  <div className="rounded-2xl border-2 border-dashed border-border bg-white p-12 flex flex-col items-center gap-3 text-center">
                    <div className="h-12 w-12 rounded-xl bg-brand-light flex items-center justify-center">
                      <LayoutList className="h-6 w-6 text-brand-blue" />
                    </div>
                    <p className="text-sm font-semibold text-brand-navy">No questions yet</p>
                    <p className="text-xs text-brand-subtitle">Click &ldquo;Create Question&rdquo; or pick a type below to get started.</p>
                  </div>
                )}

                <div className="space-y-4">
                  {questions.map((q, idx) => (
                    <QuestionCard key={q.id} question={q}
                      isFirst={idx === 0} isLast={idx === questions.length - 1}
                      onToggleCorrect={handleToggleCorrect}
                      onAddOption={handleAddOption}
                      onDeleteOption={handleDeleteOption}
                      onUpdateOptionText={handleUpdateOptionText}
                      onUpdateQuestionText={handleUpdateQuestionText}
                      onUpdatePoints={handleUpdatePoints}
                      onToggleRequired={handleToggleRequired}
                      onDone={handleDone}
                      onDelete={handleDeleteQuestion}
                      onDuplicate={handleDuplicateQuestion}
                      onMoveUp={handleMoveUp}
                      onMoveDown={handleMoveDown}
                      onCollapse={handleCollapse}
                      onChangeType={handleChangeType}
                    />
                  ))}
                </div>
              </div>

              {/* Question type picker */}
              <div className="rounded-2xl border border-border bg-white p-4">
                <p className="text-[11px] font-bold uppercase tracking-widest text-brand-subtitle mb-3 px-1">
                  Add Question Type
                </p>
                <div className="grid grid-cols-4 gap-3">
                  {qTypes.map(({ label, icon, color }) => (
                    <button key={label} onClick={() => handleCreateQuestion(label)}
                      className="flex flex-col items-center gap-2.5 rounded-xl border border-border p-4 hover:border-brand-blue hover:bg-brand-light transition-all group">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-brand-navy text-center leading-tight">
                        {label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right panel */}
            <QuizStatsPanel questions={questions} onGenerate={handleGenerate} timeLimit={timeLimit} />
          </div>
        )}

        {/* Dialogs */}
        <ClearAllDialog open={showClearDialog} onConfirm={handleClearAll} onCancel={() => setShowClearDialog(false)} />
        <PublishDialog  open={showPublishDialog} title={title} onConfirm={handlePublishConfirm} onCancel={() => setShowPublishDialog(false)} />

        {/* Toasts */}
        <ToastContainer toasts={toasts} dismiss={dismiss} />
      </div>
    </TooltipProvider>
  );
}