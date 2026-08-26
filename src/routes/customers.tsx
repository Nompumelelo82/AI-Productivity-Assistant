import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Mail, MapPin, Phone, Plus, Search, Users } from "lucide-react";
import { EmptyState, Field, PageHeader, Panel } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useStore } from "@/lib/store";
import { prettyDate, zar } from "@/lib/format";

export const Route = createFileRoute("/customers")({
  head: () => ({
    meta: [
      { title: "Customers — FixMate AI" },
      {
        name: "description",
        content: "Your customer book with contact details, job history and total spend in Rands.",
      },
      { property: "og:title", content: "Customers — FixMate AI" },
      { property: "og:description", content: "Contact details, notes and job history for every customer." },
    ],
  }),
  component: CustomersPage,
});

function CustomersPage() {
  const { customers, jobs, addCustomer } = useStore();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    suburb: "",
    notes: "",
  });

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return customers
      .map((c) => {
        const own = jobs.filter((j) => j.customerId === c.id);
        return {
          ...c,
          jobCount: own.length,
          spend: own.filter((j) => j.status === "Completed").reduce((s, j) => s + j.amount, 0),
        };
      })
      .filter(
        (c) =>
          !q ||
          [c.name, c.email, c.phone, c.suburb, c.address].join(" ").toLowerCase().includes(q),
      );
  }, [customers, jobs, query]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        subtitle={`${customers.length} customers on your books`}
        actions={
          <Button variant="hero" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> Add customer
          </Button>
        }
      />

      <Panel>
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, suburb, phone or email…"
            className="pl-9"
          />
        </div>
      </Panel>

      {rows.length === 0 ? (
        <EmptyState
          icon={<Users className="h-5 w-5" />}
          title="No customers found"
          description="Try a different search, or add a new customer."
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((c) => (
            <Panel key={c.id} className="space-y-3">
              <div>
                <h3 className="font-display text-lg font-bold">{c.name}</h3>
                <p className="text-xs text-muted-foreground">
                  Customer since {prettyDate(c.createdAt)}
                </p>
              </div>
              <div className="space-y-1.5 text-sm">
                <p className="flex min-w-0 items-center gap-2">
                  <Phone className="h-4 w-4 shrink-0 text-primary" />
                  <span className="truncate">{c.phone}</span>
                </p>
                <p className="flex min-w-0 items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0 text-primary" />
                  <span className="truncate">{c.email}</span>
                </p>
                <p className="flex min-w-0 items-center gap-2">
                  <MapPin className="h-4 w-4 shrink-0 text-primary" />
                  <span className="truncate">
                    {c.address}, {c.suburb}
                  </span>
                </p>
              </div>
              {c.notes ? (
                <p className="rounded-lg border border-border/70 bg-panel/70 p-2 text-xs text-muted-foreground">
                  {c.notes}
                </p>
              ) : null}
              <div className="flex items-center justify-between border-t border-border/70 pt-3 text-sm">
                <span className="text-muted-foreground">{c.jobCount} jobs</span>
                <span className="font-display font-bold text-gold">{zar(c.spend)}</span>
              </div>
              <Button variant="outline" size="sm" asChild className="w-full">
                <Link to="/jobs" search={{ filter: "all" }}>
                  View jobs
                </Link>
              </Button>
            </Panel>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add a customer</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Full name" className="sm:col-span-2">
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Phone">
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </Field>
            <Field label="Email">
              <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </Field>
            <Field label="Street address">
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </Field>
            <Field label="Suburb">
              <Input value={form.suburb} onChange={(e) => setForm({ ...form, suburb: e.target.value })} />
            </Field>
            <Field label="Notes" className="sm:col-span-2">
              <Textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </Field>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="hero"
              onClick={() => {
                if (!form.name.trim()) {
                  toast.error("Enter the customer's name");
                  return;
                }
                addCustomer(form);
                toast.success(`${form.name} added`);
                setForm({ name: "", phone: "", email: "", address: "", suburb: "", notes: "" });
                setOpen(false);
              }}
            >
              Add customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
