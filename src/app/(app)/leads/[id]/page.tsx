"use client";

import { use, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { LeadStatusBadge } from "@/components/common/lead-status";
import { LeadFormDialog } from "@/components/dialogs/lead-form";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";
import { TagPicker } from "@/components/common/tag-picker";
import { CommentsThread } from "@/components/common/comments-thread";
import { useCRM } from "@/lib/store";
import { formatCurrency, formatNumber, initials } from "@/lib/utils";
import { leadScore, scoreColor, matchListings } from "@/lib/scoring";
import {
  Mail, Phone, MapPin, Calendar, MessageSquare, PhoneCall, Pencil, Trash2,
  Sparkles, Inbox, Bed, Bath, Maximize2, MessageCircle,
} from "lucide-react";

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const allLeads = useCRM((s) => s.leads);
  const listings = useCRM((s) => s.listings);
  const allMessages = useCRM((s) => s.messages);
  const sendMessage = useCRM((s) => s.sendMessage);
  const allShowings = useCRM((s) => s.showings);
  const documents = useCRM((s) => s.documents);
  const deleteLead = useCRM((s) => s.deleteLead);

  const lead = useMemo(() => allLeads.find((l) => l.id === id), [allLeads, id]);
  const messages = useMemo(
    () => allMessages.filter((m) => m.leadId === id).sort((a, b) => b.createdAt - a.createdAt),
    [allMessages, id]
  );
  const showings = useMemo(() => allShowings.filter((sh) => sh.leadId === id), [allShowings, id]);

  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-3">
        <h2 className="text-xl font-semibold">Lead not found</h2>
        <Button onClick={() => router.push("/leads")}>Back to leads</Button>
      </div>
    );
  }

  const score = leadScore(lead);
  const matches = matchListings(lead, listings.filter((l) => l.status === "Active"));

  function quickMessage(channel: "email" | "sms" | "whatsapp" | "call") {
    if (!lead) return;
    if (channel === "call") {
      window.location.href = `tel:${lead.phone}`;
      sendMessage({
        threadId: `TH-${lead.id}-${Date.now()}`,
        channel: "call",
        direction: "outbound",
        leadId: lead.id,
        from: "tl@tl.com",
        to: lead.phone,
        body: "Call initiated",
        callDuration: 0,
      });
      toast.success(`Calling ${lead.name}`);
    } else {
      const subject = channel === "email" ? "Hello from Bay Realty" : "";
      const body = channel === "email"
        ? `Hi ${lead.name.split(" ")[0]}, just following up on your inquiry.`
        : `Hi ${lead.name.split(" ")[0]}, this is Taylor from Bay Realty.`;
      sendMessage({
        threadId: `TH-${lead.id}-${Date.now()}`,
        channel,
        direction: "outbound",
        leadId: lead.id,
        from: channel === "email" ? "tl@tl.com" : "tl",
        to: channel === "email" ? lead.email : lead.phone,
        subject,
        body,
      });
      toast.success(`${channel === "email" ? "Email" : channel.toUpperCase()} sent`);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={lead.name}
        crumbs={[{ label: "Leads", href: "/leads" }, { label: lead.id }]}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
              <Pencil className="size-4" /> Edit
            </Button>
            <Button variant="outline" size="sm" className="text-destructive" onClick={() => setConfirmOpen(true)}>
              <Trash2 className="size-4" /> Delete
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="pt-6 space-y-5">
            <div className="flex flex-col items-center text-center gap-3">
              <Avatar className="h-20 w-20 text-base">
                <AvatarFallback>{initials(lead.name)}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-lg font-semibold">{lead.name}</h2>
                <p className="text-sm text-muted-foreground">{lead.id}</p>
              </div>
              <div className="flex gap-2 flex-wrap justify-center">
                <LeadStatusBadge status={lead.status} />
                <Badge variant="outline">{lead.source}</Badge>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-secondary/40 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Sparkles className="size-3" /> Lead score
                </span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${scoreColor(score.label)}`}>
                  {score.label}
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-semibold">{score.score}</span>
                <span className="text-xs text-muted-foreground">/ 100</span>
              </div>
              <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${score.score}%` }} />
              </div>
            </div>

            <Separator />

            <div className="space-y-3 text-sm">
              <Row icon={<Mail className="size-4" />} label="Email" value={lead.email} />
              <Row icon={<Phone className="size-4" />} label="Phone" value={lead.phone} />
              <Row icon={<MapPin className="size-4" />} label="City" value={lead.city} />
              <Row icon={<Calendar className="size-4" />} label="Created" value={lead.createdAt} />
            </div>

            <Separator />

            <div>
              <div className="text-xs font-medium text-muted-foreground mb-2">Tags</div>
              <TagPicker leadId={lead.id} />
            </div>

            <Separator />

            <div className="grid grid-cols-4 gap-2">
              <Button variant="outline" size="sm" onClick={() => quickMessage("call")} title="Call">
                <PhoneCall className="size-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => quickMessage("email")} title="Email">
                <Mail className="size-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => quickMessage("sms")} title="SMS">
                <MessageSquare className="size-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => quickMessage("whatsapp")} title="WhatsApp">
                <MessageCircle className="size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="details">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="matches">Matches</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
              <TabsTrigger value="comments">Comments</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader><CardTitle>Contact details</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 text-sm">
                  <Field label="Full name" value={lead.name} />
                  <Field label="Email" value={lead.email} />
                  <Field label="Phone" value={lead.phone} />
                  <Field label="Source" value={lead.source} />
                  <Field label="City" value={lead.city} />
                  <Field label="Assigned agent" value={lead.agentName} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Property preferences</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 text-sm">
                  <Field label="Budget" value={formatCurrency(lead.budget)} />
                  <Field label="Property type" value="Single-family · Condo" />
                  <Field label="Bedrooms" value="3 +" />
                  <Field label="Bathrooms" value="2 +" />
                  <Field label="Preferred areas" value={`${lead.city}, surrounding`} />
                  <Field label="Timeline" value="3-6 months" />
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Score breakdown</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-1 text-sm">
                    {score.rationale.map((r, i) => (
                      <li key={i} className="flex justify-between border-b border-border last:border-0 py-1">
                        <span className="text-muted-foreground">{r.split(" +")[0]}</span>
                        <span className="font-medium">+{r.split(" +")[1]}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="matches" className="space-y-3">
              {matches.length === 0 ? (
                <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">No matching listings — try expanding budget or city.</CardContent></Card>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">Top {matches.length} listings matching {lead.name.split(" ")[0]}'s budget and location:</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {matches.map((l) => (
                      <Card key={l.id} className="overflow-hidden hover:shadow-md transition-shadow">
                        <Link href={`/listings/${l.id}`}>
                          <div className="aspect-[5/3] bg-gradient-to-br from-secondary to-muted relative">
                            <div className="absolute inset-0 [background:radial-gradient(10rem_10rem_at_60%_50%,_var(--color-primary),_transparent)] opacity-20" />
                          </div>
                        </Link>
                        <CardContent className="p-4 space-y-2">
                          <Link href={`/listings/${l.id}`} className="block">
                            <div className="font-semibold text-base">{formatCurrency(l.price)}</div>
                            <div className="text-sm">{l.address}</div>
                            <div className="text-xs text-muted-foreground">{l.city}, {l.state}</div>
                          </Link>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground border-t border-border pt-2">
                            <span className="flex items-center gap-1"><Bed className="size-3" /> {l.beds}</span>
                            <span className="flex items-center gap-1"><Bath className="size-3" /> {l.baths}</span>
                            <span className="flex items-center gap-1"><Maximize2 className="size-3" /> {formatNumber(l.sqft)}</span>
                          </div>
                          <Button size="sm" variant="outline" className="w-full" onClick={() => toast.success(`Sent ${l.address} to ${lead.name}`)}>
                            <Mail className="size-3" /> Send to {lead.name.split(" ")[0]}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="messages" className="space-y-4">
              {messages.length === 0 ? (
                <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">
                  <Inbox className="size-8 mx-auto mb-2 opacity-30" />
                  No messages yet. Use the contact buttons to start a conversation.
                </CardContent></Card>
              ) : (
                <Card>
                  <CardContent className="p-4 space-y-3">
                    {messages.slice(0, 10).map((m) => (
                      <div key={m.id} className={`p-3 rounded-lg ${m.direction === "outbound" ? "bg-primary/5 border-l-2 border-primary" : "bg-secondary/40"}`}>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                          <Badge variant="outline" className="capitalize">{m.channel}</Badge>
                          <span>{m.direction === "outbound" ? "You sent" : "Received"}</span>
                          <span>· {timeAgo(m.createdAt)}</span>
                        </div>
                        <p className="text-sm">{m.body}</p>
                      </div>
                    ))}
                    <Button asChild variant="ghost" size="sm" className="w-full">
                      <Link href="/inbox">Open inbox</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="comments">
              <Card>
                <CardContent className="pt-6">
                  <CommentsThread entityType="lead" entityId={lead.id} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity">
              <Card>
                <CardContent className="pt-6">
                  <ul className="relative space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-border">
                    {showings.map((sh) => (
                      <li key={sh.id} className="relative pl-9">
                        <span className="absolute left-0 top-1 flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">SH</span>
                        <div className="text-sm font-medium">Showing scheduled · {sh.date} {sh.time}</div>
                        <div className="text-xs text-muted-foreground">Status: {sh.status}</div>
                      </li>
                    ))}
                    {documents.filter((d) => d.signers.some((s) => s.email === lead.email)).map((d) => (
                      <li key={d.id} className="relative pl-9">
                        <span className="absolute left-0 top-1 flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">DOC</span>
                        <div className="text-sm font-medium">Document: {d.name}</div>
                        <div className="text-xs text-muted-foreground">Status: {d.status}</div>
                      </li>
                    ))}
                    {messages.slice(0, 5).map((m) => (
                      <li key={m.id} className="relative pl-9">
                        <span className="absolute left-0 top-1 flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase">{m.channel.charAt(0)}</span>
                        <div className="text-sm font-medium">{m.direction === "outbound" ? "Sent" : "Received"} {m.channel}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1">{m.body}</div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <LeadFormDialog open={editOpen} onOpenChange={setEditOpen} lead={lead} />
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={() => { deleteLead(lead.id); toast.success("Lead deleted"); router.push("/leads"); }}
        title="Delete this lead?"
        description={`${lead.name} will be permanently removed.`}
      />
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-2 text-muted-foreground">
        {icon}<span className="text-xs">{label}</span>
      </span>
      <span className="text-foreground font-medium truncate">{value}</span>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-medium mt-0.5">{value}</div>
    </div>
  );
}

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
