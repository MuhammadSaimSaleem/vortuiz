"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "@/lib/toast";
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
  CheckCircle2,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Circle,
  Clock,
  Copy,
  GripVertical,
  LayoutList,
  List,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Sparkles,
  Star,
  Target,
  ToggleLeft,
  Trash2,
  Upload,
  X,
  CircleCheckBig,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useProfile } from "@/contexts/ProfileContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Quiz, Subject } from "@/lib/data";
import { useQuery } from "@tanstack/react-query";

// ─── Types ────────────────────────────────────────────────────────────────────
type QuestionType = "MULTIPLE CHOICE" | "TRUE / FALSE" | "SHORT ANSWER";

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
  marks: number;
  required: boolean;
  collapsed: boolean;
  options: Option[];
}

// ─── icon_name → Lucide icon map ─────────────────────────────────────────────
function SubjectIcon({ icon_name, className }: { icon_name: string | null; className?: string }) {
  // We keep a small runtime map to avoid importing every icon
  const icons: Record<string, React.ReactNode> = {
    "bar-chart":   <BarChart2    className={className ?? "h-6 w-6"} />,
    "check-square":<CheckSquare  className={className ?? "h-6 w-6"} />,
    "align-left":  <AlignLeft    className={className ?? "h-6 w-6"} />,
    "list":        <List          className={className ?? "h-6 w-6"} />,
    "star":        <Star          className={className ?? "h-6 w-6"} />,
    "target":      <Target        className={className ?? "h-6 w-6"} />,
    "sparkles":    <Sparkles      className={className ?? "h-6 w-6"} />,
    "settings":    <Settings      className={className ?? "h-6 w-6"} />,
    "search":      <Search        className={className ?? "h-6 w-6"} />,
    "clock":       <Clock         className={className ?? "h-6 w-6"} />,
  };
  return <>{icons[icon_name ?? ""] ?? <LayoutList className={className ?? "h-6 w-6"} />}</>;
}

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
  if (usage === 0 || usage <= 40) 
    return { label: "Easy", cls: "text-emerald-500" };
  if (usage <= 70) 
    return { label: "Intermediate", cls: "text-orange-500" };
  if (usage <= 100) 
    return { label: "Hard", cls: "text-red-500"    };
  else
    return { label: "Impossible", cls: "text-purple-600" };
}

const COLOR_THEME_MAP: Record<string, { bg: string; iconColor: string; accent: string }> = {
  slate:   { bg: "bg-slate-100",   iconColor: "text-slate-600",   accent: "border-slate-400 bg-slate-50"   },
  blue:    { bg: "bg-blue-100",    iconColor: "text-blue-600",    accent: "border-blue-400 bg-blue-50"     },
  indigo:  { bg: "bg-indigo-100",  iconColor: "text-indigo-600",  accent: "border-indigo-400 bg-indigo-50" },
  purple:  { bg: "bg-purple-100",  iconColor: "text-purple-600",  accent: "border-purple-400 bg-purple-50" },
  pink:    { bg: "bg-pink-100",    iconColor: "text-pink-600",    accent: "border-pink-400 bg-pink-50"     },
  rose:    { bg: "bg-rose-100",    iconColor: "text-rose-600",    accent: "border-rose-400 bg-rose-50"     },
  orange:  { bg: "bg-orange-100",  iconColor: "text-orange-600",  accent: "border-orange-400 bg-orange-50" },
  amber:   { bg: "bg-amber-100",   iconColor: "text-amber-600",   accent: "border-amber-400 bg-amber-50"   },
  yellow:  { bg: "bg-yellow-100",  iconColor: "text-yellow-600",  accent: "border-yellow-400 bg-yellow-50" },
  lime:    { bg: "bg-lime-100",    iconColor: "text-lime-600",    accent: "border-lime-400 bg-lime-50"     },
  green:   { bg: "bg-green-100",   iconColor: "text-green-600",   accent: "border-green-400 bg-green-50"   },
  emerald: { bg: "bg-emerald-100", iconColor: "text-emerald-600", accent: "border-emerald-400 bg-emerald-50"},
  teal:    { bg: "bg-teal-100",    iconColor: "text-teal-600",    accent: "border-teal-400 bg-teal-50"     },
  cyan:    { bg: "bg-cyan-100",    iconColor: "text-cyan-600",    accent: "border-cyan-400 bg-cyan-50"     },
  sky:     { bg: "bg-sky-100",     iconColor: "text-sky-600",     accent: "border-sky-400 bg-sky-50"       },
  red:     { bg: "bg-red-100",     iconColor: "text-red-600",     accent: "border-red-400 bg-red-50"       },
};

