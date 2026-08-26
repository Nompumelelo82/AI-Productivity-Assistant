import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Bot,
  CalendarPlus,
  ClipboardCheck,
  Copy,
  MessageSquarePlus,
  Pencil,
  RefreshCw,
  Send,
  Sparkles,
  Timer,
  Wrench,
} from "lucide-react";
import {
  AiDisclaimer,
  AiThinking,
  Field,
  GenericBadge,
  PageHeader,
  Panel,
  PriorityBadge,
} from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LogoMark } from "@/components/Logo";
import { useStore } from "@/lib/store";
import {
  assistantAnswer,
  generateDailyPlan,
  generateFollowUp,
  generateJobPlan,
  generateReply,
  nextVariant,
  think,
  SAFETY_NOTE,
  type JobPlan,
  type PlanBlock,
} from "@/lib/ai";
import { todayISO, zar } from "@/lib/format";
import type { Tone } from "@/lib/types";
import { cn } from "@/lib/utils";

type Tool = "chat" | "reply" | "jobplan" | "daily" | "followup";

type AssistantSearch = {
  tool: Tool;
  request?: string;
  customer?: string;
  job?: string;
};

export const Route = createFileRoute("/assistant")({
  validateSearch: (search: Record<string, unknown>): AssistantSearch => {
    const tool = search["tool"];
    const request = search["request"];
    const customer = search["customer"];
    const job = search["job"];
    return {
      tool: (["chat", "reply", "jobplan", "daily", "followup"] as string[]).includes(String(tool))
        ? (tool as Tool)
        : "chat",
      ...(typeof request === "string" ? { request } : {}),
      ...(typeof customer === "string" ? { customer } : {}),
      ...(typeof job === "string" ? { job } : {}),
    };
  },
  head: () => ({
    meta: [
      { title: "AI Assistant — FixMate AI" },
      {
        name: "description",
        content:
          "Chat with FixMate AI, generate customer replies, job plans, daily schedules and follow-up messages.",
      },
      { property: "og:title", content: "FixMate AI Assistant" },
      {
        property: "og:description",
        content: "Business answers, customer replies and AI planning for service businesses.",
      },
    ],
  }),
  component: AssistantPage,
});

const TOOLS: Array<{ id: Tool; label: string }> = [
  { id: "chat", label: "Chat" },
  { id: "reply", label: "Customer Reply" },
  { id: "jobplan", label: "Job Planner" },
  { id: "daily", label: "Daily Planner" },
  { id: "followup", label: "Follow-Up" },
];

const TONES: Tone[] = ["Friendly", "Professional", "Short", "Apologetic", "Urgent", "Persuasive"];

function AssistantPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <PageHeader
        title="FixMate AI Assistant"
        subtitle="One assistant for replies, planning, quoting advice and business questions."
      />

      <div className="scrollbar-slim -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {TOOLS.map((t) => (
          <button
            key={t.id}
            onClick={() => navigate({ to: "/assistant", search: { ...search, tool: t.id } })}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-all",
              search.tool === t.id
                ? "gradient-ai border-transparent text-ai-foreground"
                : "border-border bg-card/60 text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {search.tool === "chat" ? <ChatTool /> : null}
      {search.tool === "reply" ? (
        <ReplyTool initialRequest={search.request} customer={search.customer} />
      ) : null}
      {search.tool === "jobplan" ? <JobPlanTool initialRequest={search.request} /> : null}
      {search.tool === "daily" ? <DailyPlannerTool /> : null}
      {search.tool === "followup" ? <FollowUpTool jobId={search.job} /> : null}
    </div>
  );
}

/* ---------------------------------- CHAT ---------------------------------- */

const SUGGESTED = [
  "Prioritize today's jobs",
  "Write a customer message",
  "Create a quote",
  "Plan my day",
  "Follow up on pending quotes",
  "Which jobs are making the most money?",
];

