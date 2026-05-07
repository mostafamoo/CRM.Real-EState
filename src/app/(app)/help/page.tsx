"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, MessageCircle, Mail, Search, ChevronDown } from "lucide-react";

const articles = [
  { q: "How do I import leads from Zillow?", a: "Connect Zillow under Integrations, then enable auto-import. New leads sync within 5 minutes." },
  { q: "Can I use a custom domain for my microsite?", a: "Yes — Pro plans support custom domains. Go to Microsite → Settings to point your domain." },
  { q: "How are seats counted?", a: "Each active team member counts as a seat. You can add or remove seats anytime from Settings → Seats." },
  { q: "What's the difference between Deals and Offers?", a: "Deals are end-to-end transactions in your pipeline. Offers are individual buyer offers on listings — they roll up into a Deal." },
  { q: "How do I set up automations?", a: "Go to Automation → New automation. Pick a trigger (e.g. New lead) and an action (e.g. Send SMS)." },
];

export default function HelpPage() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<number | null>(0);
  const [contact, setContact] = useState({ subject: "", message: "" });

  const filtered = articles.filter((a) =>
    a.q.toLowerCase().includes(query.toLowerCase()) ||
    a.a.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Help & Support" description="Get answers and reach our team." />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5 space-y-3">
            <div className="size-10 rounded-md bg-primary/10 text-primary flex items-center justify-center">
              <BookOpen className="size-4" />
            </div>
            <div>
              <h3 className="font-semibold">Documentation</h3>
              <p className="text-sm text-muted-foreground">Browse guides and tutorials.</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => toast.info("Opening docs…")}>Open docs</Button>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 space-y-3">
            <div className="size-10 rounded-md bg-success/10 text-success flex items-center justify-center">
              <MessageCircle className="size-4" />
            </div>
            <div>
              <h3 className="font-semibold">Live chat</h3>
              <p className="text-sm text-muted-foreground">Avg. response &lt; 2 minutes.</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => toast.success("Chat connected")}>Start chat</Button>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 space-y-3">
            <div className="size-10 rounded-md bg-warning/15 text-warning-foreground flex items-center justify-center">
              <Mail className="size-4" />
            </div>
            <div>
              <h3 className="font-semibold">Email support</h3>
              <p className="text-sm text-muted-foreground">support@estata.app</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => { window.location.href = "mailto:support@estata.app"; }}>Send email</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Frequently asked</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input placeholder="Search articles…" className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <ul className="divide-y divide-border">
            {filtered.length === 0 && <li className="py-6 text-center text-sm text-muted-foreground">No articles match.</li>}
            {filtered.map((a, i) => (
              <li key={i} className="py-3">
                <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between text-left">
                  <span className="font-medium">{a.q}</span>
                  <ChevronDown className={`size-4 transition-transform ${open === i ? "rotate-180" : ""}`} />
                </button>
                {open === i && <p className="mt-2 text-sm text-muted-foreground">{a.a}</p>}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Send us a message</CardTitle></CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={(e) => { e.preventDefault(); toast.success("Thanks! We'll get back to you within 24h."); setContact({ subject: "", message: "" }); }}
          >
            <div className="space-y-1.5">
              <Label>Subject</Label>
              <Input value={contact.subject} onChange={(e) => setContact({ ...contact, subject: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <Label>Message</Label>
              <Textarea rows={5} value={contact.message} onChange={(e) => setContact({ ...contact, message: e.target.value })} required />
            </div>
            <div className="flex justify-end">
              <Button type="submit">Send message</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
