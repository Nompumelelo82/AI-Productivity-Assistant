import type { ReactNode } from "react";
import { Info, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { AI_DISCLAIMER } from "@/lib/ai";
import type { JobStatus, Priority } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:flex-wrap sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="truncate text-2xl font-bold sm:text-3xl">{title}</h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">{subtitle}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}

export function Panel({
  title,
  description,
  icon,
  actions,
  children,
  className,
  tone = "default",
}: {
  title?: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  tone?: "default" | "ai";
}) {
  return (
    <section
      className={cn(
        "glass-panel rounded-2xl p-4 sm:p-5",
        tone === "ai" && "border-ai/40 bg-ai/5",
        className,
      )}
    >
      {title ? (
        <div className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 sm:flex sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            {icon ? (
              <span
                className={cn(
                  "grid h-9 w-9 shrink-0 place-items-center rounded-xl",
                  tone === "ai" ? "gradient-ai text-ai-foreground" : "bg-accent text-foreground",
                )}
              >
                {icon}
              </span>
            ) : null}
            <div className="min-w-0">
              <h2 className="truncate text-base font-semibold sm:text-lg">{title}</h2>
              {description ? (
                <p className="text-xs text-muted-foreground sm:text-sm">{description}</p>
              ) : null}
            </div>
          </div>
          {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function AiDisclaimer({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "flex gap-2 rounded-xl border border-ai/30 bg-ai/10 p-3 text-xs leading-relaxed text-muted-foreground",
        className,
      )}
    >
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-ai" />
      <span>
        <span className="font-semibold text-foreground">Responsible AI: </span>
        {AI_DISCLAIMER}
      </span>
    </p>
  );
}

export function AiThinking({ label = "FixMate AI is thinking" }: { label?: string }) {
  return (
    <div className="space-y-3">
      <p className="flex items-center gap-2 text-sm font-medium text-ai">
        <Loader2 className="h-4 w-4 animate-spin" />
        {label}
        <Sparkles className="h-4 w-4 animate-pulse" />
      </p>
      <Skeleton className="h-4 w-11/12" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-9/12" />
      <Skeleton className="h-4 w-10/12" />
    </div>
  );
}

const statusStyles: Record<JobStatus, string> = {
  New: "bg-primary/15 text-primary border-primary/30",
  Quoted: "bg-gold/15 text-gold border-gold/30",
  Scheduled: "bg-chart-5/15 text-chart-5 border-chart-5/30",
  "In Progress": "bg-ai/15 text-ai border-ai/30",
  Completed: "bg-success/15 text-success border-success/30",
  Cancelled: "bg-muted text-muted-foreground border-border",
};

export function StatusBadge({ status }: { status: JobStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
        statusStyles[status],
      )}
    >
      {status}
    </span>
  );
}

const priorityStyles: Record<Priority, string> = {
  Urgent: "bg-destructive/20 text-destructive border-destructive/40",
  High: "bg-warning/15 text-warning border-warning/30",
  Medium: "bg-primary/15 text-primary border-primary/30",
  Low: "bg-muted text-muted-foreground border-border",
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
        priorityStyles[priority],
      )}
    >
      {priority}
    </span>
  );
}

export function GenericBadge({
  children,
  tone = "muted",
}: {
  children: ReactNode;
  tone?: "muted" | "success" | "warning" | "danger" | "gold" | "ai" | "primary";
}) {
  const map = {
    muted: "bg-muted text-muted-foreground border-border",
    success: "bg-success/15 text-success border-success/30",
    warning: "bg-warning/15 text-warning border-warning/30",
    danger: "bg-destructive/20 text-destructive border-destructive/40",
    gold: "bg-gold/15 text-gold border-gold/30",
    ai: "bg-ai/15 text-ai border-ai/30",
    primary: "bg-primary/15 text-primary border-primary/30",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
        map[tone],
      )}
    >
      {children}
    </span>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/70 p-8 text-center">
      {icon ?? <Sparkles className="h-6 w-6 text-muted-foreground" />}
      <div>
        <p className="font-semibold">{title}</p>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function Field({
  label,
  children,
  hint,
  className,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
  className?: string;
}) {
  return (
    <label className={cn("block space-y-1.5", className)}>
      <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </span>
      {children}
      {hint ? <span className="block text-xs text-muted-foreground">{hint}</span> : null}
    </label>
  );
}