function getTheme(color_theme: string | null) {
  return COLOR_THEME_MAP[color_theme ?? "slate"] ?? COLOR_THEME_MAP["slate"];
}

// ─── qTypes config ────────────────────────────────────────────────────────────
const qTypes: { label: QuestionType; icon: React.ReactNode; color: string }[] = [
  { label: "MULTIPLE CHOICE", icon: <LayoutList className="h-5 w-5" />, color: "text-brand-blue bg-brand-light" },
  { label: "TRUE / FALSE",    icon: <ToggleLeft  className="h-5 w-5" />, color: "text-orange-500 bg-orange-50"  },
  { label: "SHORT ANSWER",    icon: <AlignLeft   className="h-5 w-5" />, color: "text-emerald-600 bg-emerald-50"},
];

// ─── SubjectSelectionScreen ───────────────────────────────────────────────────
function SubjectSelectionScreen({
  onSelect, subjectsData, search, onSearchChange, isLoading, profileReady
}: {
  onSelect: (subject: Subject) => void;
  subjectsData: Subject[];
  search: string;
  onSearchChange: (v: string) => void;
  isLoading: boolean;
  profileReady: boolean;
}) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="flex-1 max-w-300 mx-auto w-full px-6 py-10">
      {/* Header */}
      <div className="mb-10">
        <p className="text-[11px] font-bold uppercase tracking-widest text-brand-blue mb-2">
          Step 1 of 2
        </p>
        <h1 className="text-3xl font-bold text-brand-navy tracking-tight mb-2">
          Choose a Subject
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
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Search subjects…"
          className="w-full h-11 pl-11 pr-4 rounded-xl border border-border bg-white text-sm text-slate-700 placeholder:text-brand-subtitle focus:outline-none focus:ring-2 focus:ring-brand-blue transition-shadow"
        />
      </div>

      {/* Conditional Content: Loading vs Empty vs Grid Data */}
      {(!profileReady || isLoading) ? (
        /* Subject Grid Skeleton */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="flex flex-col items-center rounded-2xl border-2 border-slate-100 bg-white p-5"
            >
              <Skeleton className="w-full aspect-square rounded-xl mb-4" />
              <Skeleton className="h-4 w-[70%] mb-2" />
              <Skeleton className="h-3 w-[40%]" />
            </div>
          ))}
        </div>
      ) : subjectsData.length === 0 ? (
        /* Empty State */
        <div className="rounded-2xl border border-dashed border-border bg-white py-16 text-center">
          <p className="text-sm font-medium text-brand-subtitle">No subjects match &ldquo;{search}&rdquo;</p>
        </div>
      ) : (
        /* Actual Subject Grid Data */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {subjectsData.map(subject => {
            const { bg, iconColor, accent } = getTheme(subject.color_theme);
            const isHovered = hovered === subject.id;
            return (
              <button
                key={subject.id}
                onClick={() => onSelect(subject)}
                onMouseEnter={() => setHovered(subject.id)}
                onMouseLeave={() => setHovered(null)}
                className={`relative flex flex-col items-center rounded-2xl border-2 bg-white p-5 transition-all duration-200 group
                  ${isHovered ? accent + " shadow-md scale-[1.03]" : "border-border"}
                  focus:outline-none focus:ring-2 focus:ring-brand-blue`}
              >
                <div className={`w-full aspect-square rounded-xl ${bg} flex items-center justify-center mb-4 transition-transform duration-200 ${isHovered ? "scale-105" : ""}`}>
                  <span className={iconColor}>
                    <SubjectIcon icon_name={subject.icon_name} className="h-6 w-6" />
                  </span>
                </div>
                <p className={`text-sm font-bold text-center transition-colors ${isHovered ? "text-brand-navy" : "text-slate-600"}`}>
                  {subject.name}
                </p>
                <p className="text-[10px] font-mono text-brand-subtitle mt-0.5 uppercase tracking-wider">
                  {subject.code}
                </p>
              </button>
            );
          })}
        </div>
      )}

      {/* Footer hint */}
      <div className="text-center text-xs text-slate-300 mt-10">
        {(!profileReady || isLoading) ? (
          <Skeleton className="h-3 w-70 mx-auto" />
        ) : (
          `${subjectsData?.length ?? 0} subjects available · You can change this later in quiz Settings`
        )}
      </div>
    </div>
  );
}

