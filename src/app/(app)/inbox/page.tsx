"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useCRM } from "@/lib/store";
import { cn, initials } from "@/lib/utils";
import { Mail, MessageSquare, Phone, Search, Send, Plus, Star, Inbox as InboxIcon, MessageCircle } from "lucide-react";
import type { Channel } from "@/lib/types";

const channelIcon: Record<Channel, React.ElementType> = {
  email: Mail,
  sms: MessageSquare,
  call: Phone,
  whatsapp: MessageCircle,
};

const channelColor: Record<Channel, string> = {
  email: "text-blue-500",
  sms: "text-emerald-500",
  call: "text-amber-500",
  whatsapp: "text-green-500",
};

export default function InboxPage() {
  const threads = useCRM((s) => s.threads);
  const messages = useCRM((s) => s.messages);
  const leads = useCRM((s) => s.leads);
  const sendMessage = useCRM((s) => s.sendMessage);
  const markThreadRead = useCRM((s) => s.markThreadRead);

  const [filter, setFilter] = useState<"all" | Channel | "unread">("all");
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sortedThreads = useMemo(() => {
    let list = [...threads].sort((a, b) => b.lastMessageAt - a.lastMessageAt);
    if (filter === "unread") list = list.filter((t) => t.unread > 0);
    else if (filter !== "all") list = list.filter((t) => t.channel === filter);
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((t) => {
        const lead = leads.find((l) => l.id === t.leadId);
        return (
          t.subject.toLowerCase().includes(q) ||
          (lead?.name.toLowerCase().includes(q) ?? false) ||
          (lead?.email.toLowerCase().includes(q) ?? false)
        );
      });
    }
    return list;
  }, [threads, leads, filter, query]);

  const activeThread = sortedThreads.find((t) => t.id === activeId) ?? sortedThreads[0];
  const activeLead = activeThread ? leads.find((l) => l.id === activeThread.leadId) : undefined;
  const threadMessages = useMemo(
    () => activeThread ? messages.filter((m) => m.threadId === activeThread.id).sort((a, b) => a.createdAt - b.createdAt) : [],
    [activeThread, messages]
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [threadMessages.length]);

  function send(e: React.FormEvent) {
    e.preventDefault();
    if (!activeThread || !draft.trim() || !activeLead) return;
    sendMessage({
      threadId: activeThread.id,
      channel: activeThread.channel,
      direction: "outbound",
      leadId: activeLead.id,
      from: "tl@tl.com",
      to: activeThread.channel === "email" ? activeLead.email : activeLead.phone,
      subject: activeThread.subject,
      body: draft.trim(),
    });
    setDraft("");
    toast.success(`${activeThread.channel === "email" ? "Email" : activeThread.channel.toUpperCase()} sent`);
  }

  const unread = threads.reduce((s, t) => s + t.unread, 0);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Inbox"
        description={`${threads.length} threads · ${unread} unread`}
        actions={
          <Button size="sm" onClick={() => toast.info("Compose new message — coming soon")}>
            <Plus className="size-4" /> New message
          </Button>
        }
      />

      <Card className="overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] h-[70vh] min-h-[540px]">
          <div className="border-r border-border flex flex-col">
            <div className="p-3 border-b border-border space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input placeholder="Search threads…" className="pl-9 h-8" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
              <div className="flex flex-wrap gap-1">
                {(["all", "unread", "email", "sms", "call", "whatsapp"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={cn(
                      "px-2 py-1 text-xs rounded-md capitalize transition-colors",
                      filter === f ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-secondary/80"
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin">
              {sortedThreads.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  <InboxIcon className="size-8 mx-auto mb-2 opacity-30" />
                  No conversations
                </div>
              ) : (
                sortedThreads.map((t) => {
                  const lead = leads.find((l) => l.id === t.leadId);
                  const last = messages.filter((m) => m.threadId === t.id).sort((a, b) => b.createdAt - a.createdAt)[0];
                  const Icon = channelIcon[t.channel];
                  const active = activeThread?.id === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => { setActiveId(t.id); if (t.unread > 0) markThreadRead(t.id); }}
                      className={cn(
                        "w-full text-left p-3 border-b border-border flex gap-3 transition-colors",
                        active ? "bg-secondary" : "hover:bg-secondary/40"
                      )}
                    >
                      <Avatar className="size-9 shrink-0">
                        <AvatarFallback>{initials(lead?.name ?? "?")}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className={cn("text-sm font-medium truncate", t.unread > 0 && "font-semibold")}>
                            {lead?.name ?? "Unknown"}
                          </span>
                          <span className="text-[10px] text-muted-foreground ml-auto shrink-0">
                            {timeShort(t.lastMessageAt)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Icon className={cn("size-3 shrink-0", channelColor[t.channel])} />
                          <span className="text-xs text-muted-foreground truncate">{t.subject}</span>
                        </div>
                        {last && (
                          <p className="text-xs text-muted-foreground truncate">
                            {last.direction === "outbound" && "You: "}{last.body}
                          </p>
                        )}
                      </div>
                      {t.unread > 0 && (
                        <span className="size-2 rounded-full bg-primary mt-1.5 shrink-0" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="flex flex-col">
            {!activeThread ? (
              <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
                Select a conversation to view messages
              </div>
            ) : (
              <>
                <div className="border-b border-border p-4 flex items-center gap-3">
                  <Avatar className="size-10">
                    <AvatarFallback>{initials(activeLead?.name ?? "?")}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{activeLead?.name ?? "Unknown"}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {activeThread.channel === "email" ? activeLead?.email : activeLead?.phone}
                    </div>
                  </div>
                  <Badge variant="outline" className="capitalize">{activeThread.channel}</Badge>
                  {activeLead && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/leads/${activeLead.id}`}>View lead</Link>
                    </Button>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-4 bg-secondary/20">
                  {threadMessages.map((m) => {
                    const out = m.direction === "outbound";
                    return (
                      <div key={m.id} className={cn("flex", out ? "justify-end" : "justify-start")}>
                        <div className={cn(
                          "max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm",
                          out ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-card border border-border rounded-bl-sm"
                        )}>
                          {m.subject && activeThread.channel === "email" && !out && (
                            <div className="text-xs font-semibold mb-1 opacity-80">{m.subject}</div>
                          )}
                          {m.callDuration ? (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="size-4" />
                              <span>Call · {Math.floor(m.callDuration / 60)}m {m.callDuration % 60}s</span>
                            </div>
                          ) : null}
                          <p className="text-sm whitespace-pre-wrap">{m.body}</p>
                          <div className={cn("text-[10px] mt-1", out ? "text-primary-foreground/70" : "text-muted-foreground")}>
                            {timeShort(m.createdAt)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={send} className="border-t border-border p-3 flex gap-2 items-end">
                  <Textarea
                    placeholder={`Type a ${activeThread.channel}…`}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    className="min-h-[44px] max-h-32 resize-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                        e.preventDefault();
                        send(e as unknown as React.FormEvent);
                      }
                    }}
                  />
                  <Button type="submit" disabled={!draft.trim()}>
                    <Send className="size-4" /> Send
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

function timeShort(ts: number) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}
