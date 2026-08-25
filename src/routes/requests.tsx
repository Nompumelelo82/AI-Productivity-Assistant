import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowRight,
  ClipboardList,
  Inbox,
  ListChecks,
  Send,
  Sparkles,
  Wrench,
} from "lucide-react";
import { PageHeader, Panel, AiDisclaimer, AiThinking, GenericBadge, PriorityBadge, Field } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/store";
import { analyzeRequest, nextVariant, think, SAFETY_NOTE, type RequestAnalysis } from "@/lib/ai";
import { addDaysISO } from "@/lib/format";

export const Route = createFileRoute("/requests")({
  validateSearch: (search: Record<string, unknown>) => ({
    from: typeof search.from === "string" ? search.from : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Customer Request Analyzer — FixMate AI" },
      {
        name: "description",
        content:
          "Paste a messy customer request and FixMate AI extracts the service, urgency, equipment and next action.",
      },
      { property: "og:title", content: "AI Customer Request Analyzer" },
      {
        property: "og:description",
        content: "Turn WhatsApp and email enquiries into structured, schedulable jobs.",
      },
    ],
  }),
  component: RequestsPage,
});

function RequestsPage() {
  const { requests, markRequestHandled, addJob, customers, customerById } = useStore();
  const navigate = useNavigate();
  const [input, setInput] = useState(requests[1]?.body ?? "");
  const [activeRequestId, setActiveRequestId] = useState<string | undefined>(requests[1]?.id);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<RequestAnalysis | null>(null);

  const activeRequest = requests.find((r) => r.id === activeRequestId);

  async function run() {
    if (!input.trim()) {
      toast.error("Paste a customer request first");
      return;
    }
    setLoading(true);
    setAnalysis(null);
    const result = await think(analyzeRequest(input, nextVariant()), 1100);
    setAnalysis(result);
    setLoading(false);
    toast.success("Request analysed");
  }

  function createJob() {
    if (!analysis) return;
    const customer =
      customerById(activeRequest?.customerId) ??
      customers.find((c) => c.name === activeRequest?.customerName);
    const job = addJob({
      customerId: customer?.id ?? customers[0].id,
      service: analysis.service,
      title: analysis.issue.replace(/^.*?:\s*/, "").slice(0, 60),
      description: input,
      status: "New",
      priority: analysis.urgency,
      appointmentDate: addDaysISO(analysis.urgency === "Urgent" ? 0 : 2),
      time: analysis.urgency === "Urgent" ? "08:00" : "10:00",
      durationMins: analysis.durationMins,
      technician: "Sipho Mabaso",
      amount: 0,
      location: `${customer?.address ?? "To confirm"}, ${customer?.suburb ?? "Port Elizabeth"}`,
      equipment: analysis.equipment,
      notes: analysis.nextAction,
    });
    if (activeRequest) markRequestHandled(activeRequest.id);
    toast.success(`Job ${job.reference} created`);
    navigate({ to: "/jobs", search: { filter: "all" } });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Request Analyzer"
        subtitle="Paste any messy WhatsApp, email or phone enquiry — FixMate AI structures it into an actionable job."
        actions={
          <Button asChild variant="outline">
            <Link to="/assistant" search={{ tool: "reply" }}>
              <Send className="h-4 w-4" /> Reply generator
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-4">
          <Panel title="Incoming requests" description="Tap one to load it" icon={<Inbox className="h-4 w-4" />}>
            <ul className="space-y-2">
              {requests.map((r) => (
                <li key={r.id}>
                  <button
                    onClick={() => {
                      setActiveRequestId(r.id);
                      setInput(r.body);
                      setAnalysis(null);
                    }}
                    className={`w-full rounded-xl border p-3 text-left transition-colors ${
                      activeRequestId === r.id
                        ? "border-primary bg-primary/10"
                        : "border-border/70 bg-panel/70 hover:border-primary/40"
                    }`}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-semibold">{r.customerName}</span>
                      <GenericBadge tone={r.handled ? "success" : "warning"}>
                        {r.handled ? "Handled" : r.channel}
                      </GenericBadge>
                    </span>
                    <span className="mt-1 block line-clamp-2 text-xs text-muted-foreground">
                      {r.body}
                    </span>
                    <span className="mt-1 block text-[11px] text-muted-foreground">{r.receivedAt}</span>
                  </button>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="INPUT — Customer request" icon={<ClipboardList className="h-4 w-4" />}>
            <Field label="Raw customer message">
              <Textarea
                rows={6}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Hi, my kitchen tap is leaking and the cupboard underneath is getting wet."
              />
            </Field>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="ai" onClick={run} disabled={loading}>
                <Sparkles className="h-4 w-4" /> {analysis ? "Re-analyse" : "Analyse request"}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setInput("");
                  setAnalysis(null);
                }}
              >
                Clear
              </Button>
            </div>
          </Panel>
        </div>

        <Panel
          tone="ai"
          title="AI OUTPUT — Structured analysis"
          description="Review before acting"
          icon={<Sparkles className="h-4 w-4" />}
        >
          {loading ? (
            <AiThinking label="Analysing the customer request" />
          ) : !analysis ? (
            <div className="rounded-xl border border-dashed border-ai/40 p-8 text-center text-sm text-muted-foreground">
              Load or paste a request, then press <span className="font-semibold">Analyse request</span>.
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-border/70 bg-panel/80 p-3">
                  <p className="text-xs text-muted-foreground uppercase">Service category</p>
                  <p className="mt-1 font-semibold">{analysis.service}</p>
                </div>
                <div className="rounded-xl border border-border/70 bg-panel/80 p-3">
                  <p className="text-xs text-muted-foreground uppercase">Urgency</p>
                  <p className="mt-1">
                    <PriorityBadge priority={analysis.urgency} />
                  </p>
                </div>
                <div className="rounded-xl border border-border/70 bg-panel/80 p-3 sm:col-span-2">
                  <p className="text-xs text-muted-foreground uppercase">Problem</p>
                  <p className="mt-1 text-sm">{analysis.issue}</p>
                </div>
                <div className="rounded-xl border border-border/70 bg-panel/80 p-3">
                  <p className="text-xs text-muted-foreground uppercase">Possible equipment</p>
                  <ul className="mt-1 space-y-1 text-sm">
                    {analysis.equipment.map((e) => (
                      <li key={e} className="flex gap-2">
                        <Wrench className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" /> {e}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl border border-border/70 bg-panel/80 p-3">
                  <p className="text-xs text-muted-foreground uppercase">Information still needed</p>
                  <ul className="mt-1 space-y-1 text-sm">
                    {analysis.missingInfo.map((e) => (
                      <li key={e} className="flex gap-2">
                        <ListChecks className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" /> {e}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl border border-success/30 bg-success/10 p-3 sm:col-span-2">
                  <p className="text-xs text-success uppercase">Recommended next action</p>
                  <p className="mt-1 text-sm">{analysis.nextAction}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Indicative range for this type of work: {analysis.estimateRange} (confirm after inspection).
                  </p>
                </div>
                {analysis.riskFlag ? (
                  <div className="flex gap-2 rounded-xl border border-warning/40 bg-warning/10 p-3 sm:col-span-2">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                    <p className="text-sm">{analysis.riskFlag}</p>
                  </div>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="hero"
                  onClick={() =>
                    navigate({
                      to: "/assistant",
                      search: { tool: "reply", request: input, customer: activeRequest?.customerName },
                    })
                  }
                >
                  Generate customer reply <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    navigate({
                      to: "/assistant",
                      search: { tool: "jobplan", request: input },
                    })
                  }
                >
                  Create job plan
                </Button>
                <Button variant="gold" onClick={createJob}>
                  <Wrench className="h-4 w-4" /> Create job
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">{SAFETY_NOTE}</p>
              <AiDisclaimer />
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
