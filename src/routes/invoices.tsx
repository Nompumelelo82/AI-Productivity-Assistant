import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Receipt } from "lucide-react";
import { GenericBadge, PageHeader, Panel } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/lib/store";
import { prettyDate, zar } from "@/lib/format";
import type { Invoice } from "@/lib/types";

export const Route = createFileRoute("/invoices")({
  head: () => ({
    meta: [
      { title: "Invoices — FixMate AI" },
      {
        name: "description",
        content: "Track paid, pending and overdue invoices in South African Rand.",
      },
      { property: "og:title", content: "Invoices — FixMate AI" },
      { property: "og:description", content: "See what has been paid and what still needs chasing." },
    ],
  }),
  component: InvoicesPage,
});

const STATUSES: Invoice["status"][] = ["Paid", "Pending", "Overdue"];

function InvoicesPage() {
  const { invoices, customerName, setInvoiceStatus } = useStore();

  const total = (status: Invoice["status"]) =>
    invoices.filter((i) => i.status === status).reduce((s, i) => s + i.amount, 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Invoices" subtitle="Billing overview for FixMate Plumbing & Repairs." />

      <div className="grid gap-3 sm:grid-cols-3">
        {STATUSES.map((s) => (
          <Panel key={s}>
            <p className="text-xs tracking-wide text-muted-foreground uppercase">{s}</p>
            <p className="mt-1 font-display text-2xl font-bold">{zar(total(s))}</p>
            <p className="text-xs text-muted-foreground">
              {invoices.filter((i) => i.status === s).length} invoices
            </p>
          </Panel>
        ))}
      </div>

      <Panel title="All invoices" icon={<Receipt className="h-4 w-4" />}>
        <ul className="space-y-2">
          {invoices.map((i) => (
            <li
              key={i.id}
              className="grid gap-3 rounded-xl border border-border/70 bg-panel/70 p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold">
                  {i.number} · {customerName(i.customerId)}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {i.jobTitle} · {prettyDate(i.date)}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <GenericBadge
                  tone={i.status === "Paid" ? "success" : i.status === "Overdue" ? "danger" : "warning"}
                >
                  {i.status}
                </GenericBadge>
                <span className="font-display text-lg font-bold text-gold">{zar(i.amount)}</span>
                <Select
                  value={i.status}
                  onValueChange={(v) => {
                    setInvoiceStatus(i.id, v as Invoice["status"]);
                    toast.success(`${i.number} marked ${v}`);
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
                <Button variant="outline" size="sm" onClick={() => toast.success(`Reminder sent for ${i.number}`)}>
                  Send reminder
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
