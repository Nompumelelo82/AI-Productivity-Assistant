import { createFileRoute, Link } from "@tanstack/react-router";
import { HelpCircle, LifeBuoy, Sparkles } from "lucide-react";
import { PageHeader, Panel } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BUSINESS } from "@/lib/demo-data";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "Help & Support — FixMate AI" },
      {
        name: "description",
        content: "How to use FixMate AI: analysing requests, planning jobs, quoting and following up.",
      },
      { property: "og:title", content: "Help & Support — FixMate AI" },
      { property: "og:description", content: "Short guides for every part of FixMate AI." },
    ],
  }),
  component: HelpPage,
});

const FAQS = [
  {
    q: "How does the Customer Request Analyzer work?",
    a: "Paste any WhatsApp, email or phone enquiry into the analyzer. FixMate AI identifies the service type, urgency, likely equipment, missing information and the best next action. You can then generate a reply, build a job plan, or create the job directly.",
  },
  {
    q: "Are AI answers guaranteed to be correct?",
    a: "No. FixMate AI gives suggestions to save you admin time. Pricing, safety and technical decisions must always be confirmed by a qualified person on site.",
  },
  {
    q: "How is pricing calculated in quotes?",
    a: "You enter labour, materials, travel and any additional charges. FixMate adds 15% VAT and produces a customer-ready quote in Rands, which you can edit before sending.",
  },
  {
    q: "Can I edit anything the AI generates?",
    a: "Yes. Every reply, job plan, schedule and quote is fully editable before you send it or add it to your calendar.",
  },
  {
    q: "Is my data stored anywhere?",
    a: "This demo runs entirely in your browser with sample South African data, so nothing is sent to a server.",
  },
];

function HelpPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Help & Support" subtitle="Everything you need to get value out of FixMate AI." />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Panel title="Frequently asked questions" icon={<HelpCircle className="h-4 w-4" />}>
          <Accordion type="single" collapsible className="w-full">
            {FAQS.map((f, i) => (
              <AccordionItem key={f.q} value={`item-${i}`}>
                <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Panel>

        <div className="space-y-4">
          <Panel tone="ai" title="Ask FixMate AI" icon={<Sparkles className="h-4 w-4" />}>
            <p className="text-sm text-muted-foreground">
              The assistant can answer business questions, prioritise your day and draft customer
              messages.
            </p>
            <Button variant="ai" className="mt-3 w-full" asChild>
              <Link to="/assistant" search={{ tool: "chat" }}>
                Open the assistant
              </Link>
            </Button>
          </Panel>

          <Panel title="Contact support" icon={<LifeBuoy className="h-4 w-4" />}>
            <p className="text-sm">{BUSINESS.phone}</p>
            <p className="text-sm text-muted-foreground">{BUSINESS.email}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Mon–Fri 08:00–17:00 · {BUSINESS.city}
            </p>
          </Panel>
        </div>
      </div>
    </div>
  );
}
