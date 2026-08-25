import { useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Bell, Bot, Menu, Search, Sparkles } from "lucide-react";
import { SidebarNav, NAV_ITEMS } from "./AppSidebar";
import { LogoMark } from "./Logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store";
import { BUSINESS } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

function NotificationBell() {
  const { notifications, markNotificationsRead, markNotificationRead } = useStore();
  const unread = notifications.filter((n) => !n.read).length;

  const kindStyles: Record<string, string> = {
    urgent: "bg-destructive",
    appointment: "bg-primary",
    quote: "bg-gold",
    followup: "bg-ai",
    waiting: "bg-warning",
    payment: "bg-success",
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          {unread > 0 ? (
            <span className="absolute -top-1 -right-1 grid h-5 min-w-5 place-items-center rounded-full bg-gold px-1 text-[10px] font-bold text-gold-foreground">
              {unread}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(22rem,calc(100vw-2rem))] p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-sm font-semibold">Notifications</p>
          <Button variant="ghost" size="sm" onClick={markNotificationsRead}>
            Mark all read
          </Button>
        </div>
        <div className="scrollbar-slim max-h-80 overflow-y-auto">
          {notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => markNotificationRead(n.id)}
              className={cn(
                "flex w-full gap-3 border-b border-border/60 px-4 py-3 text-left transition-colors hover:bg-accent/60",
                !n.read && "bg-primary/5",
              )}
            >
              <span
                className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", kindStyles[n.kind])}
                aria-hidden
              />
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{n.title}</span>
                <span className="block text-xs text-muted-foreground">{n.detail}</span>
                <span className="mt-1 block text-[11px] text-muted-foreground">{n.at}</span>
              </span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function GlobalSearch() {
  const [q, setQ] = useState("");
  const { jobs, customers, quotes, customerName } = useStore();
  const term = q.trim().toLowerCase();
  const results = term
    ? [
        ...jobs
          .filter(
            (j) =>
              j.title.toLowerCase().includes(term) ||
              customerName(j.customerId).toLowerCase().includes(term),
          )
          .slice(0, 4)
          .map((j) => ({ label: `${j.title} — ${customerName(j.customerId)}`, to: "/jobs" as const })),
        ...customers
          .filter((c) => c.name.toLowerCase().includes(term) || c.suburb.toLowerCase().includes(term))
          .slice(0, 3)
          .map((c) => ({ label: `${c.name} · ${c.suburb}`, to: "/customers" as const })),
        ...quotes
          .filter((qt) => qt.number.toLowerCase().includes(term))
          .slice(0, 2)
          .map((qt) => ({ label: `Quote ${qt.number}`, to: "/quotes" as const })),
      ]
    : [];

  return (
    <div className="relative hidden min-w-0 flex-1 max-w-sm md:block">
      <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search jobs, customers, quotes…"
        className="pl-9"
      />
      {results.length > 0 ? (
        <div className="glass-panel absolute top-full z-50 mt-2 w-full overflow-hidden rounded-xl">
          {results.map((r, i) => (
            <Link
              key={i}
              to={r.to}
              onClick={() => setQ("")}
              className="block truncate px-3 py-2 text-sm hover:bg-accent"
            >
              {r.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const current = NAV_ITEMS.find((n) => (n.to === "/" ? pathname === "/" : pathname.startsWith(n.to)));

  return (
    <div className="flex min-h-screen w-full">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar/80 py-4 backdrop-blur-xl lg:flex">
        <SidebarNav />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
          <div className="flex items-center gap-3 px-3 py-3 sm:px-5">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden" aria-label="Open menu">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 bg-sidebar p-0 py-4">
                <SheetTitle className="sr-only">FixMate AI navigation</SheetTitle>
                <SidebarNav onNavigate={() => setMobileOpen(false)} />
              </SheetContent>
            </Sheet>

            <Link to="/" className="flex min-w-0 items-center gap-2 lg:hidden">
              <LogoMark className="h-9 w-9" />
              <span className="truncate font-display text-sm font-bold">FixMate AI</span>
            </Link>

            <div className="hidden min-w-0 lg:block">
              <p className="truncate text-sm font-semibold">{current?.label ?? "FixMate AI"}</p>
              <p className="truncate text-xs text-muted-foreground">
                {BUSINESS.name} · Book. Plan. Fix. Done.
              </p>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <GlobalSearch />
              <Button asChild variant="ai" size="sm" className="hidden sm:inline-flex">
                <Link to="/assistant" search={{ tool: "chat" }}>
                  <Bot className="h-4 w-4" /> Ask FixMate AI
                </Link>
              </Button>
              <Button asChild variant="ai" size="icon" className="sm:hidden" aria-label="AI Assistant">
                <Link to="/assistant" search={{ tool: "chat" }}>
                  <Sparkles className="h-4 w-4" />
                </Link>
              </Button>
              <NotificationBell />
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 p-3 sm:p-5 lg:p-7">
          {children}
        </main>

        <footer className="border-t border-border px-4 py-4 text-center text-xs text-muted-foreground">
          FixMate AI · Book. Plan. Fix. Done. · AI output is assistive and must be reviewed before use.
        </footer>
      </div>
    </div>
  );
}