// ─── QuizStatsPanel ───────────────────────────────────────────────────────────
function QuizStatsPanel({ questions, onGenerate, estimatedMins, timeLimit, totalMarks }: {
  questions: Question[];
  onGenerate: () => void;
  estimatedMins: number;
  timeLimit: number;
  totalMarks: number;
}) {
  const mcCount       = questions.filter(q => q.type === "MULTIPLE CHOICE").length;
  const tfCount       = questions.filter(q => q.type === "TRUE / FALSE").length;
  const saCount       = questions.filter(q => q.type === "SHORT ANSWER").length;
  const total         = questions.length || 1;

  const { label: diffLabel, cls: diffCls } = getDifficulty(estimatedMins, timeLimit);

  return (
    <div className="flex flex-col gap-4 sticky top-20">
      {/* Summary */}
      <div className="rounded-2xl border border-border bg-white p-5">
        <p className="text-[11px] font-bold uppercase tracking-widest text-brand-subtitle mb-4">quiz Summary</p>
        <div className="space-y-3">
          {[
            { label: "Total Questions", value: String(questions.length), icon: <List   className="h-4 w-4 text-brand-blue"  /> },
            { label: "Total Marks",    value: String(totalMarks),      icon: <Star   className="h-4 w-4 text-amber-500"  /> },
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
  onUpdateMarks, onToggleRequired,
  onDone, onDelete, onDuplicate,
  onMoveUp, onMoveDown, onCollapse, onChangeType,
}: {
  question: Question; isFirst: boolean; isLast: boolean;
  onToggleCorrect:     (qId: string, oId: string) => void;
  onAddOption:         (qId: string) => void;
  onDeleteOption:      (qId: string, oId: string) => void;
  onUpdateOptionText:  (qId: string, oId: string, text: string) => void;
  onUpdateQuestionText:(qId: string, text: string) => void;
  onUpdateMarks:      (qId: string, pts: number) => void;
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
      <div className="flex flex-col w-full items-start justify-between px-6 pt-5 pb-3">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-widest text-brand-blue mb-1">
            Question {String(question.number).padStart(2, "0")}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full">
          <div className="flex-1 min-w-0">
            {question.collapsed ? (
              <p className="text-sm font-semibold text-brand-navy truncate">{question.text || "Untitled question"}</p>
            ) : (
              <Input value={question.text}
                onChange={e => onUpdateQuestionText(question.id, e.target.value)}
                placeholder="Type your question here…"
                className="h-9 text-sm font-semibold border-border focus-visible:ring-brand-blue rounded-xl" />
            )}
          </div>
          <div className="flex items-center shrink-0">
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
                <Button variant="ghost" size="icon" className="h-7 w-7 ml-2 text-slate-700 hover:text-slate-900"
                  disabled={isFirst} onClick={() => onMoveUp(question.id)}>
                  <ChevronUp className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-brand-navy text-white border-none text-xs">Move up</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 mr-2 text-slate-700 hover:text-slate-900"
                  disabled={isLast} onClick={() => onMoveDown(question.id)}>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-brand-navy text-white border-none text-xs">Move down</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="default" size="icon" className="h-7 w-7 bg-slate-100 text-brand-navy hover:text-white"
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
      </div>

      {/* Expanded body */}
      {!question.collapsed && (
        <div className="px-6 pb-6">
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
            <input type="number" min={1} max={100} value={question.marks}
              onChange={e => onUpdateMarks(question.id, Math.max(1, parseInt(e.target.value) || 1))}
              className="w-14 text-xs font-bold text-brand-navy border border-border rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-blue" />
            <span className="text-xs text-brand-subtitle">Marks</span>
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
          <DialogTitle>Publish &ldquo;{title || "Untitled quiz"}&rdquo;?</DialogTitle>
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
  const { profile } = useProfile();

  const [step, setStep] = useState<"subject" | "builder">("subject");
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  // quiz settings
  const [quiz, setquiz] = useState<Partial<Quiz>>({
    name: "",
    topics: "",
    description: "",
    duration_minutes: 30,
    passing_marks: 0,
    grading_type: "standard",
  });
  const [coverImage,  setCoverImage]  = useState<string | null>(null);

  // Questions
  const [questions, setQuestions] = useState<Question[]>([]);

  // Dialogs
  const [showClearDialog,   setShowClearDialog]   = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const coverRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");

  const estimatedMins = Math.ceil(questions.length * 1.5);
  const totalMarks = questions.reduce((a, q) => a + q.marks, 0);

  const { 
    data: subjectsData = [],
    isLoading,
    error: subjectsError,
  } = useQuery({
    queryKey: ['subjects'], 
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('created_by', profile?.id);

      if (error) {
        throw new Error(error.message);
      }
      return data;
    },

    enabled: !!profile?.id,
    staleTime: 5 * 60 * 1000,
  });

  // 4. Handle your error notification side-effect cleanly
  useEffect(() => {
    if (subjectsError) {
      toast('Unable to load subjects', 'error');
    }
  }, [subjectsError]);

  const filteredSubjects = subjectsData.filter(subject => {
    const query = search.toLowerCase();
    return (
      subject.name?.toLowerCase().includes(query) ||
      subject.code?.toLowerCase().includes(query) ||
      (subject.description ?? "").toLowerCase().includes(query)
    );
  });

  // ── Subject selection ──────────────────────────────────────────────────────
  const handleSelectSubject = (subject: Subject) => {
    setSelectedSubject(subject);
    setStep("builder");
    toast(`${subject.name} selected`, "info");
  };

  // ── quiz settings ──────────────────────────────────────────────────────────
  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverImage(URL.createObjectURL(file));
    toast("Cover image uploaded");
  };

  const handleSaveDraft = () => {
    if (!(quiz.name ?? "").trim()) { toast("Please add a quiz title before saving.", "error"); return; }
    toast("Draft saved successfully!");
  };

  const handlePublishClick = () => {
    if (!(quiz.name ?? "").trim()) { 
      toast("quiz title is required to publish.", "error"); 
      return; }
    if (questions.length === 0) { 
      toast("Add at least one question to publish.", "error"); 
      return; }
    if((quiz.passing_marks ?? 0) <= Math.ceil(totalMarks * 0.2)) {
      toast("Passing marks must be atleast 20% of total marks.", "error")
      return; }

    const noAnswer = questions.find(q => q.type !== "SHORT ANSWER" && !q.options.some((o: Option) => o.correct));

    if (noAnswer) { 
      toast(`Question ${noAnswer.number} has no correct answer marked.`, "error"); 
      return;
    }
    setShowPublishDialog(true);
  };

  const handlePublishConfirm = async () => {
    if (isPublishing) return;
    setIsPublishing(true);
    setShowPublishDialog(false);

    try {
      const topicsArray = (quiz.topics ?? "")
        ? (quiz.topics ?? "").split(",").map(t => t.trim()).filter(Boolean)
        : [];

      const { label } = getDifficulty(estimatedMins, quiz.duration_minutes ?? 30);

      if(profile){
        const insertPayload = {
          creator_id: profile?.id,
          subject_id: selectedSubject?.id,
          name: quiz.name ?? "",
          topics: topicsArray,
          description: quiz?.description ?? "",
          time_limit: quiz?.duration_minutes ?? 30,
          grading_type: quiz?.grading_type ?? "standard",
          question_count: questions.length,
          difficulty: label.toLowerCase(),
          status: 'published',
          total_marks: totalMarks,
          passing_marks: quiz?.passing_marks ?? 0,
        };
      
        const { data: quizInsert, error: quizError } = await supabase
          .from('quizzes')
          .insert(insertPayload)
          .select()
          .single();

        if (quizError) throw new Error(`quiz insert failed: ${quizError.message} (code: ${quizError.code})`);

        const typeMap: Record<QuestionType, string> = {
          "MULTIPLE CHOICE": "multiple-choice",
          "TRUE / FALSE":    "true-false",
          "SHORT ANSWER":    "short-answer",
        };

        const questionsPayload = questions.map((q, i) => ({
          quiz_id:     quizInsert.id,
          question:    q.text,
          type:        typeMap[q.type],
          order_index: i,
          marks:       q.marks,
          options: q.options.map((o: Option) => o.text),
          answer:  q.options.find((o: Option) => o.correct)?.text ?? null,
        }));

        const { error: questionError } = await supabase
          .from('questions')
          .insert(questionsPayload);

        if (questionError) throw new Error(`Questions insert failed: ${questionError.message} (code: ${questionError.code})`);

        toast("quiz published! Share the join code with your students.", "success");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      toast(`Failed to publish: ${message}`, "error");
      console.error("[publish] error:", err);
    } finally {
      setIsPublishing(false);
    }
  };

  // ── Question handlers ──────────────────────────────────────────────────────
  const handleCreateQuestion = (type: QuestionType) => {
    setQuestions(prev => renumber([...prev, {
      id: uid(), number: 0, text: "", type, marks: 5, required: true, collapsed: false,
      options: defaultOptions(type),
    }]));
    toast(`${type.charAt(0) + type.slice(1).toLowerCase()} question added`, "info");
  };

  const handleDeleteQuestion = (qId: string) => {
    setQuestions(prev => renumber(prev.filter(q => q.id !== qId)));
    toast("Question deleted");
  };

  const handleDuplicateQuestion = (qId: string) => {
    setQuestions(prev => {
      const idx = prev.findIndex(q => q.id === qId);
      if (idx === -1) return prev;
      const copy: Question = { ...prev[idx], id: uid(), options: prev[idx].options.map(o => ({ ...o, id: uid() })), collapsed: false };
      return renumber([...prev.slice(0, idx + 1), copy, ...prev.slice(idx + 1)]);
    });
    toast("Question duplicated");
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
  const handleClearAll  = () => { setQuestions([]); setShowClearDialog(false); toast("All questions cleared"); };

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
  const handleUpdateMarks     = (qId: string, pts: number)    => setQuestions(prev => prev.map(q => q.id === qId ? { ...q, marks: pts } : q));
  const handleToggleRequired   = (qId: string)                 => setQuestions(prev => prev.map(q => q.id === qId ? { ...q, required: !q.required } : q));
  const handleChangeType       = (qId: string, type: QuestionType) => setQuestions(prev => prev.map(q => q.id !== qId ? q : { ...q, type, options: defaultOptions(type) }));

  const handleGenerate = () => {
    setQuestions(prev => renumber([...prev,
      {
        id: uid(), number: 0, text: "What is the primary function of the cell membrane?",
        type: "MULTIPLE CHOICE", marks: 5, required: true, collapsed: false,
        options: [
          { id: uid(), text: "Producing energy",              correct: false },
          { id: uid(), text: "Controlling what enters/exits", correct: true  },
          { id: uid(), text: "Storing genetic information",   correct: false },
          { id: uid(), text: "Synthesising proteins",         correct: false },
        ],
      },
      {
        id: uid(), number: 0, text: "Cell membrane transport requires energy in all cases.",
        type: "TRUE / FALSE", marks: 5, required: true, collapsed: false,
        options: [
          { id: uid(), text: "True",  correct: false },
          { id: uid(), text: "False", correct: true  },
        ],
      },
    ]));
    toast("2 AI questions added on Cell Membrane Transport!", "info");
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-surface flex flex-col">
        {/* ── Step indicator strip (Now shown on both screens) ── */}
        <div className="border-b border-border bg-white">
          <div className="w-full px-8 py-3 flex items-center gap-3">
            {[
              { n: 1, label: "Choose Subject", active: true, step: "subject" as const },
              { n: 2, label: "Build quiz",     active: step === "builder", step: "builder" as const },
            ].map((s, i) => (
              <div key={s.n} className="flex items-center gap-2">
                {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-slate-300" />}
                  <button onClick={() => {
                    if(selectedSubject === null){
                      return
                    } else {
                      setStep(s.step)
                    }
                  }} className={`flex items-center gap-2 text-xs font-semibold ${s.active ? "text-brand-navy" : "text-slate-300"}`}>
                    <span className={`size-5 rounded-full flex items-center justify-center text-[10px] font-bold
                      ${s.active ? "bg-brand-navy text-white" : "bg-slate-100 text-brand-subtitle"}`}>
                      {s.n}
                    </span>
                    {s.label}
                  </button>
              </div>
            ))}
            {step === 'builder' ? (
              <div className="flex ml-auto gap-2">
                <Button variant="ghost" size="sm" onClick={handleSaveDraft}
                  className="text-sm font-semibold text-slate-600 h-9 hover:text-brand-navy">
                  Save Draft
                </Button>
                <Button size="sm" onClick={handlePublishClick} disabled={isPublishing}
                  className="bg-brand-navy mr-4 hover:bg-brand-blue text-white font-semibold text-sm h-9 px-5 rounded-xl transition-colors">
                  {isPublishing ? "Publishing…" : "Publish quiz"}
                </Button>
              </div>) : (
              <div className="ml-auto h-9" />
            )}
          </div>
        </div>

        {/* ── Subject selection ── */}
        {step === "subject" && (
            <SubjectSelectionScreen 
              onSelect={handleSelectSubject}
              search={search}
              subjectsData={filteredSubjects}
              onSearchChange={setSearch}
              isLoading={isLoading}
              profileReady={!!profile?.id}
            />
          )
        }

        {/* ── Builder ── */}
        {step === "builder" && selectedSubject && (
          <div className="flex-1 max-w-400 mx-auto w-full px-6 py-6 grid grid-cols-[1fr_300px] gap-6 items-start">
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
                      {selectedSubject.code}
                    </span>
                  </div>
                  <h1 className="text-3xl font-bold text-brand-navy tracking-tight">
                    New {selectedSubject.name} Assessment
                  </h1>
                </div>
                {/* Subject chip */}
                {(() => {
                  const { bg, iconColor } = getTheme(selectedSubject.color_theme);
                  return (
                    <div className={`flex items-center gap-2.5 rounded-xl border border-border px-3 py-2 ${bg} shrink-0`}>
                      <span className={iconColor}>
                        <SubjectIcon icon_name={selectedSubject.icon_name} className="h-4 w-4" />
                      </span>
                      <span className={`text-xs font-bold ${iconColor}`}>{selectedSubject.name}</span>
                    </div>
                  );
                })()}
              </div>

              {/* quiz Settings */}
              <div className="rounded-2xl border border-border bg-white p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Settings className="h-5 w-5 text-brand-blue" />
                  <h2 className="text-lg font-bold text-brand-navy">Quiz Details</h2>
                </div>
                <div className="grid grid-cols-[1fr_220px] gap-5">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-brand-subtitle uppercase tracking-wider">Title</Label>
                      <Input value={quiz.name ?? ""} onChange={e => setquiz({...quiz, name: e.target.value})}
                        placeholder="Enter quiz title"
                        className="h-10 text-sm border-border focus-visible:ring-brand-blue rounded-xl" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-brand-subtitle uppercase tracking-wider">Topics</Label>
                      <Textarea value={quiz.topics ?? ""} onChange={e => setquiz({...quiz, topics: e.target.value})}
                        placeholder="Include the topics this quiz covers e.g ICT, DSA, OOP"
                        rows={4} className="text-sm border-border focus-visible:ring-brand-blue rounded-xl resize-none" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-brand-subtitle uppercase tracking-wider">Description</Label>
                      <Textarea value={quiz?.description ?? ""} onChange={e => setquiz({...quiz, description: e.target.value})}
                        placeholder="Describe what this quiz is about"
                        rows={4} className="text-sm border-border focus-visible:ring-brand-blue rounded-xl resize-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-brand-subtitle uppercase tracking-wider">Time Limit (mins)</Label>
                        <div className="flex items-center gap-2 h-10 border border-border rounded-xl px-3 bg-white">
                          <Clock className="h-3.5 w-3.5 text-brand-subtitle shrink-0" />
                          <input type="number" min={1} max={160} value={quiz?.duration_minutes ?? 30}
                            onChange={e => setquiz({...quiz, duration_minutes: Math.max(1, parseInt(e.target.value) || 1)})}
                            className="flex-1 text-sm border-0 p-0 bg-transparent focus:outline-none" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-brand-subtitle uppercase tracking-wider">Passing Marks</Label>
                        <div className="flex items-center gap-2 h-10 border border-border rounded-xl px-3 bg-white">
                          <CircleCheckBig className="h-3.5 w-3.5 text-brand-subtitle shrink-0" />
                          <input type="number" min={0} max={totalMarks} value={quiz?.passing_marks ?? 0} 
                            onChange={e => {
                              const val = parseInt(e.target.value);
                              if (isNaN(val)) {
                                setquiz({...quiz, passing_marks: 0});
                              } else {
                                const clampedValue = Math.max(0, Math.min(val, totalMarks));
                                setquiz({...quiz, passing_marks: clampedValue});
                              }
                            }}
                            className="flex-1 text-sm border-0 p-0 bg-transparent focus:outline-none" />
                          <span className="text-sm">/</span>
                          <span className="text-sm">{totalMarks}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cover image */}
                  <div className="flex flex-col">
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
                      <p className="text-xs text-brand-subtitle font-medium text-center px-4">*Note: If there&apos;s no cover image, a random cover gradient will be assigned.</p>
                    </div>
                    <div className="space-y-1.5 mt-auto">
                      <Label className="text-xs font-semibold text-brand-subtitle uppercase tracking-wider">Grading</Label>
                      <Select value={quiz?.grading_type ?? "standard"} onValueChange={v => setquiz({...quiz, grading_type: v})}>
                        <SelectTrigger className="h-10 w-full text-sm border-border rounded-xl focus:ring-brand-blue">
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
                      onUpdateMarks={handleUpdateMarks}
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
            <QuizStatsPanel questions={questions} onGenerate={handleGenerate} estimatedMins={estimatedMins} timeLimit={quiz.duration_minutes ?? 30} totalMarks={totalMarks}/>
          </div>
        )}

        {/* Dialogs */}
        <ClearAllDialog open={showClearDialog} onConfirm={handleClearAll} onCancel={() => setShowClearDialog(false)} />
        <PublishDialog  open={showPublishDialog} title={quiz.name ?? "Untitled quiz"} onConfirm={handlePublishConfirm} onCancel={() => setShowPublishDialog(false)} />

      </div>
    </TooltipProvider>
  );
}