function ChatTool() {
  const { stats, jobs } = useStore();
  const [messages, setMessages] = useState<Array<{ role: "user" | "ai"; text: string }>>([
    {
      role: "ai",
      text: `Hi! I'm FixMate AI, your admin assistant for FixMate Plumbing & Repairs.\n\nRight now you have ${stats.activeJobs} active jobs, ${stats.pendingQuotes} open quotes and ${zar(stats.revenue)} revenue this month. Ask me anything about your business, or pick a suggestion below.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const ctx = useMemo(
    () => ({
      activeJobs: stats.activeJobs,
      pendingQuotes: stats.pendingQuotes,
      todayAppointments: stats.todayAppointments,
      completedJobs: stats.completedJobs,
      revenue: stats.revenue,
      topService: stats.topService,
      urgentJob: jobs.find((j) => j.priority === "Urgent" && j.status !== "Completed")?.title,
    }),
    [stats, jobs],
  );

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function ask(question: string) {
    if (!question.trim() || loading) return;
    setMessages((m) => [...m, { role: "user", text: question }]);
    setInput("");
    setLoading(true);
    const answer = await think(assistantAnswer(question, ctx, nextVariant()), 900);
    setMessages((m) => [...m, { role: "ai", text: answer }]);
    setLoading(false);
  }

  return (
    <Panel tone="ai" className="flex min-h-[70vh] flex-col">
      <div className="scrollbar-slim min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
        {messages.map((m, i) => (
          <div key={i} className={cn("flex gap-3", m.role === "user" && "justify-end")}>
            {m.role === "ai" ? <LogoMark className="mt-1 h-8 w-8" /> : null}
            <div
              className={cn(
                "max-w-[42rem] text-sm leading-relaxed whitespace-pre-wrap",
                m.role === "user"
                  ? "rounded-2xl bg-primary px-4 py-2.5 text-primary-foreground"
                  : "text-foreground",
              )}
            >
              {m.text}
            </div>
          </div>
        ))}
        {loading ? (
          <div className="flex gap-3">
            <LogoMark className="mt-1 h-8 w-8" />
            <div className="w-full max-w-md">
              <AiThinking label="Thinking" />
            </div>
          </div>
        ) : null}
        <div ref={endRef} />
      </div>

      <form
        className="mt-4 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          ask(input);
        }}
      >
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about jobs, pricing, scheduling or customers…"
          />
          <Button type="submit" variant="ai" size="icon" disabled={loading} aria-label="Send">
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => ask(s)}
              className="rounded-full border border-ai/30 bg-ai/10 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-ai/20"
            >
              {s}
            </button>
          ))}
        </div>
        <AiDisclaimer />
      </form>
    </Panel>
  );
}

/* --------------------------------- REPLY ---------------------------------- */

function ReplyTool({ initialRequest, customer }: { initialRequest?: string; customer?: string }) {
  const [request, setRequest] = useState(
    initialRequest ?? "Hi, my kitchen tap is leaking and the cupboard underneath is getting wet.",
  );
  const [name, setName] = useState(customer ?? "Sarah Johnson");
  const [tone, setTone] = useState<Tone>("Friendly");
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState("");
  const [editing, setEditing] = useState(false);
  const [sent, setSent] = useState(false);

  async function generate() {
    if (!request.trim()) {
      toast.error("Enter the customer request first");
      return;
    }
    setLoading(true);
    setSent(false);
    const text = await think(
      generateReply({ request, tone, customerName: name, v: nextVariant() }),
      1000,
    );
    setOutput(text);
    setEditing(false);
    setLoading(false);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title="INPUT — Customer request" icon={<MessageSquarePlus className="h-4 w-4" />}>
        <div className="space-y-3">
          <Field label="Customer name">
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Customer request">
            <Textarea rows={6} value={request} onChange={(e) => setRequest(e.target.value)} />
          </Field>
          <Field label="Tone">
            <Select value={tone} onValueChange={(v) => setTone(v as Tone)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TONES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Button variant="ai" onClick={generate} disabled={loading} className="w-full">
            <Sparkles className="h-4 w-4" /> Generate reply
          </Button>
        </div>
      </Panel>

      <Panel tone="ai" title="AI OUTPUT — Suggested reply" icon={<Sparkles className="h-4 w-4" />}>
        {loading ? (
          <AiThinking label="Writing a professional reply" />
        ) : !output ? (
          <div className="rounded-xl border border-dashed border-ai/40 p-8 text-center text-sm text-muted-foreground">
            Your generated reply will appear here, fully editable before sending.
          </div>
        ) : (
          <div className="space-y-3">
            <Textarea
              rows={16}
              value={output}
              readOnly={!editing}
              onChange={(e) => setOutput(e.target.value)}
              className={cn(!editing && "bg-panel/70")}
            />
            {sent ? (
              <p className="rounded-lg border border-success/30 bg-success/10 p-2 text-sm text-success">
                Message sent to {name} (simulated).
              </p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={generate}>
                <RefreshCw className="h-4 w-4" /> Regenerate
              </Button>
              <Button variant="outline" size="sm" onClick={() => setEditing((e) => !e)}>
                <Pencil className="h-4 w-4" /> {editing ? "Done editing" : "Edit"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard?.writeText(output);
                  toast.success("Reply copied");
                }}
              >
                <Copy className="h-4 w-4" /> Copy
              </Button>
              <Button
                variant="hero"
                size="sm"
                onClick={() => {
                  setSent(true);
                  toast.success(`Reply sent to ${name}`);
                }}
              >
                <Send className="h-4 w-4" /> Send
              </Button>
            </div>
            <AiDisclaimer />
          </div>
        )}
      </Panel>
    </div>
  );
}

/* -------------------------------- JOB PLAN -------------------------------- */

function JobPlanTool({ initialRequest }: { initialRequest?: string }) {
  const { addJob, addAppointment, customers } = useStore();
  const navigate = useNavigate();
  const [request, setRequest] = useState(
    initialRequest ?? "Hi, my kitchen tap is leaking and the cupboard underneath is getting wet.",
  );
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<JobPlan | null>(null);

  async function generate() {
    setLoading(true);
    const result = await think(generateJobPlan(request, nextVariant()), 1000);
    setPlan(result);
    setLoading(false);
  }

  function addToCalendar() {
    if (!plan) return;
    const job = addJob({
      customerId: customers[0].id,
      service: plan.service,
      title: plan.title,
      description: request,
      status: "Scheduled",
      priority: plan.priority,
      appointmentDate: todayISO(),
      time: "10:00",
      durationMins: plan.durationMins,
      technician: plan.technician,
      amount: 0,
      location: `${customers[0].address}, ${customers[0].suburb}`,
      equipment: plan.equipment,
      notes: plan.notes,
    });
    addAppointment({
      jobId: job.id,
      customerId: customers[0].id,
      title: plan.title,
      service: plan.service,
      date: todayISO(),
      time: "10:00",
      durationMins: plan.durationMins,
      priority: plan.priority,
      location: customers[0].suburb,
      notes: plan.notes,
    });
    toast.success("Job created and added to the calendar");
    navigate({ to: "/schedule" });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title="INPUT — Request or job description" icon={<Wrench className="h-4 w-4" />}>
        <Field label="Describe the work">
          <Textarea rows={8} value={request} onChange={(e) => setRequest(e.target.value)} />
        </Field>
        <Button variant="ai" onClick={generate} disabled={loading} className="mt-3 w-full">
          <Sparkles className="h-4 w-4" /> Generate job plan
        </Button>
      </Panel>

      <Panel tone="ai" title="AI OUTPUT — Structured job card" icon={<ClipboardCheck className="h-4 w-4" />}>
        {loading ? (
          <AiThinking label="Building the job card" />
        ) : !plan ? (
          <div className="rounded-xl border border-dashed border-ai/40 p-8 text-center text-sm text-muted-foreground">
            The structured job card will appear here.
          </div>
        ) : (
          <div className="space-y-3">
            <div className="rounded-xl border border-border/70 bg-panel/80 p-3">
              <p className="text-xs text-muted-foreground uppercase">Job title</p>
              <p className="font-semibold">{plan.title}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-border/70 bg-panel/80 p-3">
                <p className="text-xs text-muted-foreground uppercase">Service</p>
                <p className="mt-1 text-sm font-semibold">{plan.service}</p>
              </div>
              <div className="rounded-xl border border-border/70 bg-panel/80 p-3">
                <p className="text-xs text-muted-foreground uppercase">Priority</p>
                <p className="mt-1">
                  <PriorityBadge priority={plan.priority} />
                </p>
              </div>
              <div className="rounded-xl border border-border/70 bg-panel/80 p-3">
                <p className="text-xs text-muted-foreground uppercase">Duration</p>
                <p className="mt-1 text-sm font-semibold">{plan.durationMins} min</p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border/70 bg-panel/80 p-3">
                <p className="text-xs text-muted-foreground uppercase">Required equipment</p>
                <ul className="mt-1 space-y-1 text-sm">
                  {plan.equipment.map((e) => (
                    <li key={e}>• {e}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-border/70 bg-panel/80 p-3">
                <p className="text-xs text-muted-foreground uppercase">Suggested materials</p>
                <ul className="mt-1 space-y-1 text-sm">
                  {plan.materials.map((e) => (
                    <li key={e}>• {e}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="rounded-xl border border-border/70 bg-panel/80 p-3">
              <p className="text-xs text-muted-foreground uppercase">Recommended technician</p>
              <p className="mt-1 text-sm font-semibold">{plan.technician}</p>
              <p className="mt-2 text-xs text-muted-foreground">{plan.notes}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="hero" size="sm" onClick={addToCalendar}>
                <CalendarPlus className="h-4 w-4" /> Add to calendar
              </Button>
              <Button variant="outline" size="sm" onClick={generate}>
                <RefreshCw className="h-4 w-4" /> Regenerate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate({ to: "/quotes", search: { from: "jobplan" } })}
              >
                Generate quote
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">{SAFETY_NOTE}</p>
            <AiDisclaimer />
          </div>
        )}
      </Panel>
    </div>
  );
}

/* ------------------------------ DAILY PLANNER ----------------------------- */

function DailyPlannerTool() {
  const { jobs, addAppointment } = useStore();
  const [start, setStart] = useState("08:00");
  const [end, setEnd] = useState("17:00");
  const [travel, setTravel] = useState(30);
  const [personal, setPersonal] = useState("Collect materials at supplier, Bank deposit");
  const [selected, setSelected] = useState<string[]>(
    jobs.filter((j) => j.status !== "Completed" && j.status !== "Cancelled").slice(0, 5).map((j) => j.id),
  );
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<{ blocks: PlanBlock[]; overflow: string[]; summary: string } | null>(
    null,
  );
  const [editing, setEditing] = useState(false);

  const candidates = jobs.filter((j) => j.status !== "Completed" && j.status !== "Cancelled");

  async function generate() {
    setLoading(true);
    const result = await think(
      generateDailyPlan({
        jobs: candidates.filter((j) => selected.includes(j.id)),
        startTime: start,
        endTime: end,
        travelMins: travel,
        personalTasks: personal,
        v: nextVariant(),
      }),
      1100,
    );
    setPlan(result);
    setLoading(false);
  }

  const kindTone: Record<PlanBlock["kind"], string> = {
    job: "border-primary/40 bg-primary/10",
    travel: "border-border bg-panel/70",
    break: "border-gold/30 bg-gold/10",
    admin: "border-ai/30 bg-ai/10",
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
      <Panel title="INPUT — Today's constraints" icon={<Timer className="h-4 w-4" />}>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start of day">
              <Input type="time" value={start} onChange={(e) => setStart(e.target.value)} />
            </Field>
            <Field label="End of day">
              <Input type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
            </Field>
          </div>
          <Field label="Travel time between jobs (minutes)">
            <Input
              type="number"
              min={0}
              value={travel}
              onChange={(e) => setTravel(Number(e.target.value))}
            />
          </Field>
          <Field label="Personal tasks (comma separated)">
            <Input value={personal} onChange={(e) => setPersonal(e.target.value)} />
          </Field>
          <div>
            <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Jobs to include
            </p>
            <ul className="space-y-2">
              {candidates.map((j) => (
                <li key={j.id}>
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border/70 bg-panel/70 p-3">
                    <input
                      type="checkbox"
                      checked={selected.includes(j.id)}
                      onChange={(e) =>
                        setSelected((prev) =>
                          e.target.checked ? [...prev, j.id] : prev.filter((id) => id !== j.id),
                        )
                      }
                      className="h-4 w-4 accent-[var(--primary)]"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{j.title}</span>
                      <span className="block text-xs text-muted-foreground">
                        {j.durationMins} min · {j.location.split(",").slice(-1)[0].trim()}
                      </span>
                    </span>
                    <PriorityBadge priority={j.priority} />
                  </label>
                </li>
              ))}
            </ul>
          </div>
          <Button variant="ai" className="w-full" onClick={generate} disabled={loading}>
            <Sparkles className="h-4 w-4" /> Generate optimised schedule
          </Button>
        </div>
      </Panel>

      <Panel tone="ai" title="AI OUTPUT — Optimised day plan" icon={<Sparkles className="h-4 w-4" />}>
        {loading ? (
          <AiThinking label="Optimising your day around urgency and travel" />
        ) : !plan ? (
          <div className="rounded-xl border border-dashed border-ai/40 p-8 text-center text-sm text-muted-foreground">
            Set your working hours and jobs, then generate a time-blocked plan.
          </div>
        ) : (
          <div className="space-y-3">
            <p className="rounded-lg border border-success/30 bg-success/10 p-3 text-sm text-success">
              {plan.summary}
            </p>
            <ul className="space-y-2">
              {plan.blocks.map((b, i) => (
                <li
                  key={i}
                  className={cn(
                    "grid grid-cols-[4rem_minmax(0,1fr)] items-center gap-3 rounded-xl border p-3",
                    kindTone[b.kind],
                  )}
                >
                  <span className="font-display text-sm font-bold">{b.time}</span>
                  {editing ? (
                    <Input
                      value={b.label}
                      onChange={(e) =>
                        setPlan((p) =>
                          p
                            ? {
                                ...p,
                                blocks: p.blocks.map((blk, idx) =>
                                  idx === i ? { ...blk, label: e.target.value } : blk,
                                ),
                              }
                            : p,
                        )
                      }
                    />
                  ) : (
                    <span className="min-w-0 text-sm">{b.label}</span>
                  )}
                </li>
              ))}
            </ul>
            {plan.overflow.length > 0 ? (
              <p className="rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm">
                Could not fit into your working hours: {plan.overflow.join(", ")}. Consider moving these
                to tomorrow.
              </p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={generate}>
                <RefreshCw className="h-4 w-4" /> Regenerate
              </Button>
              <Button variant="outline" size="sm" onClick={() => setEditing((e) => !e)}>
                <Pencil className="h-4 w-4" /> {editing ? "Done editing" : "Edit schedule"}
              </Button>
              <Button
                variant="hero"
                size="sm"
                onClick={() => {
                  plan.blocks
                    .filter((b) => b.kind === "job")
                    .forEach((b) =>
                      addAppointment({
                        title: b.label.split(" — ")[0],
                        service: "Plumbing",
                        date: todayISO(),
                        time: b.time,
                        durationMins: 60,
                        priority: "Medium",
                        location: "Port Elizabeth",
                        notes: "Added by AI Daily Planner",
                      }),
                    );
                  toast.success("Plan added to your calendar");
                }}
              >
                <CalendarPlus className="h-4 w-4" /> Add to calendar
              </Button>
            </div>
            <AiDisclaimer />
          </div>
        )}
      </Panel>
    </div>
  );
}

/* -------------------------------- FOLLOW-UP ------------------------------- */

function FollowUpTool({ jobId }: { jobId?: string }) {
  const { jobs, customerName } = useStore();
  const completed = jobs.filter((j) => j.status === "Completed");
  const [selectedJob, setSelectedJob] = useState(jobId ?? completed[0]?.id ?? "");
  const [tone, setTone] = useState<Tone>("Friendly");
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState("");
  const [editing, setEditing] = useState(false);

  const job = jobs.find((j) => j.id === selectedJob);

  async function generate() {
    if (!job) {
      toast.error("Select a completed job first");
      return;
    }
    setLoading(true);
    const text = await think(
      generateFollowUp({
        customerName: customerName(job.customerId),
        jobTitle: job.title,
        service: job.service,
        tone,
        v: nextVariant(),
      }),
      900,
    );
    setOutput(text);
    setEditing(false);
    setLoading(false);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title="INPUT — Completed job" icon={<ClipboardCheck className="h-4 w-4" />}>
        <div className="space-y-3">
          <Field label="Completed job">
            <Select value={selectedJob} onValueChange={setSelectedJob}>
              <SelectTrigger>
                <SelectValue placeholder="Select a job" />
              </SelectTrigger>
              <SelectContent>
                {completed.map((j) => (
                  <SelectItem key={j.id} value={j.id}>
                    {j.title} — {customerName(j.customerId)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Tone">
            <Select value={tone} onValueChange={(v) => setTone(v as Tone)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(["Friendly", "Professional", "Short"] as Tone[]).map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          {job ? (
            <div className="rounded-xl border border-border/70 bg-panel/70 p-3 text-sm">
              <p className="font-semibold">{job.title}</p>
              <p className="text-xs text-muted-foreground">
                {customerName(job.customerId)} · {job.service} · {zar(job.amount)}
              </p>
              <div className="mt-2">
                <GenericBadge tone="success">Completed</GenericBadge>
              </div>
            </div>
          ) : null}
          <Button variant="ai" className="w-full" onClick={generate} disabled={loading}>
            <Sparkles className="h-4 w-4" /> Generate follow-up
          </Button>
        </div>
      </Panel>

      <Panel tone="ai" title="AI OUTPUT — Follow-up message" icon={<Bot className="h-4 w-4" />}>
        {loading ? (
          <AiThinking label="Writing the follow-up" />
        ) : !output ? (
          <div className="rounded-xl border border-dashed border-ai/40 p-8 text-center text-sm text-muted-foreground">
            Select a completed job and generate a follow-up message.
          </div>
        ) : (
          <div className="space-y-3">
            <Textarea
              rows={9}
              value={output}
              readOnly={!editing}
              onChange={(e) => setOutput(e.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard?.writeText(output);
                  toast.success("Copied");
                }}
              >
                <Copy className="h-4 w-4" /> Copy
              </Button>
              <Button variant="outline" size="sm" onClick={generate}>
                <RefreshCw className="h-4 w-4" /> Regenerate
              </Button>
              <Button variant="outline" size="sm" onClick={() => setEditing((e) => !e)}>
                <Pencil className="h-4 w-4" /> {editing ? "Done editing" : "Edit"}
              </Button>
              <Button variant="hero" size="sm" onClick={() => toast.success("Follow-up sent")}>
                <Send className="h-4 w-4" /> Send
              </Button>
            </div>
            <AiDisclaimer />
          </div>
        )}
      </Panel>
    </div>
  );
}
