import { Link, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  Bot,
  CalendarDays,
  FileText,
  Inbox,
  LifeBuoy,
  LayoutDashboard,
  MessageSquare,
  Receipt,
  Settings,
  Sparkles,
  Users,
  Wrench,
} from "lucide-react";
import { LogoLockup } from "./Logo";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const NAV_ITEMS = [
  { label: "Dashboard", to: "/", icon: LayoutDashboard },
  { label: "Customer Requests", to: "/requests", icon: Inbox },
  { label: "Jobs", to: "/jobs", icon: Wrench },
  { label: "Quotes", to: "/quotes", icon: FileText },
  { label: "Schedule", to: "/schedule", icon: CalendarDays },
  { label: "Customers", to: "/customers", icon: Users },
  { label: "AI Assistant", to: "/assistant", icon: Bot },
  { label: "Messages", to: "/messages", icon: MessageSquare },
  { label: "Invoices & Payments", to: "/invoices", icon: Receipt },
  { label: "Reports", to: "/reports", icon: BarChart3 },
  { label: "Settings", to: "/settings", icon: Settings },
] as const;

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <Link to="/" onClick={onNavigate} className="block px-2 pt-1">
        <LogoLockup className="mx-auto max-w-[168px]" />
      </Link>

      <nav className="scrollbar-slim min-h-0 flex-1 space-y-1 overflow-y-auto px-2">
        {NAV_ITEMS.map((item) => {
          const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "gradient-primary text-primary-foreground shadow-[0_10px_30px_-16px_var(--primary)]"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
              )}
            >
              <item.icon className="h-4.5 w-4.5 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="space-y-2 px-2 pb-3">
        <div className="rounded-2xl border border-gold/30 bg-gold/10 p-3">
          <p className="flex items-center gap-2 text-sm font-bold text-gold">
            <Sparkles className="h-4 w-4" /> Upgrade to Pro
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Unlimited AI quotes, team scheduling and automated follow-ups.
          </p>
          <Button asChild variant="gold" size="sm" className="mt-3 w-full">
            <Link to="/settings" search={{ tab: "billing" }} onClick={onNavigate}>
              See Pro plans
            </Link>
          </Button>
        </div>
        <Button asChild variant="ghost" size="sm" className="w-full justify-start gap-3">
          <Link to="/help" onClick={onNavigate}>
            <LifeBuoy className="h-4 w-4" /> Help &amp; Support
          </Link>
        </Button>
      </div>
    </div>
  );
}
