import { useCallback, useEffect, useState, type ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bot,
  Brain,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  FileText,
  Inbox,
  Lightbulb,
  Mail,
  Maximize2,
  MessageSquare,
  Minimize2,
  Receipt,
  Shield,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Wrench,
} from "lucide-react";
import { LogoLockup, LogoMark } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/presentation")({
  head: () => ({
    meta: [
      { title: "FixMate AI Presentation — Problem, Solution & Responsible AI" },
      {
        name: "description",
        content:
          "A five-slide pitch for FixMate AI: the admin problem for South African service businesses, the AI workflow, three AI features, prompt engineering and responsible AI.",
      },
      { property: "og:title", content: "FixMate AI Presentation — Book. Plan. Fix. Done." },
      {
        property: "og:description",
        content:
          "Five-slide project presentation covering problem relevance, prompt engineering, functionality, innovation and responsible AI.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PresentationPage,
});

/* ---------- shared slide primitives ---------- */

function Slide({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "animate-in fade-in slide-in-from-bottom-4 flex h-full w-full flex-col gap-5 duration-500 sm:gap-6",
        className,
      )}
    >
      {children}
    </div>
  );
}

function Kicker({ children }: { children: ReactNode }) {
  return (
    <p className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-[11px] font-bold tracking-[0.18em] text-gold uppercase sm:text-xs">
      <Sparkles className="h-3.5 w-3.5" /> {children}
    </p>
  );
}

function SlideTitle({ children, sub }: { children: ReactNode; sub?: string }) {
  return (
    <div className="space-y-2">
      <h2 className="text-2xl leading-tight font-extrabold sm:text-4xl lg:text-[2.75rem]">
        {children}
      </h2>
      {sub ? (
        <p className="text-base font-semibold text-primary sm:text-lg lg:text-xl">{sub}</p>
      ) : null}
    </div>
  );
}

function Card({
  children,
  className,
  tone = "default",
}: {
  children: ReactNode;
  className?: string;
  tone?: "default" | "ai" | "gold" | "success" | "danger";
}) {
  const tones = {
    default: "border-border/70",
    ai: "border-ai/40 bg-ai/5",
    gold: "border-gold/35 bg-gold/5",
    success: "border-success/35 bg-success/5",
    danger: "border-destructive/35 bg-destructive/5",
  } as const;
  return (
    <div className={cn("glass-panel rounded-2xl p-4 sm:p-5", tones[tone], className)}>
      {children}
    </div>
  );
}

function IconBubble({
  icon,
  tone = "primary",
}: {
  icon: ReactNode;
  tone?: "primary" | "gold" | "ai" | "success" | "danger";
}) {
  const tones = {
    primary: "gradient-primary text-primary-foreground",
    gold: "gradient-gold text-gold-foreground",
    ai: "gradient-ai text-ai-foreground",
    success: "bg-success/20 text-success",
    danger: "bg-destructive/20 text-destructive",
  } as const;
  return (
    <span
      className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl shadow-lg", tones[tone])}
    >
      {icon}
    </span>
  );
}

function FlowChain({
  steps,
  tone = "primary",
  className,
}: {
  steps: string[];
  tone?: "primary" | "ai" | "gold";
  className?: string;
}) {
  const chip = {
    primary: "border-primary/35 bg-primary/10 text-foreground",
    ai: "border-ai/35 bg-ai/10 text-foreground",
    gold: "border-gold/35 bg-gold/10 text-foreground",
  } as const;
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <span
            className={cn(
              "rounded-xl border px-3 py-1.5 text-xs font-semibold whitespace-nowrap sm:text-sm",
              chip[tone],
            )}
          >
            {s}
          </span>
          {i < steps.length - 1 ? (
            <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          ) : null}
        </div>
      ))}
    </div>
  );
}

/* ---------- slide 1 ---------- */

