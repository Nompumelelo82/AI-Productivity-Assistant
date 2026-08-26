import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Bot,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  FileText,
  Inbox,
  MapPin,
  TrendingUp,
  Wallet,
  Wrench,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader, Panel, PriorityBadge, AiDisclaimer, GenericBadge } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useStore } from "@/lib/store";
import { greeting, todayISO, zar } from "@/lib/format";
import { BUSINESS } from "@/lib/demo-data";
import { LogoMark } from "@/components/Logo";
import type { Appointment } from "@/lib/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — FixMate AI" },
      {
        name: "description",
        content:
          "Today's jobs, quotes, appointments and revenue for your service business, with AI quick actions.",
      },
      { property: "og:title", content: "FixMate AI Dashboard" },
      {
        property: "og:description",
        content: "See active jobs, pending quotes and today's schedule at a glance.",
      },
    ],
  }),
  component: Dashboard,
});

const AI_ACTIONS = [
  { label: "Analyse customer request", tool: "analyze" as const, to: "/requests" as const },
  { label: "Generate customer reply", tool: "reply" as const, to: "/assistant" as const },
  { label: "Create job plan", tool: "jobplan" as const, to: "/assistant" as const },
  { label: "Generate quote", tool: "quote" as const, to: "/quotes" as const },
  { label: "Plan my day", tool: "daily" as const, to: "/assistant" as const },
  { label: "Generate follow-up", tool: "followup" as const, to: "/assistant" as const },
];

