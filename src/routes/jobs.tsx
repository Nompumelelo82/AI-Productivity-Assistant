import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  CalendarDays,
  Check,
  MapPin,
  Plus,
  Search,
  Sparkles,
  Trash2,
  User,
  Wrench,
} from "lucide-react";
import {
  EmptyState,
  Field,
  PageHeader,
  Panel,
  PriorityBadge,
  StatusBadge,
} from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/lib/store";
import { prettyDate, todayISO, zar } from "@/lib/format";
import type { Job, JobStatus, Priority, ServiceCategory } from "@/lib/types";
import { SERVICES, TECHNICIANS } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

const FILTERS = ["all", "New", "Quoted", "Scheduled", "In Progress", "Completed"] as const;
type Filter = (typeof FILTERS)[number];

export const Route = createFileRoute("/jobs")({
  validateSearch: (search: Record<string, unknown>): { filter: Filter; new?: boolean } => {
    const filter = search["filter"];
    const isNew = search["new"];
    return {
      filter: (FILTERS as readonly string[]).includes(String(filter))
        ? (filter as Filter)
        : "all",
      ...(isNew === true || isNew === "true" ? { new: true } : {}),
    };
  },
  head: () => ({
    meta: [
      { title: "Jobs — FixMate AI" },
      {
        name: "description",
        content: "Track every plumbing, electrical and repair job from new request to completion.",
      },
      { property: "og:title", content: "Job management — FixMate AI" },
      { property: "og:description", content: "Statuses, technicians, priorities and job values in one board." },
    ],
  }),
  component: JobsPage,
});

const STATUSES: JobStatus[] = ["New", "Quoted", "Scheduled", "In Progress", "Completed", "Cancelled"];
const PRIORITIES: Priority[] = ["Urgent", "High", "Medium", "Low"];

function JobsPage() {
  const { jobs, customers, customerName, addJob, updateJob, deleteJob, setJobStatus } = useStore();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(Boolean(search.new));
  const [editing, setEditing] = useState<Job | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return jobs.filter((j) => {
      const matchesFilter = search.filter === "all" || j.status === search.filter;
      const matchesQuery =
        !q ||
        [j.title, j.reference, j.service, j.technician, j.location, customerName(j.customerId)]
          .join(" ")
          .toLowerCase()
          .includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [jobs, query, search.filter, customerName]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Jobs"
        subtitle={`${jobs.length} jobs in the system · ${zar(jobs.reduce((s, j) => s + j.amount, 0))} total value`}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link to="/requests">
                <Sparkles className="h-4 w-4" /> Analyse a request
              </Link>
            </Button>
            <Button variant="hero" onClick={() => setCreating(true)}>
              <Plus className="h-4 w-4" /> New job
            </Button>
          </>
        }
      />

      <Panel>
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <div className="relative min-w-0">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search jobs, customers, technicians…"
              className="pl-9"
            />
          </div>
          <div className="scrollbar-slim flex gap-2 overflow-x-auto pb-1">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => navigate({ to: "/jobs", search: { filter: f } })}
                className={cn(
                  "shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                  search.filter === f
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card/60 text-muted-foreground hover:text-foreground",
                )}
              >
                {f === "all" ? "All" : f}
              </button>
            ))}
          </div>
        </div>
      </Panel>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Wrench className="h-5 w-5" />}
          title="No jobs match this view"
          description="Try another filter, or create a job from a customer request."
          action={
            <Button variant="hero" onClick={() => setCreating(true)}>
              <Plus className="h-4 w-4" /> New job
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 xl:grid-cols-2">
          {filtered.map((job) => (
            <Panel key={job.id} className="space-y-3">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold tracking-wide text-muted-foreground">
                    {job.reference} · {job.service}
                  </p>
                  <h3 className="truncate font-display text-lg font-bold">{job.title}</h3>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <StatusBadge status={job.status} />
                  <PriorityBadge priority={job.priority} />
                </div>
              </div>

              <p className="line-clamp-2 text-sm text-muted-foreground">{job.description}</p>

              <div className="grid gap-2 text-sm sm:grid-cols-2">
                <p className="flex min-w-0 items-center gap-2">
                  <User className="h-4 w-4 shrink-0 text-primary" />
                  <span className="truncate">{customerName(job.customerId)}</span>
                </p>
                <p className="flex min-w-0 items-center gap-2">
                  <CalendarDays className="h-4 w-4 shrink-0 text-primary" />
                  <span className="truncate">
                    {prettyDate(job.appointmentDate)} · {job.time}
                  </span>
                </p>
                <p className="flex min-w-0 items-center gap-2">
                  <MapPin className="h-4 w-4 shrink-0 text-primary" />
                  <span className="truncate">{job.location}</span>
                </p>
                <p className="flex min-w-0 items-center gap-2">
                  <Wrench className="h-4 w-4 shrink-0 text-primary" />
                  <span className="truncate">{job.technician}</span>
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/70 pt-3">
                <p className="font-display text-lg font-bold text-gold">{zar(job.amount)}</p>
                <div className="flex flex-wrap gap-2">
                  <Select
                    value={job.status}
                    onValueChange={(v) => {
                      setJobStatus(job.id, v as JobStatus);
                      toast.success(`${job.reference} marked ${v}`);
                    }}
                  >
                    <SelectTrigger className="h-9 w-[9.5rem]">
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
                  <Button variant="outline" size="sm" onClick={() => setEditing(job)}>
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/assistant" search={{ tool: "followup", job: job.id }}>
                      Follow-up
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Delete job"
                    onClick={() => {
                      deleteJob(job.id);
                      toast.success(`${job.reference} deleted`);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </Panel>
          ))}
        </div>
      )}

      <JobDialog
        open={creating || Boolean(editing)}
        job={editing}
        onClose={() => {
          setCreating(false);
          setEditing(null);
          if (search.new) navigate({ to: "/jobs", search: { filter: search.filter } });
        }}
        onSubmit={(values) => {
          if (editing) {
            updateJob(editing.id, values);
            toast.success("Job updated");
          } else {
            const created = addJob(values);
            toast.success(`Job ${created.reference} created`);
          }
        }}
        customers={customers.map((c) => ({ id: c.id, name: c.name, suburb: c.suburb }))}
      />
    </div>
  );
}