const PROBLEMS = [
  {
    icon: <ClipboardList className="h-5 w-5" />,
    title: "Too much administration",
    body: "Quotes, invoices, notes and diaries handled by hand after hours.",
  },
  {
    icon: <Clock className="h-5 w-5" />,
    title: "Slow customer responses",
    body: "Leads go cold while the owner is on a roof or under a sink.",
  },
  {
    icon: <CalendarClock className="h-5 w-5" />,
    title: "Difficult job scheduling",
    body: "Urgency, travel time and job length juggled in one head.",
  },
  {
    icon: <AlertTriangle className="h-5 w-5" />,
    title: "Missed follow-ups",
    body: "Quotes never chased, repeat work and referrals quietly lost.",
  },
];

function SlideProblem() {
  return (
    <Slide>
      <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr] lg:items-start">
        <div className="space-y-4">
          <Kicker>Slide 1 — The Problem</Kicker>
          <SlideTitle sub="Meet FixMate AI">
            Small Businesses Should Be Fixing — Not Fighting Admin.
          </SlideTitle>
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
            Plumbing, electrical, painting, handyman and general home-repair businesses in South
            Africa run on one or two people. Every hour spent on admin is an hour not billed.
          </p>
          <Card tone="gold" className="glow-ring">
            <p className="text-sm font-semibold sm:text-lg">
              “Many small service businesses lose valuable time managing the work{" "}
              <span className="text-gradient-gold">around</span> the job instead of doing the job
              itself.”
            </p>
          </Card>
        </div>

        <Card className="flex flex-col items-center gap-3 text-center">
          <LogoLockup className="max-w-[190px]" />
          <p className="text-xs font-bold tracking-[0.28em] text-gold uppercase">
            Book • Plan • Fix • Done
          </p>
        </Card>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {PROBLEMS.map((p, i) => (
          <Card key={p.title} className="space-y-2">
            <div className="flex items-center gap-3">
              <IconBubble icon={p.icon} tone={i % 2 === 0 ? "primary" : "gold"} />
              <p className="text-2xl font-extrabold text-muted-foreground/50">
                {String(i + 1).padStart(2, "0")}
              </p>
            </div>
            <p className="text-sm font-bold sm:text-base">{p.title}</p>
            <p className="text-xs text-muted-foreground sm:text-sm">{p.body}</p>
          </Card>
        ))}
      </div>

      <Card tone="ai" className="space-y-3">
        <p className="text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase">
          Today: six disconnected steps
        </p>
        <FlowChain
          tone="ai"
          steps={[
            "Customer request",
            "Messages",
            "Quotes",
            "Scheduling",
            "Follow-ups",
            "Business admin",
          ]}
        />
        <p className="text-sm font-bold sm:text-lg">
          FixMate AI brings the <span className="text-primary">entire workflow</span> together.
        </p>
      </Card>
    </Slide>
  );
}

/* ---------- slide 2 ---------- */

const WORKFLOW = [
  "Customer request",
  "AI analysis",
  "Customer reply",
  "Job plan",
  "Quote",
  "Schedule",
  "Completed job",
  "Follow-up",
  "Business insight",
];

const HELPS = [
  "Organise customer requests",
  "Generate professional responses",
  "Plan jobs",
  "Create quotes",
  "Schedule appointments",
  "Follow up with customers",
  "Understand business performance",
];

