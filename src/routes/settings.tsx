import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Building2, CreditCard, Sparkles } from "lucide-react";
import { Field, GenericBadge, PageHeader, Panel } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BUSINESS } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

const TABS = ["business", "ai", "billing"] as const;
type Tab = (typeof TABS)[number];

export const Route = createFileRoute("/settings")({
  validateSearch: (search: Record<string, unknown>): { tab: Tab } => {
    const tab = search["tab"];
    return { tab: (TABS as readonly string[]).includes(String(tab)) ? (tab as Tab) : "business" };
  },
  head: () => ({
    meta: [
      { title: "Settings — FixMate AI" },
      {
        name: "description",
        content: "Manage your business details, AI preferences and FixMate plan.",
      },
      { property: "og:title", content: "Settings — FixMate AI" },
      { property: "og:description", content: "Business profile, AI tone defaults and billing options." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { tab } = Route.useSearch();
  const navigate = useNavigate();
  const [business, setBusiness] = useState({
    name: BUSINESS.name,
    owner: BUSINESS.owner,
    phone: BUSINESS.phone,
    email: BUSINESS.email,
    city: BUSINESS.city,
    hours: "Mon–Fri 08:00–17:00, Sat 08:00–13:00",
    callout: "150",
    hourly: "450",
  });
  const [aiNotes, setAiNotes] = useState(
    "Always mention that final pricing is confirmed after an on-site inspection. Never guarantee same-day arrival for non-urgent work.",
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Your business profile and FixMate AI preferences." />

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => navigate({ to: "/settings", search: { tab: t } })}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium capitalize transition-colors",
              tab === t
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card/60 text-muted-foreground hover:text-foreground",
            )}
          >
            {t === "ai" ? "AI preferences" : t}
          </button>
        ))}
      </div>

      {tab === "business" ? (
        <Panel title="Business profile" icon={<Building2 className="h-4 w-4" />}>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Business name">
              <Input value={business.name} onChange={(e) => setBusiness({ ...business, name: e.target.value })} />
            </Field>
            <Field label="Owner">
              <Input value={business.owner} onChange={(e) => setBusiness({ ...business, owner: e.target.value })} />
            </Field>
            <Field label="Phone">
              <Input value={business.phone} onChange={(e) => setBusiness({ ...business, phone: e.target.value })} />
            </Field>
            <Field label="Email">
              <Input value={business.email} onChange={(e) => setBusiness({ ...business, email: e.target.value })} />
            </Field>
            <Field label="City">
              <Input value={business.city} onChange={(e) => setBusiness({ ...business, city: e.target.value })} />
            </Field>
            <Field label="Working hours">
              <Input value={business.hours} onChange={(e) => setBusiness({ ...business, hours: e.target.value })} />
            </Field>
            <Field label="Callout fee (R)">
              <Input
                value={business.callout}
                onChange={(e) => setBusiness({ ...business, callout: e.target.value })}
              />
            </Field>
            <Field label="Hourly labour rate (R)">
              <Input
                value={business.hourly}
                onChange={(e) => setBusiness({ ...business, hourly: e.target.value })}
              />
            </Field>
          </div>
          <Button variant="hero" className="mt-4" onClick={() => toast.success("Business profile saved")}>
            Save changes
          </Button>
        </Panel>
      ) : null}

      {tab === "ai" ? (
        <Panel tone="ai" title="AI preferences" icon={<Sparkles className="h-4 w-4" />}>
          <Field label="House rules for AI-generated messages and quotes">
            <Textarea rows={6} value={aiNotes} onChange={(e) => setAiNotes(e.target.value)} />
          </Field>
          <p className="mt-2 text-xs text-muted-foreground">
            FixMate AI applies these rules to replies, job plans and quotes. You always review before
            anything is sent.
          </p>
          <Button variant="ai" className="mt-4" onClick={() => toast.success("AI preferences saved")}>
            Save preferences
          </Button>
        </Panel>
      ) : null}

      {tab === "billing" ? (
        <Panel title="Plan & billing" icon={<CreditCard className="h-4 w-4" />}>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-border/70 bg-panel/70 p-4">
              <div className="flex items-center justify-between">
                <p className="font-display text-lg font-bold">Starter</p>
                <GenericBadge tone="success">Current plan</GenericBadge>
              </div>
              <p className="mt-1 font-display text-2xl font-bold">R0 / month</p>
              <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                <li>• Up to 20 jobs per month</li>
                <li>• AI replies and job plans</li>
                <li>• Quotes and invoices</li>
              </ul>
            </div>
            <div className="rounded-xl border border-gold/40 bg-gold/5 p-4">
              <div className="flex items-center justify-between">
                <p className="font-display text-lg font-bold">Pro</p>
                <GenericBadge tone="warning">Recommended</GenericBadge>
              </div>
              <p className="mt-1 font-display text-2xl font-bold">R349 / month</p>
              <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                <li>• Unlimited jobs and customers</li>
                <li>• AI daily planner and follow-ups</li>
                <li>• Team scheduling and reports</li>
              </ul>
              <Button variant="gold" className="mt-4 w-full" onClick={() => toast.success("Upgrade request noted — our team will call you")}>
                Upgrade to Pro
              </Button>
            </div>
          </div>
        </Panel>
      ) : null}
    </div>
  );
}