function JobDialog({
  open,
  job,
  onClose,
  onSubmit,
  customers,
}: {
  open: boolean;
  job: Job | null;
  onClose: () => void;
  onSubmit: (values: Omit<Job, "id" | "reference">) => void;
  customers: Array<{ id: string; name: string; suburb: string }>;
}) {
  const [form, setForm] = useState(() => blank(customers[0]?.id ?? ""));

  const [initialisedFor, setInitialisedFor] = useState<string | null>(null);
  const key = job?.id ?? (open ? "new" : null);
  if (open && key !== initialisedFor) {
    setInitialisedFor(key);
    setForm(
      job
        ? {
            customerId: job.customerId,
            service: job.service,
            title: job.title,
            description: job.description,
            status: job.status,
            priority: job.priority,
            appointmentDate: job.appointmentDate,
            time: job.time,
            durationMins: job.durationMins,
            technician: job.technician,
            amount: job.amount,
            location: job.location,
            equipment: job.equipment,
            notes: job.notes,
          }
        : blank(customers[0]?.id ?? ""),
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          setInitialisedFor(null);
          onClose();
        }
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{job ? "Edit job" : "Create a new job"}</DialogTitle>
          <DialogDescription>
            Capture the work, the customer and when your team is going out.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Job title" className="sm:col-span-2">
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Kitchen tap replacement"
            />
          </Field>
          <Field label="Customer">
            <Select value={form.customerId} onValueChange={(v) => setForm({ ...form, customerId: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} — {c.suburb}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Service">
            <Select
              value={form.service}
              onValueChange={(v) => setForm({ ...form, service: v as ServiceCategory })}
            >
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
          <Field label="Status">
            <Select
              value={form.status}
              onValueChange={(v) => setForm({ ...form, status: v as JobStatus })}
            >
              <SelectTrigger>
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
          </Field>
          <Field label="Priority">
            <Select
              value={form.priority}
              onValueChange={(v) => setForm({ ...form, priority: v as Priority })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIORITIES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Date">
            <Input
              type="date"
              value={form.appointmentDate}
              onChange={(e) => setForm({ ...form, appointmentDate: e.target.value })}
            />
          </Field>
          <Field label="Time">
            <Input
              type="time"
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
            />
          </Field>
          <Field label="Duration (minutes)">
            <Input
              type="number"
              min={15}
              step={15}
              value={form.durationMins}
              onChange={(e) => setForm({ ...form, durationMins: Number(e.target.value) })}
            />
          </Field>
          <Field label="Job value (R)">
            <Input
              type="number"
              min={0}
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
            />
          </Field>
          <Field label="Technician">
            <Select value={form.technician} onValueChange={(v) => setForm({ ...form, technician: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TECHNICIANS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Location">
            <Input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </Field>
          <Field label="Description" className="sm:col-span-2">
            <Textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </Field>
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => {
              setInitialisedFor(null);
              onClose();
            }}
          >
            Cancel
          </Button>
          <Button
            variant="hero"
            onClick={() => {
              if (!form.title.trim()) {
                toast.error("Give the job a title");
                return;
              }
              onSubmit(form);
              setInitialisedFor(null);
              onClose();
            }}
          >
            <Check className="h-4 w-4" /> {job ? "Save changes" : "Create job"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function blank(customerId: string): Omit<Job, "id" | "reference"> {
  return {
    customerId,
    service: "Plumbing",
    title: "",
    description: "",
    status: "New",
    priority: "Medium",
    appointmentDate: todayISO(),
    time: "09:00",
    durationMins: 60,
    technician: TECHNICIANS[0],
    amount: 0,
    location: "",
    equipment: [],
    notes: "",
  };
}
