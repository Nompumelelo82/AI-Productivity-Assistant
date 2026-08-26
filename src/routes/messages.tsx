import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { MessageSquare, Send, Sparkles } from "lucide-react";
import { GenericBadge, PageHeader, Panel } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/messages")({
  head: () => ({
    meta: [
      { title: "Messages — FixMate AI" },
      {
        name: "description",
        content: "One inbox for WhatsApp, email and website enquiries from your customers.",
      },
      { property: "og:title", content: "Messages — FixMate AI" },
      { property: "og:description", content: "Reply to customers fast, with AI drafting when you need it." },
    ],
  }),
  component: MessagesPage,
});

function MessagesPage() {
  const { conversations, customerName, sendMessage, markConversation } = useStore();
  const [activeId, setActiveId] = useState(conversations[0]?.id ?? "");
  const [draft, setDraft] = useState("");

  const active = conversations.find((c) => c.id === activeId) ?? conversations[0];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Messages"
        subtitle="Every customer conversation in one place."
        actions={
          <Button variant="outline" asChild>
            <Link to="/assistant" search={{ tool: "reply" }}>
              <Sparkles className="h-4 w-4" /> AI reply generator
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[20rem_minmax(0,1fr)]">
        <Panel title="Conversations" icon={<MessageSquare className="h-4 w-4" />}>
          <ul className="space-y-2">
            {conversations.map((c) => (
              <li key={c.id}>
                <button
                  onClick={() => {
                    setActiveId(c.id);
                    markConversation(c.id, { unread: false });
                  }}
                  className={cn(
                    "w-full rounded-xl border p-3 text-left transition-colors",
                    active?.id === c.id
                      ? "border-primary bg-primary/10"
                      : "border-border/70 bg-panel/70 hover:border-primary/40",
                  )}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold">
                      {customerName(c.customerId)}
                    </span>
                    {c.unread ? <GenericBadge tone="warning">New</GenericBadge> : null}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                    {c.subject}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </Panel>

        {active ? (
          <Panel
            title={customerName(active.customerId)}
            description={active.subject}
            className="flex min-h-[60vh] flex-col"
          >
            <div className="scrollbar-slim min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
              {active.messages.map((m) => (
                <div
                  key={m.id}
                  className={cn("flex", m.from === "business" ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm",
                      m.from === "business"
                        ? "bg-primary text-primary-foreground"
                        : "border border-border/70 bg-panel/80",
                    )}
                  >
                    <p className="whitespace-pre-wrap">{m.body}</p>
                    <p
                      className={cn(
                        "mt-1 text-[11px]",
                        m.from === "business"
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground",
                      )}
                    >
                      {m.at}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <form
              className="mt-4 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (!draft.trim()) return;
                sendMessage(active.id, draft.trim());
                setDraft("");
                toast.success("Message sent");
              }}
            >
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type your reply…"
              />
              <Button type="submit" variant="hero" size="icon" aria-label="Send message">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </Panel>
        ) : null}
      </div>
    </div>
  );
}
