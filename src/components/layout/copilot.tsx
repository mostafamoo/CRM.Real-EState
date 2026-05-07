"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, X, Send, MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useCRM } from "@/lib/store";
import { cn, formatCurrency } from "@/lib/utils";
import { leadScore } from "@/lib/scoring";

type Msg = { role: "user" | "assistant"; content: string; ts: number };

export function Copilot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Hi! I'm your Estata copilot. Ask me about your leads, deals, or marketing. Try \"what should I do today?\"", ts: Date.now() },
  ]);
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const leads = useCRM((s) => s.leads);
  const deals = useCRM((s) => s.deals);
  const tasks = useCRM((s) => s.tasks);
  const listings = useCRM((s) => s.listings);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  function answer(q: string): string {
    const Q = q.toLowerCase();
    if (/today|priority|focus|do/.test(Q)) {
      const hot = leads.map((l) => ({ l, s: leadScore(l) })).filter((x) => x.s.label === "Hot" || x.s.label === "Burning").slice(0, 3);
      const overdue = tasks.filter((t) => t.status !== "Done" && new Date(t.due) < new Date()).slice(0, 3);
      let out = "Here's what I'd focus on today:\n\n";
      if (hot.length) {
        out += "🔥 **Hot leads to call:**\n";
        hot.forEach(({ l, s }) => out += `• ${l.name} (score ${s.score}) — ${formatCurrency(l.budget)} budget\n`);
        out += "\n";
      }
      if (overdue.length) {
        out += "⏰ **Overdue tasks:**\n";
        overdue.forEach((t) => out += `• ${t.title} (due ${t.due})\n`);
      }
      if (!hot.length && !overdue.length) out = "Nothing urgent today — great time to prospect or follow up with warm leads.";
      return out;
    }
    if (/summary|stats|how.*doing/.test(Q)) {
      const open = deals.filter((d) => d.stage !== "Closed").reduce((s, d) => s + d.amount, 0);
      const closed = deals.filter((d) => d.stage === "Closed").length;
      return `📊 **Workspace snapshot**\n• ${leads.length} leads (${leads.filter((l) => l.status === "qualified").length} qualified)\n• ${listings.length} listings (${listings.filter((l) => l.status === "Active").length} active)\n• ${formatCurrency(open)} in open deal volume\n• ${closed} deals closed`;
    }
    if (/email.*draft|write.*email|draft.*to/.test(Q)) {
      const lead = leads[0];
      return `Here's a draft for ${lead?.name ?? "your lead"}:\n\n**Subject:** Following up on your home search\n\nHi ${lead?.name.split(" ")[0] ?? "there"},\n\nI hope you're doing well! I wanted to check in and see how your home search is going. Based on our last conversation, I have a couple of new listings that match your preferences in ${lead?.city ?? "your area"}.\n\nWould you have time for a quick call this week?\n\nBest,\nTaylor`;
    }
    if (/listing.*description|describe.*listing/.test(Q)) {
      const l = listings[0];
      return l ? `**${l.address}**\n\nWelcome to this stunning ${l.beds}-bedroom, ${l.baths}-bathroom home in the heart of ${l.city}. Featuring ${l.sqft.toLocaleString()} sq ft of thoughtfully designed living space, this property offers an open-concept layout, premium finishes, and abundant natural light. Walk to top-rated schools, transit, and dining. Listed at ${formatCurrency(l.price)}.` : "No listings yet — add one first.";
    }
    if (/match|recommend.*for/.test(Q)) {
      return `🎯 I'd recommend looking at the **Matches** tab on each lead's detail page — I score listings against their budget and city automatically.`;
    }
    if (/score|hot|burning/.test(Q)) {
      const burning = leads.map((l) => ({ l, s: leadScore(l) })).filter((x) => x.s.label === "Burning");
      const hot = leads.map((l) => ({ l, s: leadScore(l) })).filter((x) => x.s.label === "Hot");
      return `🔥 You have **${burning.length} burning** and **${hot.length} hot** leads.\n\n${[...burning, ...hot].slice(0, 5).map(({ l, s }) => `• ${l.name} — ${s.score}/100`).join("\n")}`;
    }
    if (/help|what can you do/.test(Q)) {
      return "I can help you with:\n• Daily priorities — \"what should I do today?\"\n• Workspace stats — \"give me a summary\"\n• Drafting emails — \"draft an email to a lead\"\n• Listing descriptions — \"describe a listing\"\n• Lead scoring — \"who are my hot leads?\"\n• Recommendations and more.";
    }
    return `I'm not sure how to answer that yet. Try:\n• "What should I do today?"\n• "Give me a workspace summary"\n• "Draft an email to a lead"\n• "Who are my hot leads?"`;
  }

  function send() {
    if (!input.trim() || busy) return;
    const q = input.trim();
    setMessages((m) => [...m, { role: "user", content: q, ts: Date.now() }]);
    setInput("");
    setBusy(true);
    setTimeout(() => {
      setMessages((m) => [...m, { role: "assistant", content: answer(q), ts: Date.now() }]);
      setBusy(false);
    }, 600);
  }

  const suggestions = [
    "What should I do today?",
    "Give me a workspace summary",
    "Who are my hot leads?",
    "Draft an email to a lead",
  ];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-40 size-14 rounded-full bg-primary text-primary-foreground shadow-xl flex items-center justify-center hover:scale-105 transition-transform",
          open && "hidden"
        )}
        aria-label="Open AI copilot"
      >
        <Sparkles className="size-6" />
        <span className="absolute -top-1 -right-1 rounded-full bg-warning text-warning-foreground text-[9px] font-bold px-1.5 py-0.5">AI</span>
      </button>

      <div
        className={cn(
          "fixed bottom-0 right-0 lg:bottom-6 lg:right-6 z-40 w-full lg:w-[400px] h-[80vh] lg:h-[600px] lg:rounded-2xl bg-card border border-border shadow-2xl flex flex-col transition-all",
          open ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
        )}
      >
        <div className="flex items-center gap-3 border-b border-border p-4">
          <div className="size-9 rounded-md bg-primary text-primary-foreground flex items-center justify-center">
            <Sparkles className="size-4" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-sm">Estata Copilot</div>
            <div className="text-[10px] text-muted-foreground">Powered by AI · Demo mode</div>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={() => setOpen(false)}>
            <X className="size-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={cn("flex gap-2", m.role === "user" ? "justify-end" : "justify-start")}>
              {m.role === "assistant" && (
                <Avatar className="size-7 shrink-0">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Sparkles className="size-3.5" />
                  </AvatarFallback>
                </Avatar>
              )}
              <div className={cn(
                "max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap",
                m.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-secondary rounded-bl-sm"
              )}>
                {m.content}
              </div>
            </div>
          ))}
          {busy && (
            <div className="flex gap-2">
              <Avatar className="size-7 shrink-0">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <Sparkles className="size-3.5" />
                </AvatarFallback>
              </Avatar>
              <div className="rounded-2xl px-3 py-2 bg-secondary">
                <div className="flex gap-1">
                  <span className="size-1.5 rounded-full bg-muted-foreground/60 animate-pulse" />
                  <span className="size-1.5 rounded-full bg-muted-foreground/60 animate-pulse [animation-delay:200ms]" />
                  <span className="size-1.5 rounded-full bg-muted-foreground/60 animate-pulse [animation-delay:400ms]" />
                </div>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {messages.length <= 2 && (
          <div className="px-4 pb-2 flex flex-wrap gap-1.5">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => { setInput(s); setTimeout(send, 50); }}
                className="text-xs rounded-full border border-border bg-card hover:bg-secondary px-2.5 py-1"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div className="border-t border-border p-3 flex gap-2">
          <Textarea
            placeholder="Ask anything…"
            className="min-h-[40px] max-h-32 resize-none text-sm"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
          />
          <Button onClick={send} size="icon" disabled={!input.trim() || busy}>
            <Send className="size-4" />
          </Button>
        </div>
      </div>
    </>
  );
}
