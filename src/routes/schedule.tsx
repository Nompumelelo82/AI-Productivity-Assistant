import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { CalendarDays, ChevronLeft, ChevronRight, MapPin, Plus, Sparkles, Trash2 } from "lucide-react";
import { EmptyState, Field, PageHeader, Panel, PriorityBadge } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
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
import { prettyDate, todayISO } from "@/lib/format";
import { SERVICES } from "@/lib/demo-data";
import type { Appointment, Priority, ServiceCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/schedule")({
  head: () => ({
    meta: [
      { title: "Schedule — FixMate AI" },
      {
        name: "description",
        content: "A week-at-a-glance calendar of appointments for your service team.",
      },
      { property: "og:title", content: "Schedule — FixMate AI" },
      { property: "og:description", content: "Plan appointments, priorities and travel across the week." },
    ],
  }),
  component: SchedulePage,
});

function startOfWeek(offset: number) {
  const d = new Date();
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day + offset * 7);
  return d;
}

function SchedulePage() {
  const { appointments, addAppointment, updateAppointment, deleteAppointment, customerName } =
    useStore();
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [editing, setEditing] = useState<Appointment | null>(null);
  const [creating, setCreating] = useState(false);

  const week = useMemo(() => {
    const start = startOfWeek(weekOffset);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d.toISOString().slice(0, 10);
    });
  }, [weekOffset]);

  const dayAppointments = appointments
    .filter((a) => a.date === selectedDate)
    .sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Schedule"
        subtitle="Your week at a glance — tap a day to see and manage appointments."
        actions={
          <>
            <Button variant="outline" asChild>
              <Link to="/assistant" search={{ tool: "daily" }}>
                <Sparkles className="h-4 w-4" /> AI daily planner
              </Link>
            </Button>
            <Button variant="hero" onClick={() => setCreating(true)}>
              <Plus className="h-4 w-4" /> New appointment
            </Button>
          </>
        }
      />

      <Panel>
        <div className="mb-4 flex items-center justify-between gap-2">
          <Button variant="outline" size="icon" aria-label="Previous week" onClick={() => setWeekOffset((w) => w - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <p className="font-display text-sm font-bold sm:text-base">
            {prettyDate(week[0] ?? todayISO())} — {prettyDate(week[6] ?? todayISO())}
          </p>
          <Button variant="outline" size="icon" aria-label="Next week" onClick={() => setWeekOffset((w) => w + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
          {week.map((iso) => {
            const count = appointments.filter((a) => a.date === iso).length;
            const isToday = iso === todayISO();
            return (
              <button
                key={iso}
                onClick={() => setSelectedDate(iso)}
                className={cn(
                  "rounded-xl border p-3 text-left transition-colors",
                  selectedDate === iso
                    ? "border-primary bg-primary/15"
                    : "border-border/70 bg-panel/70 hover:border-primary/40",
                )}
              >
                <p className="text-xs text-muted-foreground">
                  {new Date(`${iso}T00:00:00`).toLocaleDateString("en-ZA", { weekday: "short" })}
                  {isToday ? " · today" : ""}
                </p>
                <p className="font-display text-xl font-bold">{iso.slice(8)}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {count} {count === 1 ? "job" : "jobs"}
                </p>
              </button>
            );
          })}
        </div>
      </Panel>

      <Panel
        title={prettyDate(selectedDate)}
        description={`${dayAppointments.length} appointments`}
        icon={<CalendarDays className="h-4 w-4" />}
      >
        {dayAppointments.length === 0 ? (
          <EmptyState
            icon={<CalendarDays className="h-5 w-5" />}
            title="Nothing booked for this day"
            description="Add an appointment or let the AI daily planner fill your day."
            action={
              <Button variant="hero" onClick={() => setCreating(true)}>
                <Plus className="h-4 w-4" /> New appointment
              </Button>
            }
          />
        ) : (
          <ul className="space-y-2">
            {dayAppointments.map((a) => (
              <li
                key={a.id}
                className="grid grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-3 rounded-xl border border-border/70 bg-panel/70 p-3"
              >
                <span className="font-display text-sm font-bold">{a.time}</span>
                <div className="min-w-0">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                    <p className="truncate font-semibold">{a.title}</p>
                    <PriorityBadge priority={a.priority} />
                  </div>
                  <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    {a.location} · {a.service} · {a.durationMins} min
                    {a.customerId ? ` · ${customerName(a.customerId)}` : ""}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setEditing(a)}>
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Delete appointment"
                      onClick={() => {
                        deleteAppointment(a.id);
                        toast.success("Appointment removed");
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <AppointmentDialog
        open={creating || Boolean(editing)}
        appointment={editing}
        date={selectedDate}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        onSubmit={(values) => {
          if (editing) {
            updateAppointment(editing.id, values);
            toast.success("Appointment updated");
          } else {
            addAppointment(values);
            toast.success("Appointment created");
          }
        }}
      />
    </div>
  );
}

const PRIORITIES: Priority[] = ["Urgent", "High", "Medium", "Low"];

function AppointmentDialog({
  open,
  appointment,
  date,
  onClose,
  onSubmit,
}: {
  open: boolean;
  appointment: Appointment | null;
  date: string;
  onClose: () => void;
  onSubmit: (values: Omit<Appointment, "id">) => void;
}) {
  const [form, setForm] = useState<Omit<Appointment, "id">>({
    title: "",
    service: "Plumbing",
    date,
    time: "09:00",
    durationMins: 60,
    priority: "Medium",
    location: "",
    notes: "",
  });
  const [initialisedFor, setInitialisedFor] = useState<string | null>(null);
  const key = appointment?.id ?? (open ? `new-${date}` : null);
  if (open && key !== initialisedFor) {
    setInitialisedFor(key);
    setForm(
      appointment
        ? {
            title: appointment.title,
            service: appointment.service,
            date: appointment.date,
            time: appointment.time,
            durationMins: appointment.durationMins,
            priority: appointment.priority,
            location: appointment.location,
            notes: appointment.notes,
          }
        : {
            title: "",
            service: "Plumbing",
            date,
            time: "09:00",
            durationMins: 60,
            priority: "Medium",
            location: "",
            notes: "",
          },
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{appointment ? "Edit appointment" : "New appointment"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Title" className="sm:col-span-2">
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </Field>
          <Field label="Date">
            <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </Field>
          <Field label="Time">
            <Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
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
          <Field label="Priority">
            <Select
              value={form.priority}
              onValueChange={(v) => setForm({ ...form, priority: v as Priority })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIORITIES.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
          <Field label="Suburb / location">
            <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
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
                toast.error("Add a title");
                return;
              }
              onSubmit(form);
              setInitialisedFor(null);
              onClose();
            }}
          >
            {appointment ? "Save changes" : "Create appointment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
