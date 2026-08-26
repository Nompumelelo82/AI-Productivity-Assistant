import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, TrendingUp } from "lucide-react";
import { PageHeader, Panel } from "@/components/ui-kit";
import { useStore } from "@/lib/store";
import { revenueByMonth } from "@/lib/demo-data";
import { zar } from "@/lib/format";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports — FixMate AI" },
      {
        name: "description",
        content: "Revenue trends, service mix and job performance for your service business.",
      },
      { property: "og:title", content: "Reports — FixMate AI" },
      { property: "og:description", content: "See which services earn the most and how the month is tracking." },
    ],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  const { jobs, stats, invoices } = useStore();
  const max = Math.max(...revenueByMonth.map((m) => m.revenue));

  const byService = Object.entries(
    jobs.reduce<Record<string, { count: number; value: number }>>((acc, j) => {
      const entry = acc[j.service] ?? { count: 0, value: 0 };
      entry.count += 1;
      entry.value += j.amount;
      acc[j.service] = entry;
      return acc;
    }, {}),
  ).sort((a, b) => b[1].value - a[1].value);

  const totalValue = byService.reduce((s, [, v]) => s + v.value, 0) || 1;

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" subtitle="How the business is performing this month." />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Revenue this month", value: zar(stats.revenue) },
          { label: "Completed jobs", value: String(stats.completedJobs) },
          { label: "Average job value", value: zar(stats.avgJobValue) },
          {
            label: "Outstanding invoices",
            value: zar(invoices.filter((i) => i.status !== "Paid").reduce((s, i) => s + i.amount, 0)),
          },
        ].map((c) => (
          <Panel key={c.label}>
            <p className="text-xs tracking-wide text-muted-foreground uppercase">{c.label}</p>
            <p className="mt-1 font-display text-2xl font-bold">{c.value}</p>
          </Panel>
        ))}
      </div>

      <Panel title="Revenue trend" description="Last six months" icon={<TrendingUp className="h-4 w-4" />}>
        <div className="flex h-56 items-end gap-3">
          {revenueByMonth.map((m) => (
            <div key={m.month} className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <span className="text-xs text-muted-foreground">{zar(m.revenue)}</span>
              <div
                className="gradient-primary w-full rounded-t-lg"
                style={{ height: `${(m.revenue / max) * 100}%` }}
              />
              <span className="text-xs font-semibold">{m.month}</span>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Revenue by service" icon={<BarChart3 className="h-4 w-4" />}>
        <ul className="space-y-3">
          {byService.map(([service, v]) => (
            <li key={service}>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{service}</span>
                <span className="text-muted-foreground">
                  {v.count} jobs · {zar(v.value)}
                </span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-panel">
                <div
                  className="gradient-primary h-full rounded-full"
                  style={{ width: `${(v.value / totalValue) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
