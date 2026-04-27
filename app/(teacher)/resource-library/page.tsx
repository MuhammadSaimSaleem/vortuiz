"use client";

import { useState, useRef, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
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
  BookOpen,
  ChevronDown,
  ChevronRight,
  Copy,
  Edit2,
  ExternalLink,
  Eye,
  File,
  FileText,
  Film,
  Folder,
  FolderOpen,
  FolderPlus,
  Grid3X3,
  HelpCircle,
  Image,
  Info,
  LayoutList,
  Layers,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Share2,
  SlidersHorizontal,
  Star,
  StarOff,
  Trash2,
  Upload,
  X,
  CheckCheck,
  AlertCircle,
  Sparkles,
  ArrowUpDown,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import type { Folder as FolderType } from "@/lib/data";
import { Resource, ResourceFormat, SortOption, Toast, ToastKind, ViewMode } from "@/lib/data";

// ─── Seed data ────────────────────────────────────────────────────────────────
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

const INITIAL_FOLDERS: FolderType[] = [
  { id: "f1", name: "Grade 9 Curriculum", color: "bg-blue-500",   resourceIds: ["r1", "r2"], createdAt: new Date("2024-01-10") },
  { id: "f2", name: "Science Unit",       color: "bg-emerald-500", resourceIds: ["r3"],       createdAt: new Date("2024-01-15") },
  { id: "f3", name: "Exam Prep",          color: "bg-purple-500",  resourceIds: [],            createdAt: new Date("2024-01-20") },
];

const INITIAL_RESOURCES: Resource[] = [
  { id: "r1", title: "Cell Biology Master Quiz", author: "Sarah Jenkins", subject: "Science", grade: "Grade 11", format: "QUIZ",   rating: 4.8, ratingCount: 42,  coverColor: "from-cyan-600 to-blue-800",       coverEmoji: "🔬", folderId: "f1", starred: true,  createdAt: new Date("2024-01-12"), tags: ["biology","quiz"] },
  { id: "r2", title: "Algebra Foundations Workbook", author: "David Chen",    subject: "Math",    grade: "Grade 9",  format: "PDF",    rating: 5.0, ratingCount: 38,  coverColor: "from-indigo-600 to-violet-800",   coverEmoji: "📐", folderId: "f1", starred: false, createdAt: new Date("2024-01-14"), tags: ["algebra","math"] },
  { id: "r3", title: "Python Algorithms Guide",      author: "Marc Rivera",   subject: "CS",      grade: "Grade 12", format: "VIDEO",  rating: 4.2, ratingCount: 29,  coverColor: "from-slate-600 to-slate-900",     coverEmoji: "💻", folderId: "f2", starred: true,  createdAt: new Date("2024-01-16"), tags: ["python","cs"] },
  { id: "r4", title: "Renaissance Art Analysis",    author: "Elena Rossi",   subject: "History", grade: "Grade 10", format: "DOC",    rating: 4.9, ratingCount: 17,  coverColor: "from-amber-600 to-orange-800",    coverEmoji: "🎨", folderId: null, starred: false, createdAt: new Date("2024-01-18"), tags: ["art","history"] },
  { id: "r5", title: "Physics Motion Lab",          author: "James Park",    subject: "Physics", grade: "Grade 11", format: "LESSON", rating: 4.6, ratingCount: 55,  coverColor: "from-teal-600 to-cyan-800",       coverEmoji: "⚡", folderId: null, starred: false, createdAt: new Date("2024-01-20"), tags: ["physics","lab"] },
  { id: "r6", title: "World War II Timeline",       author: "Anna Moore",    subject: "History", grade: "Grade 10", format: "PDF",    rating: 4.3, ratingCount: 31,  coverColor: "from-red-700 to-rose-900",        coverEmoji: "📜", folderId: null, starred: true,  createdAt: new Date("2024-01-22"), tags: ["history","war"] },
  { id: "r7", title: "Geometry Proofs Practice",   author: "Chris Lee",     subject: "Math",    grade: "Grade 9",  format: "QUIZ",   rating: 4.7, ratingCount: 22,  coverColor: "from-violet-600 to-purple-800",   coverEmoji: "📏", folderId: null, starred: false, createdAt: new Date("2024-01-24"), tags: ["math","geometry"] },
  { id: "r8", title: "Chemical Reactions Video",   author: "Dr. Patel",     subject: "Science", grade: "Grade 11", format: "VIDEO",  rating: 4.5, ratingCount: 48,  coverColor: "from-green-600 to-emerald-800",   coverEmoji: "🧪", folderId: null, starred: false, createdAt: new Date("2024-01-26"), tags: ["chemistry","science"] },
];

const FOLDER_COLORS = [
  "bg-blue-500", "bg-emerald-500", "bg-purple-500", "bg-orange-500",
  "bg-rose-500",  "bg-cyan-500",   "bg-amber-500",  "bg-indigo-500",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatConfig: Record<ResourceFormat, { label: string; color: string; bg: string }> = {
  QUIZ:   { label: "QUIZ",   color: "text-blue-700",   bg: "bg-blue-100"   },
  PDF:    { label: "PDF",    color: "text-red-700",    bg: "bg-red-100"    },
  VIDEO:  { label: "VIDEO",  color: "text-purple-700", bg: "bg-purple-100" },
  DOC:    { label: "DOC",    color: "text-emerald-700",bg: "bg-emerald-100"},
  IMAGE:  { label: "IMAGE",  color: "text-amber-700",  bg: "bg-amber-100"  },
  LESSON: { label: "LESSON", color: "text-cyan-700",   bg: "bg-cyan-100"   },
};

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1,2,3,4,5].map(i => (
          <Star key={i} className={`h-3 w-3 ${i <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-slate-200 fill-slate-200"}`} />
        ))}
      </div>
      <span className="text-xs text-slate-400">({count})</span>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function ToastContainer({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: string) => void }) {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id}
          className={`flex items-center gap-3 rounded-xl px-4 py-3 shadow-lg text-sm font-medium text-white pointer-events-auto min-w-65
            ${t.kind === "success" ? "bg-emerald-600" : t.kind === "error" ? "bg-red-500" : "bg-brand-navy"}`}
          style={{ animation: "slideUp .2s ease" }}>
          {t.kind === "success" && <CheckCheck  className="h-4 w-4 shrink-0" />}
          {t.kind === "error"   && <AlertCircle className="h-4 w-4 shrink-0" />}
          {t.kind === "info"    && <Sparkles    className="h-4 w-4 shrink-0" />}
          {t.message}
          <button onClick={() => dismiss(t.id)} className="ml-auto opacity-70 hover:opacity-100"><X className="h-3.5 w-3.5" /></button>
        </div>
      ))}
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}`}</style>
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

// ─── ResourceCard (grid) ──────────────────────────────────────────────────────
function ResourceCardGrid({
  resource, folders,
  onStar, onDelete, onDuplicate, onMove, onQuickView,
}: {
  resource: Resource; folders: FolderType[];
  onStar: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onMove: (id: string, folderId: string | null) => void;
  onQuickView: (id: string) => void;
}) {
  const fmt = formatConfig[resource.format];
  return (
    <div className="group rounded-2xl border border-border bg-white overflow-hidden hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 flex flex-col">
      {/* Cover */}
      <div className={`relative h-36 bg-linear-to-br ${resource.coverColor} flex items-center justify-center shrink-0`}>
        <span className="text-4xl select-none">{resource.coverEmoji}</span>
        {/* Format badge */}
        <span className={`absolute top-2.5 right-2.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${fmt.bg} ${fmt.color}`}>
          {fmt.label}
        </span>
        {/* Star */}
        <button onClick={() => onStar(resource.id)}
          className="absolute top-2.5 left-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <Star className={`h-4 w-4 ${resource.starred ? "fill-amber-400 text-amber-400" : "text-white/70 hover:text-amber-300"}`} />
        </button>
        {/* Quick view overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button size="sm" onClick={() => onQuickView(resource.id)}
            className="bg-white text-brand-navy font-bold text-xs h-8 px-4 rounded-xl hover:bg-blue-50">
            Quick View
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex items-start justify-between gap-1">
          <div className="flex-1 min-w-0">
            <div className="flex gap-1.5 mb-1 flex-wrap">
              <Badge className={`text-[10px] font-semibold border-0 px-2 py-0 h-5 ${resource.subject === "Science" ? "bg-blue-100 text-blue-700" : resource.subject === "Math" ? "bg-orange-100 text-orange-700" : resource.subject === "CS" ? "bg-cyan-100 text-cyan-700" : resource.subject === "History" ? "bg-rose-100 text-rose-700" : "bg-purple-100 text-purple-700"}`}>
                {resource.subject}
              </Badge>
              <span className="text-[10px] text-slate-400 font-medium">{resource.grade}</span>
            </div>
            <p className="text-sm font-bold text-brand-navy leading-tight line-clamp-2">{resource.title}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 -mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="gap-2 text-xs" onClick={() => onQuickView(resource.id)}><Eye className="h-3.5 w-3.5" /> Quick View</DropdownMenuItem>
              <DropdownMenuItem className="gap-2 text-xs" onClick={() => onDuplicate(resource.id)}><Copy className="h-3.5 w-3.5" /> Duplicate</DropdownMenuItem>
              <DropdownMenuItem className="gap-2 text-xs" onClick={() => onStar(resource.id)}><Star className="h-3.5 w-3.5" /> {resource.starred ? "Unstar" : "Star"}</DropdownMenuItem>
              <DropdownMenuSeparator />
              {/* Move to folder submenu */}
              <DropdownMenuItem className="gap-2 text-xs" onClick={() => onMove(resource.id, null)}><Folder className="h-3.5 w-3.5" /> Remove from folder</DropdownMenuItem>
              {folders.map(f => (
                <DropdownMenuItem key={f.id} className="gap-2 text-xs pl-6" onClick={() => onMove(resource.id, f.id)}>
                  <span className={`h-2 w-2 rounded-full ${f.color}`} />{f.name}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 text-xs text-red-500" onClick={() => onDelete(resource.id)}><Trash2 className="h-3.5 w-3.5" /> Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <p className="text-xs text-brand-subtitle">By {resource.author}</p>
        <StarRating rating={resource.rating} count={resource.ratingCount} />
      </div>
    </div>
  );
}

// ─── ResourceRow (list) ───────────────────────────────────────────────────────
function ResourceCardList({
  resource, folders,
  onStar, onDelete, onDuplicate, onMove, onQuickView,
}: {
  resource: Resource; folders: FolderType[];
  onStar: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onMove: (id: string, folderId: string | null) => void;
  onQuickView: (id: string) => void;
}) {
  const fmt = formatConfig[resource.format];
  return (
    <div className="group flex items-center gap-4 px-5 py-3.5 bg-white rounded-xl border border-border hover:shadow-sm transition-all">
      {/* Mini cover */}
      <div className={`h-10 w-10 rounded-xl bg-linear-to-br ${resource.coverColor} flex items-center justify-center shrink-0 text-lg`}>
        {resource.coverEmoji}
      </div>
      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-sm font-bold text-brand-navy truncate">{resource.title}</p>
          <span className={`text-[10px] font-bold px-2 py-0 h-4 rounded-full flex items-center ${fmt.bg} ${fmt.color}`}>{fmt.label}</span>
        </div>
        <p className="text-xs text-brand-subtitle">By {resource.author} · {resource.subject} · {resource.grade}</p>
      </div>
      <StarRating rating={resource.rating} count={resource.ratingCount} />
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onQuickView(resource.id)}>
              <Eye className="h-3.5 w-3.5 text-slate-400" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-brand-navy text-white border-none text-xs">Quick View</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onStar(resource.id)}>
              <Star className={`h-3.5 w-3.5 ${resource.starred ? "fill-amber-400 text-amber-400" : "text-slate-400"}`} />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-brand-navy text-white border-none text-xs">{resource.starred ? "Unstar" : "Star"}</TooltipContent>
        </Tooltip>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <MoreVertical className="h-3.5 w-3.5 text-slate-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem className="gap-2 text-xs" onClick={() => onDuplicate(resource.id)}><Copy className="h-3.5 w-3.5" /> Duplicate</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 text-xs" onClick={() => onMove(resource.id, null)}><Folder className="h-3.5 w-3.5" /> Remove from folder</DropdownMenuItem>
            {folders.map(f => (
              <DropdownMenuItem key={f.id} className="gap-2 text-xs pl-6" onClick={() => onMove(resource.id, f.id)}>
                <span className={`h-2 w-2 rounded-full ${f.color}`} />{f.name}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 text-xs text-red-500" onClick={() => onDelete(resource.id)}><Trash2 className="h-3.5 w-3.5" /> Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

// ─── QuickViewDialog ──────────────────────────────────────────────────────────
function QuickViewDialog({ resource, open, onClose }: { resource: Resource | null; open: boolean; onClose: () => void }) {
  if (!resource) return null;
  const fmt = formatConfig[resource.format];
  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <div className={`h-44 bg-linear-to-br ${resource.coverColor} flex items-center justify-center`}>
          <span className="text-6xl">{resource.coverEmoji}</span>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${fmt.bg} ${fmt.color}`}>{fmt.label}</span>
            <span className="text-xs text-slate-400">{resource.subject} · {resource.grade}</span>
          </div>
          <DialogTitle className="text-lg font-bold text-brand-navy mb-1">{resource.title}</DialogTitle>
          <p className="text-sm text-brand-subtitle mb-3">By {resource.author}</p>
          <StarRating rating={resource.rating} count={resource.ratingCount} />
          <div className="flex flex-wrap gap-1.5 mt-3">
            {resource.tags.map(t => (
              <span key={t} className="text-[11px] bg-brand-light text-brand-blue font-medium px-2.5 py-0.5 rounded-full">{t}</span>
            ))}
          </div>
          <div className="flex gap-2 mt-5">
            <Button className="flex-1 bg-brand-navy hover:bg-brand-blue text-white font-semibold text-sm rounded-xl h-10">
              <ExternalLink className="h-4 w-4 mr-2" /> Open Resource
            </Button>
            <Button variant="outline" className="flex-1 border-border font-semibold text-sm rounded-xl h-10" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── UploadDialog ─────────────────────────────────────────────────────────────