function SlideSolution() {
  return (
    <Slide>
      <div className="space-y-3">
        <Kicker>Slide 2 — The Solution</Kicker>
        <SlideTitle>One AI Assistant. The Whole Workflow.</SlideTitle>
        <p className="max-w-3xl text-sm text-muted-foreground sm:text-base">
          FixMate AI is an AI-powered productivity platform for small service businesses — a
          dashboard, sidebar navigation and connected AI tools in one responsive app.
        </p>
      </div>

      <Card className="glow-ring flex-1">
        <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-3">
          {WORKFLOW.map((step, i) => (
            <div
              key={step}
              className={cn(
                "flex items-center gap-3 rounded-xl border p-3 transition-colors",
                i === 1
                  ? "border-ai/50 bg-ai/10"
                  : i === WORKFLOW.length - 1
                    ? "border-gold/40 bg-gold/10"
                    : "border-border/70 bg-panel/60",
              )}
            >
              <span
                className={cn(
                  "grid h-8 w-8 shrink-0 place-items-center rounded-lg text-xs font-extrabold",
                  i === 1
                    ? "gradient-ai text-ai-foreground"
                    : i === WORKFLOW.length - 1
                      ? "gradient-gold text-gold-foreground"
                      : "gradient-primary text-primary-foreground",
                )}
              >
                {i + 1}
              </span>
              <span className="text-sm font-semibold sm:text-base">{step}</span>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-3 lg:grid-cols-[1.2fr_1fr]">
        <Card className="space-y-3">
          <p className="text-sm font-bold sm:text-base">FixMate AI helps businesses:</p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {HELPS.map((h) => (
              <li key={h} className="flex items-start gap-2 text-xs text-foreground sm:text-sm">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                {h}
              </li>
            ))}
          </ul>
        </Card>
        <Card tone="gold" className="flex items-center gap-3">
          <IconBubble icon={<Bot className="h-5 w-5" />} tone="gold" />
          <p className="text-sm font-extrabold sm:text-lg">
            AI handles the admin, so the business owner can focus on{" "}
            <span className="text-gradient-gold">the work</span>.
          </p>
        </Card>
      </div>
    </Slide>
  );
}

/* ---------- slide 3 ---------- */

const FEATURES = [
  {
    tag: "Feature 1 — Smart Email Generator",
    title: "AI Customer Reply Generator",
    icon: <Mail className="h-5 w-5" />,
    tone: "primary" as const,
    items: [
      "Professional customer emails & messages",
      "Tones: friendly, professional, short, apologetic, urgent",
      "Fully editable AI output",
      "Copy or send in one click",
    ],
  },
  {
    tag: "Feature 2 — AI Task Planner / Scheduler",
    title: "AI Job Planner",
    icon: <CalendarClock className="h-5 w-5" />,
    tone: "gold" as const,
    items: [
      "Prioritises jobs by urgency",
      "Estimates job duration",
      "Accounts for travel time",
      "Builds daily schedules and adds to calendar",
    ],
  },
  {
    tag: "Feature 3 — AI Chatbot Interface",
    title: "FixMate AI Assistant",
    icon: <Bot className="h-5 w-5" />,
    tone: "ai" as const,
    items: [
      "Answers business questions",
      "Helps prioritise jobs and plan the workday",
      "Generates customer messages and quotes",
      "Creates follow-ups",
    ],
  },
];

const EXTRAS = [
  { label: "Customer Request Analyzer", icon: <Inbox className="h-4 w-4" /> },
  { label: "Quote Generator", icon: <FileText className="h-4 w-4" /> },
  { label: "Job Management", icon: <Wrench className="h-4 w-4" /> },
  { label: "Customer Management", icon: <Users className="h-4 w-4" /> },
  { label: "Calendar", icon: <CalendarClock className="h-4 w-4" /> },
  { label: "Messages", icon: <MessageSquare className="h-4 w-4" /> },
  { label: "Invoices & Payments", icon: <Receipt className="h-4 w-4" /> },
  { label: "Business Reports", icon: <BarChart3 className="h-4 w-4" /> },
];

function SlideFeatures() {
  return (
    <Slide>
      <div className="space-y-3">
        <Kicker>Slide 3 — AI Features &amp; Functionality</Kicker>
        <SlideTitle>Three AI Features. One Connected Experience.</SlideTitle>
      </div>

      <div className="grid flex-1 gap-3 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <Card
            key={f.title}
            tone={f.tone === "primary" ? "default" : f.tone}
            className="glow-ring space-y-3"
          >
            <div className="flex items-center gap-3">
              <IconBubble icon={f.icon} tone={f.tone} />
              <p className="text-[10px] font-bold tracking-[0.14em] text-muted-foreground uppercase sm:text-[11px]">
                {f.tag}
              </p>
            </div>
            <p className="text-lg font-extrabold sm:text-xl">{f.title}</p>
            <ul className="space-y-2">
              {f.items.map((it) => (
                <li key={it} className="flex items-start gap-2 text-xs text-muted-foreground sm:text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  <span className="text-foreground/90">{it}</span>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      <Card className="space-y-3">
        <p className="flex items-center gap-2 text-sm font-extrabold sm:text-base">
          <Sparkles className="h-4 w-4 text-gold" /> Beyond the minimum requirement
        </p>
        <div className="flex flex-wrap gap-2">
          {EXTRAS.map((e) => (
            <span
              key={e.label}
              className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold sm:text-sm"
            >
              {e.icon}
              {e.label}
            </span>
          ))}
        </div>
      </Card>
    </Slide>
  );
}

/* ---------- slide 4 ---------- */

const PROMPT_STACK = [
  "Role",
  "Context",
  "User input",
  "Task",
  "Output format",
  "Tone",
  "Safety constraints",
];

const PRINCIPLES = [
  "Human review before sending AI-generated content",
  "AI suggestions can always be edited",
  "Clear AI-generated content disclaimer",
  "AI does not replace qualified professionals",
  "Technical and safety decisions require human expertise",
];

function SlidePrompting() {
  return (
    <Slide>
      <div className="space-y-3">
        <Kicker>Slide 4 — Prompt Engineering &amp; Responsible AI</Kicker>
        <SlideTitle>Making AI Useful — Not Just Impressive.</SlideTitle>
      </div>

      <div className="grid flex-1 gap-3 lg:grid-cols-2">
        <Card className="space-y-3">
          <div className="flex items-center gap-3">
            <IconBubble icon={<Brain className="h-5 w-5" />} tone="primary" />
            <p className="text-lg font-extrabold sm:text-xl">Prompt Engineering</p>
          </div>
          <div className="grid gap-1.5 sm:grid-cols-2">
            {PROMPT_STACK.map((s, i) => (
              <div
                key={s}
                className="flex items-center gap-2 rounded-lg border border-primary/25 bg-primary/10 px-3 py-1.5"
              >
                <span className="text-[10px] font-extrabold text-primary">{i + 1}</span>
                <span className="text-xs font-semibold sm:text-sm">{s}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground sm:text-sm">
            FixMate AI uses structured prompts so responses are relevant, consistent and useful for
            service-business workflows.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-xl border border-border/70 bg-panel/70 p-3">
              <p className="text-[10px] font-bold tracking-[0.14em] text-muted-foreground uppercase">
                User input
              </p>
              <p className="mt-1 text-xs sm:text-sm">
                “My kitchen tap is leaking and the cupboard underneath is getting wet.”
              </p>
            </div>
            <div className="rounded-xl border border-ai/40 bg-ai/10 p-3">
              <p className="text-[10px] font-bold tracking-[0.14em] text-ai uppercase">AI output</p>
              <dl className="mt-1 space-y-0.5 text-xs sm:text-sm">
                {[
                  ["Service", "Plumbing"],
                  ["Problem", "Kitchen tap leak"],
                  ["Urgency", "High"],
                  ["Info needed", "Photo of the leak"],
                  ["Action", "Schedule an inspection"],
                ].map(([k, v]) => (
                  <div key={k} className="flex gap-2">
                    <dt className="w-24 shrink-0 text-muted-foreground">{k}</dt>
                    <dd className="font-semibold">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </Card>

        <Card tone="gold" className="glow-ring space-y-3">
          <div className="flex items-center gap-3">
            <IconBubble icon={<ShieldCheck className="h-5 w-5" />} tone="gold" />
            <p className="text-lg font-extrabold sm:text-xl">Responsible AI</p>
          </div>
          <ul className="space-y-2">
            {PRINCIPLES.map((p) => (
              <li
                key={p}
                className="flex items-start gap-2 rounded-xl border border-success/30 bg-success/5 px-3 py-2 text-xs sm:text-sm"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                <span className="font-semibold">{p}</span>
              </li>
            ))}
          </ul>
          <div className="flex gap-2 rounded-xl border border-ai/40 bg-ai/10 p-3">
            <Shield className="mt-0.5 h-4 w-4 shrink-0 text-ai" />
            <p className="text-xs leading-relaxed sm:text-sm">
              <span className="font-bold">Disclaimer: </span>
              AI-generated suggestions are provided as assistance and should be reviewed by the
              business owner before being sent to customers or used for pricing, scheduling or
              technical decisions.
            </p>
          </div>
        </Card>
      </div>
    </Slide>
  );
}

/* ---------- slide 5 ---------- */

const BEFORE = [
  "Customer messages everywhere",
  "Manual scheduling",
  "Manual quotes",
  "Missed follow-ups",
  "Scattered information",
];

const AFTER = [
  "AI-assisted workflow",
  "Organised jobs",
  "Faster customer responses",
  "Professional quotes",
  "Better follow-ups",
  "Business insights",
];

const EVAL = [
  {
    icon: <Target className="h-5 w-5" />,
    title: "Problem relevance",
    body: "Solves real administrative problems for small service businesses.",
    tone: "primary" as const,
  },
  {
    icon: <Brain className="h-5 w-5" />,
    title: "Prompt engineering",
    body: "Uses structured prompts for reliable AI workflows.",
    tone: "ai" as const,
  },
  {
    icon: <Wrench className="h-5 w-5" />,
    title: "Functionality",
    body: "Interactive AI tools and connected business workflows.",
    tone: "primary" as const,
  },
  {
    icon: <Lightbulb className="h-5 w-5" />,
    title: "Innovation",
    body: "Combines AI assistance with the complete service-business journey.",
    tone: "gold" as const,
  },
  {
    icon: <ShieldCheck className="h-5 w-5" />,
    title: "Responsible AI",
    body: "Human review, editable outputs and clear AI limitations.",
    tone: "success" as const,
  },
];

function SlideImpact() {
  return (
    <Slide>
      <div className="space-y-3">
        <Kicker>Slide 5 — Innovation &amp; Impact</Kicker>
        <SlideTitle>From Admin Overload to Business Control.</SlideTitle>
      </div>

      <div className="grid items-stretch gap-3 lg:grid-cols-[1fr_auto_1fr]">
        <Card tone="danger" className="space-y-2">
          <p className="text-xs font-bold tracking-[0.18em] text-destructive uppercase">
            Before FixMate
          </p>
          <ul className="space-y-1.5">
            {BEFORE.map((b) => (
              <li key={b} className="text-xs text-muted-foreground sm:text-sm">
                — {b}
              </li>
            ))}
          </ul>
        </Card>
        <div className="grid place-items-center">
          <span className="gradient-primary grid h-11 w-11 place-items-center rounded-full text-primary-foreground shadow-lg">
            <ArrowRight className="h-5 w-5" />
          </span>
        </div>
        <Card tone="success" className="space-y-2">
          <p className="text-xs font-bold tracking-[0.18em] text-success uppercase">
            After FixMate
          </p>
          <ul className="space-y-1.5">
            {AFTER.map((a) => (
              <li key={a} className="flex items-start gap-2 text-xs sm:text-sm">
                <TrendingUp className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                {a}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid flex-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {EVAL.map((e) => (
          <Card key={e.title} className="space-y-2">
            <IconBubble icon={e.icon} tone={e.tone} />
            <p className="text-sm font-extrabold sm:text-base">{e.title}</p>
            <p className="text-xs text-muted-foreground">{e.body}</p>
          </Card>
        ))}
      </div>

      <Card tone="gold" className="glow-ring grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-muted-foreground sm:text-lg">
            FixMate AI doesn’t replace the business owner.
          </p>
          <p className="text-xl leading-tight font-extrabold sm:text-3xl">
            IT MAKES THE BUSINESS OWNER{" "}
            <span className="text-gradient-gold">MORE PRODUCTIVE.</span>
          </p>
        </div>
        <div className="flex items-center gap-3 sm:flex-col sm:text-center">
          <LogoMark className="h-14 w-14" />
          <div>
            <p className="font-display text-lg font-extrabold">FIXMATE AI</p>
            <p className="text-[11px] font-bold tracking-[0.24em] text-gold uppercase">
              Book • Plan • Fix • Done
            </p>
          </div>
        </div>
      </Card>
    </Slide>
  );
}

/* ---------- deck shell ---------- */

const SLIDES = [
  { id: "problem", label: "The Problem", render: () => <SlideProblem /> },
  { id: "solution", label: "The Solution", render: () => <SlideSolution /> },
  { id: "features", label: "AI Features", render: () => <SlideFeatures /> },
  { id: "responsible", label: "Prompt Engineering & Responsible AI", render: () => <SlidePrompting /> },
  { id: "impact", label: "Innovation & Impact", render: () => <SlideImpact /> },
];

function PresentationPage() {
  const [index, setIndex] = useState(0);
  const [presenting, setPresenting] = useState(false);
  const total = SLIDES.length;

  const next = useCallback(() => setIndex((i) => Math.min(i + 1, total - 1)), [total]);
  const prev = useCallback(() => setIndex((i) => Math.max(i - 1, 0)), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        prev();
      } else if (e.key === "Home") {
        setIndex(0);
      } else if (e.key === "End") {
        setIndex(total - 1);
      } else if (e.key === "Escape") {
        setPresenting(false);
      } else if (e.key.toLowerCase() === "f") {
        setPresenting((p) => !p);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, total]);

  useEffect(() => {
    if (!presenting) return;
    document.documentElement.requestFullscreen?.().catch(() => {});
    return () => {
      if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    };
  }, [presenting]);

  const current = SLIDES[index]!;

  const deck = (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div key={current.id} className="min-h-0 flex-1">
        {current.render()}
      </div>

      <div className="glass-panel flex flex-wrap items-center justify-between gap-3 rounded-2xl px-3 py-2.5">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={prev} disabled={index === 0}>
            <ChevronLeft className="h-4 w-4" /> Previous
          </Button>
          <Button variant="hero" size="sm" onClick={next} disabled={index === total - 1}>
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {SLIDES.map((s, i) => (
            <button
              key={s.id}
              aria-label={`Go to slide ${i + 1}: ${s.label}`}
              onClick={() => setIndex(i)}
              className={cn(
                "h-2 rounded-full transition-all",
                i === index ? "gradient-gold w-8" : "w-2.5 bg-muted hover:bg-accent",
              )}
            />
          ))}
        </div>

        <div className="flex items-center gap-3">
          <p className="text-sm font-bold whitespace-nowrap">
            <span className="text-gold">{index + 1}</span>
            <span className="text-muted-foreground"> / {total}</span>
          </p>
          <Button variant="outline" size="sm" onClick={() => setPresenting((p) => !p)}>
            {presenting ? (
              <>
                <Minimize2 className="h-4 w-4" /> Exit
              </>
            ) : (
              <>
                <Maximize2 className="h-4 w-4" /> Present
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );

  if (presenting) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col gap-4 overflow-y-auto bg-background bg-[image:var(--gradient-app)] p-4 sm:p-8">
        {deck}
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Project Presentation</h1>
          <p className="text-sm text-muted-foreground">
            Five slides · {current.label} · use ← → keys, or press F for presentation mode
          </p>
        </div>
        <LogoMark className="h-11 w-11" />
      </div>
      {deck}
    </div>
  );
}
