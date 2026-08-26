import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Calculator, Copy, FileText, Send, Sparkles, Trash2 } from "lucide-react";
import { AiDisclaimer, AiThinking, Field, GenericBadge, PageHeader, Panel } from "@/components/ui-kit";
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
import { useStore } from "@/lib/store";
import { prettyDate, zar } from "@/lib/format";
import { SERVICES } from "@/lib/demo-data";
import { think, SAFETY_NOTE } from "@/lib/ai";
import type { Quote, ServiceCategory } from "@/lib/types";

export const Route = createFileRoute("/quotes")({
  validateSearch: (search: Record<string, unknown>): { from?: string } => {
    const from = search["from"];
    return typeof from === "string" ? { from } : {};
  },
  head: () => ({
    meta: [
      { title: "Quote Generator — FixMate AI" },
      {
        name: "description",
        content:
          "Build professional quotes in Rands with labour, materials and travel, then send them to the customer.",
      },
      { property: "og:title", content: "AI Quote Generator — FixMate AI" },
      {
        property: "og:description",
        content: "Transparent pricing breakdowns and a polished customer-ready quote.",
      },
    ],
  }),
  component: QuotesPage,
});

const STATUSES: Quote["status"][] = ["Draft", "Sent", "Accepted", "Declined"];

function QuotesPage() {
  const { quotes, customers, customerName, addQuote, updateQuote, deleteQuote } = useStore();
  const [service, setService] = useState<ServiceCategory>("Plumbing");
  const [customerId, setCustomerId] = useState(customers[0]?.id ?? "");
  const [labour, setLabour] = useState(450);
  const [materials, setMaterials] = useState(300);
  const [travel, setTravel] = useState(50);
  const [additional, setAdditional] = useState(0);
  const [notes, setNotes] = useState("Replace kitchen mixer tap and washer set.");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string>("");

  const subtotal = labour + materials + travel + additional;
  const vat = Math.round(subtotal * 0.15);
  const total = subtotal + vat;

  async function generate() {
    setLoading(true);
    const name = customerName(customerId);
    const text = await think(
      `QUOTATION — FixMate Plumbing & Repairs
Prepared for: ${name}
Service: ${service}

Scope of work
${notes || "As discussed with the customer."}

Pricing breakdown
Labour ............... ${zar(labour)}
Materials ............ ${zar(materials)}
Travel / callout ..... ${zar(travel)}
Additional ........... ${zar(additional)}
Subtotal ............. ${zar(subtotal)}
VAT (15%) ............ ${zar(vat)}
TOTAL ................ ${zar(total)}

Terms
• Quote valid for 14 days from ${prettyDate(new Date().toISOString().slice(0, 10))}.
• Price confirmed after on-site inspection; hidden damage may change the final amount.
• Payment on completion via EFT or card. Banking details on the invoice.

Thank you for the opportunity — we look forward to sorting this out for you.
FixMate Plumbing & Repairs · 041 555 0142`,
      1000,
    );
    setPreview(text);
    setLoading(false);
  }

  function save(status: Quote["status"]) {
    const created = addQuote({
      customerId,
      service,
      labour,
      materials,
      travel,
      additional,
      notes,
      status,
    });
    toast.success(`Quote ${created.number} ${status === "Sent" ? "sent" : "saved"}`);
  }

  const quoteTotal = (q: Quote) => q.labour + q.materials + q.travel + q.additional;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quotes"
        subtitle="Generate transparent, professional quotes in South African Rand."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="INPUT — Pricing details" icon={<Calculator className="h-4 w-4" />}>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Customer">
              <Select value={customerId} onValueChange={setCustomerId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Service">
              <Select value={service} onValueChange={(v) => setService(v as ServiceCategory)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SERVICES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Labour (R)">
              <Input type="number" value={labour} onChange={(e) => setLabour(Number(e.target.value))} />
            </Field>
            <Field label="Materials (R)">
              <Input
                type="number"
                value={materials}
                onChange={(e) => setMaterials(Number(e.target.value))}
              />
            </Field>
            <Field label="Travel / callout (R)">
              <Input type="number" value={travel} onChange={(e) => setTravel(Number(e.target.value))} />
            </Field>
            <Field label="Additional charges (R)">
              <Input
                type="number"
                value={additional}
                onChange={(e) => setAdditional(Number(e.target.value))}
              />
            </Field>
            <Field label="Scope of work / notes" className="sm:col-span-2">
              <Textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </Field>
          </div>

          <div className="mt-4 space-y-1 rounded-xl border border-border/70 bg-panel/80 p-3 text-sm">
            <p className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{zar(subtotal)}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-muted-foreground">VAT (15%)</span>
              <span>{zar(vat)}</span>
            </p>
            <p className="flex justify-between border-t border-border/70 pt-1 font-display text-lg font-bold text-gold">
              <span>Total</span>
              <span>{zar(total)}</span>
            </p>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="ai" onClick={generate} disabled={loading}>
              <Sparkles className="h-4 w-4" /> Generate quote
            </Button>
            <Button variant="outline" onClick={() => save("Draft")}>
              Save as draft
            </Button>
            <Button variant="hero" onClick={() => save("Sent")}>
              <Send className="h-4 w-4" /> Save &amp; send
            </Button>
          </div>
        </Panel>

        <Panel tone="ai" title="AI OUTPUT — Customer-ready quote" icon={<FileText className="h-4 w-4" />}>
          {loading ? (
            <AiThinking label="Preparing the quotation" />
          ) : !preview ? (
            <div className="rounded-xl border border-dashed border-ai/40 p-8 text-center text-sm text-muted-foreground">
              Fill in your pricing and generate a formatted quote you can send as-is.
            </div>
          ) : (
            <div className="space-y-3">
              <Textarea rows={20} value={preview} onChange={(e) => setPreview(e.target.value)} />
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard?.writeText(preview);
                    toast.success("Quote copied");
                  }}
                >
                  <Copy className="h-4 w-4" /> Copy
                </Button>
                <Button variant="hero" size="sm" onClick={() => save("Sent")}>
                  <Send className="h-4 w-4" /> Send to customer
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">{SAFETY_NOTE}</p>
              <AiDisclaimer />
            </div>
          )}
        </Panel>
      </div>

      <Panel title="All quotes" description={`${quotes.length} quotes`} icon={<FileText className="h-4 w-4" />}>
        <div className="grid gap-3 md:grid-cols-2">
          {quotes.map((q) => (
            <div key={q.id} className="rounded-xl border border-border/70 bg-panel/70 p-3">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                <div className="min-w-0">
                  <p className="truncate font-semibold">
                    {q.number} · {customerName(q.customerId)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {q.service} · {prettyDate(q.createdAt)}
                  </p>
                </div>
                <GenericBadge
                  tone={
                    q.status === "Accepted"
                      ? "success"
                      : q.status === "Declined"
                        ? "danger"
                        : q.status === "Sent"
                          ? "warning"
                          : "neutral"
                  }
                >
                  {q.status}
                </GenericBadge>
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{q.notes}</p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <span className="font-display text-lg font-bold text-gold">
                  {zar(quoteTotal(q))}
                </span>
                <div className="flex items-center gap-2">
                  <Select
                    value={q.status}
                    onValueChange={(v) => {
                      updateQuote(q.id, { status: v as Quote["status"] });
                      toast.success(`${q.number} marked ${v}`);
                    }}
                  >
                    <SelectTrigger className="h-9 w-[8.5rem]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Delete quote"
                    onClick={() => {
                      deleteQuote(q.id);
                      toast.success(`${q.number} deleted`);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