function UploadDialog({ open, onClose, folders, onUpload }: {
  open: boolean; onClose: () => void;
  folders: FolderType[];
  onUpload: (r: Omit<Resource, "id" | "createdAt">) => void;
}) {
  const [title,    setTitle]    = useState("");
  const [author,   setAuthor]   = useState("");
  const [subject,  setSubject]  = useState("Science");
  const [grade,    setGrade]    = useState("Grade 9");
  const [format,   setFormat]   = useState<ResourceFormat>("PDF");
  const [folderId, setFolderId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if (!title.trim() || !author.trim()) return;
    onUpload({
      title, author, subject, grade, format, folderId,
      rating: 0, ratingCount: 0,
      coverColor: "from-slate-600 to-slate-800",
      coverEmoji: "📄",
      starred: false,
      tags: [subject.toLowerCase()],
    });
    setTitle(""); setAuthor("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-brand-navy font-bold">Upload Resource</DialogTitle>
          <DialogDescription>Add a new resource to your library.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Title *</label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Resource title" className="h-10 rounded-xl" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Author *</label>
            <Input value={author} onChange={e => setAuthor(e.target.value)} placeholder="Author name" className="h-10 rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Subject</label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Science","Math","CS","History","Physics","Literature"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Grade</label>
              <Select value={grade} onValueChange={setGrade}>
                <SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Grade 9","Grade 10","Grade 11","Grade 12"].map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Format</label>
              <Select value={format} onValueChange={v => setFormat(v as ResourceFormat)}>
                <SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(["QUIZ","PDF","VIDEO","DOC","IMAGE","LESSON"] as ResourceFormat[]).map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Folder</label>
              <Select value={folderId ?? "none"} onValueChange={v => setFolderId(v === "none" ? null : v)}>
                <SelectTrigger className="h-10 rounded-xl"><SelectValue placeholder="No folder" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No folder</SelectItem>
                  {folders.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          {/* Drop zone */}
          <div onClick={() => fileRef.current?.click()}
            className="h-20 rounded-xl border-2 border-dashed border-border bg-slate-50 flex items-center justify-center gap-2 cursor-pointer hover:bg-slate-100 transition-colors">
            <input ref={fileRef} type="file" className="hidden" />
            <Upload className="h-4 w-4 text-slate-400" />
            <span className="text-xs text-slate-400 font-medium">Click to attach file (optional)</span>
          </div>
        </div>
        <DialogFooter className="gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!title.trim() || !author.trim()}
            className="bg-brand-navy hover:bg-brand-blue text-white font-semibold rounded-xl">
            Upload Resource
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── FolderDialog ─────────────────────────────────────────────────────────────
function FolderDialog({ open, onClose, folder, onSave }: {
  open: boolean; onClose: () => void;
  folder: FolderType | null;
  onSave: (name: string, color: string) => void;
}) {
  const [name,  setName]  = useState(folder?.name ?? "");
  const [color, setColor] = useState(folder?.color ?? FOLDER_COLORS[0]);

  // Sync when folder prop changes
  useState(() => { setName(folder?.name ?? ""); setColor(folder?.color ?? FOLDER_COLORS[0]); });

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-brand-navy font-bold">{folder ? "Rename Folder" : "Create New Folder"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Folder name" className="h-10 rounded-xl" />
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Color</p>
            <div className="flex gap-2 flex-wrap">
              {FOLDER_COLORS.map(c => (
                <button key={c} onClick={() => setColor(c)}
                  className={`h-7 w-7 rounded-full ${c} transition-all ${color === c ? "ring-2 ring-offset-2 ring-brand-blue scale-110" : ""}`} />
              ))}
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button disabled={!name.trim()} onClick={() => { onSave(name.trim(), color); onClose(); }}
            className="bg-brand-navy hover:bg-brand-blue text-white font-semibold rounded-xl">
            {folder ? "Save Changes" : "Create Folder"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ResourceLibrary() {
  const [resources, setResources] = useState<Resource[]>(INITIAL_RESOURCES);
  const [folders,   setFolders]   = useState<FolderType[]>(INITIAL_FOLDERS);

  // UI state
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [viewMode,        setViewMode]        = useState<ViewMode>("grid");
  const [search,          setSearch]          = useState("");
  const [sortBy,          setSortBy]          = useState<SortOption>("recently_added");
  const [activeFolderId,  setActiveFolderId]  = useState<string | null | "all" | "starred">("all");
  const [filterSubjects,  setFilterSubjects]  = useState<string[]>([]);
  const [filterGrades,    setFilterGrades]    = useState<string[]>([]);
  const [filterFormats,   setFilterFormats]   = useState<ResourceFormat[]>([]);
  const [filtersOpen,     setFiltersOpen]     = useState(true);

  // Dialogs
  const [uploadOpen,      setUploadOpen]      = useState(false);
  const [quickViewId,     setQuickViewId]     = useState<string | null>(null);
  const [folderDialogOpen,setFolderDialogOpen]= useState(false);
  const [editingFolder,   setEditingFolder]   = useState<FolderType | null>(null);
  const [deleteTargetId,  setDeleteTargetId]  = useState<string | null>(null);
  const [deleteFolderId,  setDeleteFolderId]  = useState<string | null>(null);

  const { toasts, push, dismiss } = useToasts();

  // ── Derived ────────────────────────────────────────────────────────────────
  const allSubjects = [...new Set(resources.map(r => r.subject))].sort();
  const allGrades   = ["Grade 9","Grade 10","Grade 11","Grade 12"];
  const allFormats: ResourceFormat[] = ["QUIZ","PDF","VIDEO","DOC","IMAGE","LESSON"];

  const filtered = resources
    .filter(r => {
      if (activeFolderId === "starred") return r.starred;
      if (activeFolderId === "all")     return true;
      if (activeFolderId === null)      return r.folderId === null;
      return r.folderId === activeFolderId;
    })
    .filter(r => filterSubjects.length === 0 || filterSubjects.includes(r.subject))
    .filter(r => filterGrades.length   === 0 || filterGrades.includes(r.grade))
    .filter(r => filterFormats.length  === 0 || filterFormats.includes(r.format))
    .filter(r => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return r.title.toLowerCase().includes(q) || r.author.toLowerCase().includes(q) || r.subject.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name_asc":  return a.title.localeCompare(b.title);
        case "name_desc": return b.title.localeCompare(a.title);
        case "rating":    return b.rating - a.rating;
        case "oldest":    return a.createdAt.getTime() - b.createdAt.getTime();
        default:          return b.createdAt.getTime() - a.createdAt.getTime();
      }
    });

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleStar = (id: string) => {
    setResources(prev => prev.map(r => r.id === id ? { ...r, starred: !r.starred } : r));
    const r = resources.find(x => x.id === id);
    push(r?.starred ? "Removed from starred" : "Added to starred", "info");
  };

  const handleDelete = (id: string) => {
    setResources(prev => prev.filter(r => r.id !== id));
    setFolders(prev => prev.map(f => ({ ...f, resourceIds: f.resourceIds.filter(x => x !== id) })));
    setDeleteTargetId(null);
    push("Resource deleted");
  };

  const handleDuplicate = (id: string) => {
    const src = resources.find(r => r.id === id);
    if (!src) return;
    const copy: Resource = { ...src, id: uid(), title: `${src.title} (Copy)`, createdAt: new Date(), starred: false };
    setResources(prev => [...prev, copy]);
    push("Resource duplicated");
  };

  const handleMove = (id: string, folderId: string | null) => {
    setResources(prev => prev.map(r => r.id === id ? { ...r, folderId } : r));
    setFolders(prev => prev.map(f => ({
      ...f,
      resourceIds: folderId === f.id
        ? [...f.resourceIds.filter(x => x !== id), id]
        : f.resourceIds.filter(x => x !== id),
    })));
    push(folderId ? `Moved to folder` : "Removed from folder", "info");
  };

  const handleUpload = (data: Omit<Resource, "id" | "createdAt">) => {
    const r: Resource = { ...data, id: uid(), createdAt: new Date() };
    setResources(prev => [r, ...prev]);
    if (data.folderId) {
      setFolders(prev => prev.map(f => f.id === data.folderId ? { ...f, resourceIds: [...f.resourceIds, r.id] } : f));
    }
    push("Resource uploaded successfully!");
  };

  const handleCreateFolder = (name: string, color: string) => {
    if (editingFolder) {
      setFolders(prev => prev.map(f => f.id === editingFolder.id ? { ...f, name, color } : f));
      push("Folder updated");
    } else {
      const f: FolderType = { id: uid(), name, color, resourceIds: [], createdAt: new Date() };
      setFolders(prev => [...prev, f]);
      push("Folder created");
    }
    setEditingFolder(null);
  };

  const handleDeleteFolder = (folderId: string) => {
    setResources(prev => prev.map(r => r.folderId === folderId ? { ...r, folderId: null } : r));
    setFolders(prev => prev.filter(f => f.id !== folderId));
    if (activeFolderId === folderId) setActiveFolderId("all");
    setDeleteFolderId(null);
    push("Folder deleted");
  };

  const toggleSubject = (s: string) => setFilterSubjects(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  const toggleGrade   = (g: string) => setFilterGrades(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);
  const toggleFormat  = (f: ResourceFormat) => setFilterFormats(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);

  const clearFilters = () => { setFilterSubjects([]); setFilterGrades([]); setFilterFormats([]); };
  const hasFilters = filterSubjects.length > 0 || filterGrades.length > 0 || filterFormats.length > 0;

  const quickViewResource = resources.find(r => r.id === quickViewId) ?? null;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
      <div>
        <div className="flex min-h-screen bg-surface">
          {/* ── Left sidebar ── */}
          <div className="relative">
            <aside className={`relative z-20 flex flex-col border-r border-border bg-white transition-all duration-300 ease-in-out
              ${sidebarOpen ? "w-64" : "w-0 -translate-x-56"}`}>
              {/* Brand */}
              <div className="px-5 pt-6 pb-5.25 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-brand-navy flex items-center justify-center">
                    <BookOpen className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-brand-navy leading-tight">Resource Library</p>
                    <p className="text-[10px] text-brand-subtitle">Curated Materials</p>
                  </div>
                </div>
              </div>
              {/* Nav */}
              <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
                {/* Static items */}
                {[
                  { id: "all",     icon: <Layers className="h-4 w-4" />,  label: "All Resources",  count: resources.length },
                  { id: "starred", icon: <Star   className="h-4 w-4" />,  label: "Starred",         count: resources.filter(r => r.starred).length },
                  { id: null,      icon: <File   className="h-4 w-4" />,  label: "Unorganised",    count: resources.filter(r => !r.folderId).length },
                ].map(item => (
                  <button key={String(item.id)} onClick={() => setActiveFolderId(item.id as any)}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors
                      ${activeFolderId === item.id ? "bg-brand-light text-brand-navy border-l-2 border-brand-blue" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"}`}>
                    <span className={activeFolderId === item.id ? "text-brand-blue" : "text-slate-400"}>{item.icon}</span>
                    <span className="flex-1 text-left">{item.label}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeFolderId === item.id ? "bg-brand-blue text-white" : "bg-slate-100 text-slate-400"}`}>
                      {item.count}
                    </span>
                  </button>
                ))}
                {/* Folders section */}
                <div className="pt-3 pb-1">
                  <div className="flex items-center justify-between px-3 mb-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Folders</p>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => { setEditingFolder(null); setFolderDialogOpen(true); }}>
                          <FolderPlus className="h-3.5 w-3.5 text-slate-400" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-brand-navy text-white border-none text-xs">New folder</TooltipContent>
                    </Tooltip>
                  </div>
                  {folders.map(folder => (
                    <div key={folder.id} className="group/folder flex items-center rounded-lg px-3 py-2 hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => setActiveFolderId(folder.id)}>
                      <span className={`h-3 w-3 rounded-full ${folder.color} mr-2.5 shrink-0`} />
                      <span className={`flex-1 text-sm font-medium truncate ${activeFolderId === folder.id ? "text-brand-navy" : "text-slate-500"}`}>
                        {folder.name}
                      </span>
                      <span className="text-[10px] text-slate-400 mr-1">{folder.resourceIds.length}</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-5 w-5 opacity-0 group-hover/folder:opacity-100 shrink-0"
                            onClick={e => e.stopPropagation()}>
                            <MoreVertical className="h-3 w-3 text-slate-400" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-36">
                          <DropdownMenuItem className="gap-2 text-xs" onClick={e => { e.stopPropagation(); setEditingFolder(folder); setFolderDialogOpen(true); }}>
                            <Edit2 className="h-3.5 w-3.5" /> Rename
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="gap-2 text-xs text-red-500" onClick={e => { e.stopPropagation(); setDeleteFolderId(folder.id); }}>
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              </nav>
              {/* Filter panel */}
              <div className={`shrink-0 bg-white transition-all duration-300 overflow-hidden ${filtersOpen ? "w-52" : "w-0"}`}>
                <div className="w-52 p-4 space-y-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-brand-navy">Filters</p>
                    {hasFilters && (
                      <button onClick={clearFilters} className="text-[11px] font-semibold text-brand-blue hover:opacity-80">
                        Clear all
                      </button>
                    )}
                  </div>
                  {/* Subject */}
                  <div>
                    <p className="text-xs font-bold text-brand-navy mb-2.5">Subject</p>
                    <div className="space-y-2">
                      {allSubjects.map(s => (
                        <div key={s} className="flex items-center gap-2">
                          <Checkbox id={`s-${s}`} checked={filterSubjects.includes(s)} onCheckedChange={() => toggleSubject(s)}
                            className="data-[state=checked]:bg-brand-navy data-[state=checked]:border-brand-navy" />
                          <label htmlFor={`s-${s}`} className="text-sm text-slate-600 cursor-pointer select-none">{s}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Grade */}
                  <div>
                    <p className="text-xs font-bold text-brand-navy mb-2.5">Grade Level</p>
                    <div className="flex flex-wrap gap-1.5">
                      {allGrades.map(g => (
                        <button key={g} onClick={() => toggleGrade(g)}
                          className={`text-xs font-medium px-2.5 py-1 rounded-full border transition-colors
                            ${filterGrades.includes(g) ? "bg-brand-navy text-white border-brand-navy" : "border-border text-slate-500 hover:border-brand-blue"}`}>
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Format */}
                  <div>
                    <p className="text-xs font-bold text-brand-navy mb-2.5">Format</p>
                    <div className="space-y-2">
                      {allFormats.map(f => {
                        const fmt = formatConfig[f];
                        return (
                          <div key={f} className="flex items-center gap-2">
                            <Checkbox id={`f-${f}`} checked={filterFormats.includes(f)} onCheckedChange={() => toggleFormat(f)}
                              className="data-[state=checked]:bg-brand-navy data-[state=checked]:border-brand-navy" />
                            <label htmlFor={`f-${f}`} className="text-sm cursor-pointer select-none flex items-center gap-1.5">
                              <span className={`text-[10px] font-bold px-1.5 py-0 rounded ${fmt.bg} ${fmt.color}`}>{fmt.label}</span>
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
              {/* Bottom */}
              <div className="border-t border-border p-3 space-y-0.5">
                <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50">
                  <Settings className="h-4 w-4" /> Settings
                </button>
                <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50">
                  <HelpCircle className="h-4 w-4" /> Help
                </button>
                <Button className="w-full mt-2 bg-brand-navy hover:bg-brand-blue text-white font-semibold text-sm rounded-xl h-10 gap-1.5 transition-colors"
                  onClick={() => setUploadOpen(true)}>
                  <Upload className="h-4 w-4" /> Upload
                </Button>
              </div>
            </aside>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`absolute top-6 z-1000 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-white shadow-sm transition-all duration-300 hover:bg-slate-50
                ${sidebarOpen ? "left-68" : "left-4"}`}
            >
              {sidebarOpen ? (
                <ArrowLeft className="h-4 w-4 text-slate-600" />
              ) : (
                <ArrowRight className="h-4 w-4 text-slate-600" />
              )}
            </button>
          </div>

          {/* ── Main content ── */}
          <div className="flex-1 flex overflow-hidden">
            {/* Content area */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Sub-header */}
              <div className="border-b border-border bg-white px-6 py-4 flex items-center justify-between gap-4">
                <div className="ml-10">
                  <h1 className="text-xl font-bold text-brand-navy">Browse Resources</h1>
                  <p className="text-xs text-brand-subtitle mt-0.5">
                    Discover high-quality materials from your collection and shared hubs.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {/* Search */}
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <Input value={search} onChange={e => setSearch(e.target.value)}
                      placeholder="Search resources…"
                      className="h-9 pl-9 text-sm bg-slate-50 border-border focus-visible:ring-brand-blue rounded-xl" />
                    {search && (
                      <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  {/* Filter toggle */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon" className={`h-9 w-9 border-border rounded-xl ${filtersOpen ? "bg-brand-light border-brand-blue" : ""}`}
                        onClick={() => setFiltersOpen(p => !p)}>
                        <SlidersHorizontal className={`h-4 w-4 ${filtersOpen ? "text-brand-blue" : "text-slate-400"}`} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-brand-navy text-white border-none text-xs">Toggle filters</TooltipContent>
                  </Tooltip>
                  {/* View toggle */}
                  <div className="flex items-center border border-border rounded-xl overflow-hidden h-9">
                    <button onClick={() => setViewMode("grid")}
                      className={`px-2.5 h-full flex items-center transition-colors ${viewMode === "grid" ? "bg-brand-light text-brand-blue" : "text-slate-400 hover:bg-slate-50"}`}>
                      <Grid3X3 className="h-4 w-4" />
                    </button>
                    <button onClick={() => setViewMode("list")}
                      className={`px-2.5 h-full flex items-center border-l border-border transition-colors ${viewMode === "list" ? "bg-brand-light text-brand-blue" : "text-slate-400 hover:bg-slate-50"}`}>
                      <LayoutList className="h-4 w-4" />
                    </button>
                  </div>
                  {/* Sort */}
                  <Select value={sortBy} onValueChange={v => setSortBy(v as SortOption)}>
                    <SelectTrigger className="h-9 text-sm border-border rounded-xl w-44 focus:ring-brand-blue gap-1">
                      <ArrowUpDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value="recently_added">Recently Added</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="name_asc">Name A–Z</SelectItem>
                      <SelectItem value="name_desc">Name Z–A</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {/* Active filter chips */}
              {hasFilters && (
                <div className="px-6 py-2 flex items-center gap-2 flex-wrap bg-white border-b border-border">
                  {filterSubjects.map(s => (
                    <span key={s} className="flex items-center gap-1 text-xs font-medium bg-brand-light text-brand-blue px-2.5 py-1 rounded-full">
                      {s} <button onClick={() => toggleSubject(s)}><X className="h-3 w-3" /></button>
                    </span>
                  ))}
                  {filterGrades.map(g => (
                    <span key={g} className="flex items-center gap-1 text-xs font-medium bg-orange-50 text-orange-600 px-2.5 py-1 rounded-full">
                      {g} <button onClick={() => toggleGrade(g)}><X className="h-3 w-3" /></button>
                    </span>
                  ))}
                  {filterFormats.map(f => (
                    <span key={f} className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${formatConfig[f].bg} ${formatConfig[f].color}`}>
                      {f} <button onClick={() => toggleFormat(f)}><X className="h-3 w-3" /></button>
                    </span>
                  ))}
                </div>
              )}
              {/* Resource grid/list */}
              <div className="flex w-full overflow-y-auto p-6 max-w-7xl mx-auto">
                {filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 gap-3">
                    <div className="h-14 w-14 rounded-2xl bg-brand-light flex items-center justify-center">
                      <Search className="h-7 w-7 text-brand-blue" />
                    </div>
                    <p className="text-sm font-semibold text-brand-navy">No resources found</p>
                    <p className="text-xs text-brand-subtitle">Try adjusting your filters or search term</p>
                    {hasFilters && <Button variant="outline" size="sm" onClick={clearFilters} className="rounded-xl text-xs">Clear filters</Button>}
                  </div>
                ) : viewMode === "grid" ? (
                  <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                    {filtered.map(r => (
                      <ResourceCardGrid key={r.id} resource={r} folders={folders}
                        onStar={handleStar} onDelete={id => setDeleteTargetId(id)}
                        onDuplicate={handleDuplicate} onMove={handleMove}
                        onQuickView={id => setQuickViewId(id)} />
                    ))}
                    {/* Add new card */}
                    <button onClick={() => setUploadOpen(true)}
                      className="rounded-2xl border-2 border-dashed border-border bg-white flex flex-col items-center justify-center gap-3 min-h-55 hover:border-brand-blue hover:bg-brand-light transition-all group">
                      <div className="h-12 w-12 rounded-2xl bg-slate-100 group-hover:bg-white flex items-center justify-center transition-colors">
                        <Plus className="h-6 w-6 text-slate-400 group-hover:text-brand-blue" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-slate-500 group-hover:text-brand-navy">Add New Resource</p>
                        <p className="text-xs text-slate-400 mt-0.5">Upload a document, quiz,<br />or multimedia file.</p>
                      </div>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filtered.map(r => (
                      <ResourceCardList key={r.id} resource={r} folders={folders}
                        onStar={handleStar} onDelete={id => setDeleteTargetId(id)}
                        onDuplicate={handleDuplicate} onMove={handleMove}
                        onQuickView={id => setQuickViewId(id)} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* ── Dialogs ── */}
        <UploadDialog open={uploadOpen} onClose={() => setUploadOpen(false)} folders={folders} onUpload={handleUpload} />
        <QuickViewDialog resource={quickViewResource} open={!!quickViewId} onClose={() => setQuickViewId(null)} />
        <FolderDialog
          open={folderDialogOpen}
          onClose={() => { setFolderDialogOpen(false); setEditingFolder(null); }}
          folder={editingFolder}
          onSave={handleCreateFolder}
        />
        {/* Delete resource confirm */}
        <Dialog open={!!deleteTargetId} onOpenChange={v => !v && setDeleteTargetId(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-brand-navy">Delete resource?</DialogTitle>
              <DialogDescription>This action cannot be undone.</DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setDeleteTargetId(null)}>Cancel</Button>
              <Button className="bg-red-500 hover:bg-red-600 text-white" onClick={() => deleteTargetId && handleDelete(deleteTargetId)}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* Delete folder confirm */}
        <Dialog open={!!deleteFolderId} onOpenChange={v => !v && setDeleteFolderId(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-brand-navy">Delete folder?</DialogTitle>
              <DialogDescription>Resources inside will become unorganised. This cannot be undone.</DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setDeleteFolderId(null)}>Cancel</Button>
              <Button className="bg-red-500 hover:bg-red-600 text-white" onClick={() => deleteFolderId && handleDeleteFolder(deleteFolderId)}>Delete Folder</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <ToastContainer toasts={toasts} dismiss={dismiss} />
      </div>
  );
}

// missing import added inline
function Settings(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}