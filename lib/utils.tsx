import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import * as LucideIcons from "lucide-react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function toPascalCase(str: string): string {
  return str
    .replace(/[-_]+/g, " ")
    .replace(/(?:^|\s)(.)/g, (_, c: string) => c.toUpperCase())
    .replace(/\s/g, "");
}

export function SubjectIcon({ iconName, size = 28 }: { iconName: string | null; size?: number }) {
  if (!iconName) {
    return <LucideIcons.HelpCircle size={size} className="text-slate-400" />;
  }

  const key = toPascalCase(iconName);
  const keyWithSuffix = key.endsWith("Icon") ? key : `${key}Icon`;

  const icons = LucideIcons as Record<string, unknown>;

  function isValidIcon(v: unknown): v is React.ComponentType<{ size?: number; className?: string }> {
    return typeof v === "function" || (typeof v === "object" && v !== null && "$$typeof" in (v as object));
  }

  const Icon = isValidIcon(icons[key])
    ? (icons[key] as React.ComponentType<{ size?: number; className?: string }>)
    : isValidIcon(icons[keyWithSuffix])
    ? (icons[keyWithSuffix] as React.ComponentType<{ size?: number; className?: string }>)
    : null;

  if (!Icon) {
    console.warn("[SubjectIcon] No match for icon_name:", iconName, "(tried:", key, "and", keyWithSuffix + ")");
    return <LucideIcons.HelpCircle size={size} className="text-slate-400" />;
  }

  return <Icon size={size} />;
}

// ─── Difficulty helpers ───────────────────────────────────────────────────────
export function difficultyConfig(d: string | null) {
  switch ((d ?? "").toLowerCase()) {
    case "easy":     return { label: "Beginner",     cls: "bg-emerald-100 text-emerald-700" };
    case "intermediate": return { label: "Intermediate", cls: "bg-amber-100 text-amber-700" };
    case "hard":     return { label: "Advanced",     cls: "bg-rose-100 text-rose-700" };
    default:             return { label: d ?? "Quiz",    cls: "bg-slate-100 text-slate-600" };
  }
}