function StatCard({
  label,
  value,
  icon,
  to,
  accent,
  hint,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  to: string;
  accent: string;
  hint: string;
}) {
  return (
    <Link
      to={to}
      className="glass-panel group rounded-2xl p-4 transition-all hover:-translate-y-0.5 hover:glow-ring"
    >
      <div className="flex items-start justify-between gap-3">
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${accent}`}>
          {icon}
        </span>
        <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
      </div>
      <p className="mt-3 text-2xl font-bold sm:text-3xl">{value}</p>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-xs text-muted-foreground/80">{hint}</p>
    </Link>
  );
}

function Dashboard() {
  const { stats, appointments, jobs, customerName, updateAppointment, requests } = useStore();
  const navigate = useNavigate();
  const [editing, setEditing] = useState<Appointment | null>(null);
  const [draft, setDraft] = useState({ time: "", title: "", location: "" });

  const today = appointments
    .filter((a) => a.date === todayISO())
    .sort((a, b) => a.time.localeCompare(b.time));
  const urgent = jobs.filter((j) => j.priority === "Urgent" && j.status !== "Completed");
  const openRequests = requests.filter((r) => !r.handled).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${greeting()}! 👋`}
        subtitle="Here's what's happening with your business today."
        actions={
          <>
            <Button asChild variant="outline">
              <Link to="/jobs" search={{ filter: "all", new: true }}>
                <Wrench className="h-4 w-4" /> New job
              </Link>
            </Button>
            <Button asChild variant="hero">
              <Link to="/assistant" search={{ tool: "chat" }}>
                <Bot className="h-4 w-4" /> Ask FixMate AI
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Active Jobs"
          value={String(stats.activeJobs)}
          hint="New, quoted, scheduled & in progress"
          icon={<Wrench className="h-5 w-5 text-primary-foreground" />}
          accent="gradient-primary"
          to="/jobs"
        />
        <StatCard
          label="Pending Quotes"
          value={String(stats.pendingQuotes)}
          hint="Waiting on customer decision"
          icon={<FileText className="h-5 w-5 text-gold-foreground" />}
          accent="gradient-gold"
          to="/quotes"
        />
        <StatCard
          label="Today's Appointments"
          value={String(stats.todayAppointments)}
          hint="Across Humewood, Walmer & Summerstrand"
          icon={<CalendarClock className="h-5 w-5 text-ai-foreground" />}
          accent="gradient-ai"
          to="/schedule"
        />
        <StatCard
          label="Completed Jobs"
          value={String(stats.completedJobs)}
          hint="This month"
          icon={<CheckCircle2 className="h-5 w-5 text-success-foreground" />}
          accent="bg-success"
          to="/reports"
        />
        <StatCard
          label="Revenue"
          value={zar(stats.revenue)}
          hint="August to date"
          icon={<Wallet className="h-5 w-5 text-primary-foreground" />}
          accent="bg-chart-5"
          to="/invoices"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Panel
          className="xl:col-span-2"
          title="Today's Schedule"
          description={`${today.length} appointments · ${BUSINESS.city}`}
          icon={<CalendarClock className="h-4 w-4" />}
          actions={
            <Button asChild variant="outline" size="sm">
              <Link to="/schedule">Open calendar</Link>
            </Button>
          }
        >
          <ul className="space-y-3">
            {today.map((a) => (
              <li
                key={a.id}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-border/70 bg-panel/70 p-3 transition-colors hover:border-primary/40 sm:flex sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid w-16 shrink-0 place-items-center rounded-lg bg-primary/15 py-2 font-display text-sm font-bold text-primary">
                    {a.time}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{a.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {customerName(a.customerId)} · {a.service}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {a.location} · {a.durationMins} min
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <PriorityBadge priority={a.priority} />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditing(a);
                      setDraft({ time: a.time, title: a.title, location: a.location });
                    }}
                  >
                    Open / edit
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <div className="space-y-4">
          <Panel
            tone="ai"
            title="AI Assistant"
            description="How can I help you today?"
            icon={<LogoMark className="h-7 w-7" />}
          >
            <div className="grid gap-2">
              {AI_ACTIONS.map((a) => (
                <Button
                  key={a.label}
                  variant="outline"
                  className="justify-between border-ai/30 hover:border-ai"
                  onClick={() => {
                    if (a.to === "/assistant") {
                      navigate({
                        to: "/assistant",
                        search: { tool: a.tool === "analyze" || a.tool === "quote" ? "chat" : a.tool },
                      });
                    } else {
                      navigate({ to: a.to, search: { from: a.tool } });
                    }
                  }}
                >
                  <span className="truncate">{a.label}</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ))}
            </div>
            <AiDisclaimer className="mt-4" />
          </Panel>

          <Panel title="Needs your attention" icon={<Inbox className="h-4 w-4" />}>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center justify-between gap-2 rounded-lg bg-panel/70 p-3">
                <span className="min-w-0 truncate">Unanswered customer requests</span>
                <GenericBadge tone="warning">{openRequests}</GenericBadge>
              </li>
              <li className="flex items-center justify-between gap-2 rounded-lg bg-panel/70 p-3">
                <span className="min-w-0 truncate">Urgent jobs</span>
                <GenericBadge tone="danger">{urgent.length}</GenericBadge>
              </li>
              <li className="flex items-center justify-between gap-2 rounded-lg bg-panel/70 p-3">
                <span className="min-w-0 truncate">Quotes awaiting reply</span>
                <GenericBadge tone="gold">{stats.pendingQuotes}</GenericBadge>
              </li>
            </ul>
            <Button asChild variant="hero" className="mt-3 w-full">
              <Link to="/requests">
                <ClipboardList className="h-4 w-4" /> Work through requests
              </Link>
            </Button>
          </Panel>
        </div>
      </div>

      <Panel
        title="The FixMate AI workflow"
        description="Every stage flows into the next — no disconnected tools."
        icon={<TrendingUp className="h-4 w-4" />}
      >
        <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { step: "01", label: "Customer request", to: "/requests" as const, search: undefined },
            { step: "02", label: "AI analysis & reply", to: "/requests" as const, search: undefined },
            { step: "03", label: "Job plan & quote", to: "/quotes" as const, search: undefined },
            { step: "04", label: "Schedule, invoice & follow-up", to: "/schedule" as const, search: undefined },
          ].map((s) => (
            <li key={s.step}>
              <Link
                to={s.to}
                className="block h-full rounded-xl border border-border/70 bg-panel/70 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/50"
              >
                <p className="font-display text-sm font-bold text-gold">{s.step}</p>
                <p className="mt-1 text-sm font-semibold">{s.label}</p>
              </Link>
            </li>
          ))}
        </ol>
      </Panel>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit appointment</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="Title"
            />
            <Input
              type="time"
              value={draft.time}
              onChange={(e) => setDraft({ ...draft, time: e.target.value })}
            />
            <Input
              value={draft.location}
              onChange={(e) => setDraft({ ...draft, location: e.target.value })}
              placeholder="Suburb"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button
              variant="hero"
              onClick={() => {
                if (editing) updateAppointment(editing.id, draft);
                toast.success("Appointment updated");
                setEditing(null);
              }}
            >
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
