import { QuizStatus } from "@/lib/data";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: QuizStatus }) {
  const isActive = status === "published";
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold capitalize ${isActive ? "text-emerald-600" : "text-brand-subtitle"}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`} />
      {status}
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

interface CustomTooltipProps extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> {
  children: React.ReactNode;
  content: string;
  arrowClassName?: string;
}

export function CustomTooltip({ children, content, className, arrowClassName, ...props }: CustomTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent className={cn("text-xs capitalize", className)} arrowClassName={arrowClassName} {...props}>
        <p>{content}</p>
      </TooltipContent>
    </Tooltip>
  );
}