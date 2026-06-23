import { QuizStatus } from "@/lib/data";

export function StatusBadge({ status }: { status: QuizStatus }) {
  const isActive = status === "available";
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold capitalize ${isActive ? "text-emerald-600" : "text-brand-subtitle"}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`} />
      {status}
    </span>
  );
}

export function JoinCodeBadge({ joinCode }: { joinCode: string }) {
  return (
    <span className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-1 text-xs font-bold text-brand-blue tracking-wide font-mono border border-blue-100">
      {joinCode}
    </span>
  );
}

export function CircleProgress({ value }: { value: number }) {
  const r = 32;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" className="-rotate-90">
      <circle cx="40" cy="40" r={r} fill="none" stroke="#F1F5F9" strokeWidth="6" />
      <circle
        cx="40" cy="40" r={r} fill="none"
        stroke="#10b981" strokeWidth="6"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
    </svg>
  );
}