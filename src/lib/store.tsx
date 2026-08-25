import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import * as demo from "./demo-data";
import { todayISO, uid } from "./format";
import type {
  Appointment,
  Conversation,
  Customer,
  CustomerRequest,
  Invoice,
  Job,
  JobStatus,
  Notification,
  Quote,
} from "./types";

type Store = {
  customers: Customer[];
  jobs: Job[];
  quotes: Quote[];
  invoices: Invoice[];
  conversations: Conversation[];
  appointments: Appointment[];
  notifications: Notification[];
  requests: CustomerRequest[];
  customerName: (id?: string) => string;
  customerById: (id?: string) => Customer | undefined;
  addJob: (job: Omit<Job, "id" | "reference">) => Job;
  updateJob: (id: string, patch: Partial<Job>) => void;
  deleteJob: (id: string) => void;
  setJobStatus: (id: string, status: JobStatus) => void;
  addQuote: (quote: Omit<Quote, "id" | "number" | "createdAt">) => Quote;
  updateQuote: (id: string, patch: Partial<Quote>) => void;
  deleteQuote: (id: string) => void;
  addAppointment: (appt: Omit<Appointment, "id">) => Appointment;
  updateAppointment: (id: string, patch: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;
  addCustomer: (c: Omit<Customer, "id" | "createdAt">) => Customer;
  updateCustomer: (id: string, patch: Partial<Customer>) => void;
  addInvoice: (i: Omit<Invoice, "id" | "number">) => Invoice;
  setInvoiceStatus: (id: string, status: Invoice["status"]) => void;
  sendMessage: (conversationId: string, body: string) => void;
  markConversation: (id: string, patch: Partial<Conversation>) => void;
  markRequestHandled: (id: string) => void;
  markNotificationsRead: () => void;
  markNotificationRead: (id: string) => void;
  stats: {
    activeJobs: number;
    pendingQuotes: number;
    todayAppointments: number;
    completedJobs: number;
    revenue: number;
    avgJobValue: number;
    topService: string;
  };
};

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>(demo.customers);
  const [jobs, setJobs] = useState<Job[]>(demo.jobs);
  const [quotes, setQuotes] = useState<Quote[]>(demo.quotes);
  const [invoices, setInvoices] = useState<Invoice[]>(demo.invoices);
  const [conversations, setConversations] = useState<Conversation[]>(demo.conversations);
  const [appointments, setAppointments] = useState<Appointment[]>(demo.appointments);
  const [notifications, setNotifications] = useState<Notification[]>(demo.notifications);
  const [requests, setRequests] = useState<CustomerRequest[]>(demo.requests);

  const customerById = useCallback(
    (id?: string) => customers.find((c) => c.id === id),
    [customers],
  );
  const customerName = useCallback(
    (id?: string) => customerById(id)?.name ?? "Walk-in customer",
    [customerById],
  );

  const value = useMemo<Store>(() => {
    const completed = jobs.filter((j) => j.status === "Completed");
    const revenue = 18450;
    const serviceCounts = jobs.reduce<Record<string, number>>((acc, j) => {
      acc[j.service] = (acc[j.service] ?? 0) + 1;
      return acc;
    }, {});
    const topService =
      Object.entries(serviceCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Plumbing";

    return {
      customers,
      jobs,
      quotes,
      invoices,
      conversations,
      appointments,
      notifications,
      requests,
      customerName,
      customerById,
      addJob: (job) => {
        const created: Job = {
          ...job,
          id: uid("job"),
          reference: `FM-JOB-${1047 + jobs.length}`,
        };
        setJobs((prev) => [created, ...prev]);
        return created;
      },
      updateJob: (id, patch) =>
        setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...patch } : j))),
      deleteJob: (id) => setJobs((prev) => prev.filter((j) => j.id !== id)),
      setJobStatus: (id, status) =>
        setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, status } : j))),
      addQuote: (quote) => {
        const created: Quote = {
          ...quote,
          id: uid("q"),
          number: `FM-${String(quotes.length + 1).padStart(3, "0")}`,
          createdAt: todayISO(),
        };
        setQuotes((prev) => [created, ...prev]);
        return created;
      },
      updateQuote: (id, patch) =>
        setQuotes((prev) => prev.map((q) => (q.id === id ? { ...q, ...patch } : q))),
      deleteQuote: (id) => setQuotes((prev) => prev.filter((q) => q.id !== id)),
      addAppointment: (appt) => {
        const created: Appointment = { ...appt, id: uid("appt") };
        setAppointments((prev) => [...prev, created]);
        return created;
      },
      updateAppointment: (id, patch) =>
        setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a))),
      deleteAppointment: (id) => setAppointments((prev) => prev.filter((a) => a.id !== id)),
      addCustomer: (c) => {
        const created: Customer = { ...c, id: uid("cust"), createdAt: todayISO() };
        setCustomers((prev) => [...prev, created]);
        return created;
      },
      updateCustomer: (id, patch) =>
        setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c))),
      addInvoice: (i) => {
        const created: Invoice = {
          ...i,
          id: uid("inv"),
          number: `INV-${2046 + invoices.length}`,
        };
        setInvoices((prev) => [created, ...prev]);
        return created;
      },
      setInvoiceStatus: (id, status) =>
        setInvoices((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i))),
      sendMessage: (conversationId, body) =>
        setConversations((prev) =>
          prev.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  unread: false,
                  messages: [
                    ...c.messages,
                    {
                      id: uid("m"),
                      from: "business" as const,
                      body,
                      at: new Date().toLocaleTimeString("en-ZA", {
                        hour: "2-digit",
                        minute: "2-digit",
                      }),
                    },
                  ],
                }
              : c,
          ),
        ),
      markConversation: (id, patch) =>
        setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c))),
      markRequestHandled: (id) =>
        setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, handled: true } : r))),
      markNotificationsRead: () =>
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true }))),
      markNotificationRead: (id) =>
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n))),
      stats: {
        activeJobs: jobs.filter((j) =>
          ["New", "Quoted", "Scheduled", "In Progress"].includes(j.status),
        ).length,
        pendingQuotes: quotes.filter((q) => q.status !== "Accepted" && q.status !== "Declined")
          .length,
        todayAppointments: appointments.filter((a) => a.date === todayISO()).length,
        completedJobs: completed.length + 20,
        revenue,
        avgJobValue: Math.round(
          completed.reduce((sum, j) => sum + j.amount, 0) / Math.max(completed.length, 1),
        ),
        topService,
      },
    };
  }, [
    customers,
    jobs,
    quotes,
    invoices,
    conversations,
    appointments,
    notifications,
    requests,
    customerById,
    customerName,
  ]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
