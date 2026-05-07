"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCRM } from "@/lib/store";
import { matchListings } from "@/lib/scoring";
import { formatCurrency, formatNumber, initials } from "@/lib/utils";
import {
  Bed, Bath, Maximize2, Heart, Share2, ExternalLink, KeyRound, FileText, MessageSquare, Eye,
} from "lucide-react";

export default function PortalPage() {
  const leads = useCRM((s) => s.leads);
  const listings = useCRM((s) => s.listings);
  const showings = useCRM((s) => s.showings);
  const documents = useCRM((s) => s.documents);
  const offers = useCRM((s) => s.offers);

  const [leadId, setLeadId] = useState(leads[0]?.id ?? "");
  const lead = leads.find((l) => l.id === leadId);

  if (!lead) {
    return <div className="p-12 text-center text-muted-foreground">No lead selected.</div>;
  }

  const matches = matchListings(lead, listings.filter((l) => l.status === "Active"));
  const myShowings = showings.filter((sh) => sh.leadId === lead.id);
  const myDocs = documents.filter((d) => d.signers.some((s) => s.email === lead.email));
  const myOffers = offers.filter((o) => o.buyer === lead.name);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Buyer/Seller portal"
        description="Client-facing view — what your leads see when they log in"
        actions={
          <>
            <Select value={leadId} onValueChange={setLeadId}>
              <SelectTrigger className="w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {leads.map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(`https://portal.estata.app/${lead.id}`); toast.success("Portal link copied"); }}>
              <Share2 className="size-4" /> Copy link
            </Button>
          </>
        }
      />

      {/* Mock browser frame */}
      <div className="rounded-2xl border border-border overflow-hidden bg-background shadow-lg">
        <div className="flex items-center gap-2 border-b border-border bg-secondary/40 px-4 py-2">
          <span className="size-3 rounded-full bg-destructive/40" />
          <span className="size-3 rounded-full bg-warning/40" />
          <span className="size-3 rounded-full bg-success/40" />
          <div className="flex-1 mx-4 rounded-md bg-card border border-border px-3 py-1 text-xs text-muted-foreground flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-success" />
            portal.estata.app/{lead.id}
          </div>
          <Eye className="size-3.5 text-muted-foreground" />
        </div>

        <div className="p-6 lg:p-10 space-y-8 bg-background">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <Avatar className="size-12"><AvatarFallback>{initials(lead.name)}</AvatarFallback></Avatar>
              <div>
                <div className="text-sm text-muted-foreground">Welcome back,</div>
                <h2 className="text-xl font-semibold">{lead.name.split(" ")[0]}</h2>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
              <Avatar className="size-10"><AvatarFallback>{initials(lead.agentName)}</AvatarFallback></Avatar>
              <div>
                <div className="text-xs text-muted-foreground">Your agent</div>
                <div className="text-sm font-medium">{lead.agentName}</div>
              </div>
              <Button size="sm" variant="outline" onClick={() => toast.success("Message sent to agent")}>
                <MessageSquare className="size-3.5" /> Message
              </Button>
            </div>
          </div>

          <Tabs defaultValue="recommendations">
            <TabsList>
              <TabsTrigger value="recommendations">Recommended ({matches.length})</TabsTrigger>
              <TabsTrigger value="tours">My tours ({myShowings.length})</TabsTrigger>
              <TabsTrigger value="offers">My offers ({myOffers.length})</TabsTrigger>
              <TabsTrigger value="documents">Documents ({myDocs.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="recommendations" className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {matches.length === 0 ? (
                  <Card className="sm:col-span-2 lg:col-span-3"><CardContent className="p-8 text-center text-muted-foreground text-sm">No matches yet.</CardContent></Card>
                ) : matches.map((l) => (
                  <Card key={l.id} className="overflow-hidden">
                    <Link href={`/listings/${l.id}`}>
                      <div className="aspect-[4/3] bg-gradient-to-br from-secondary to-muted relative">
                        <div className="absolute inset-0 [background:radial-gradient(12rem_12rem_at_60%_50%,_var(--color-primary),_transparent)] opacity-20" />
                        <Button variant="ghost" size="icon-sm" className="absolute top-2 right-2 bg-card/90 backdrop-blur" onClick={(e) => { e.preventDefault(); toast.success("Saved"); }}>
                          <Heart className="size-4" />
                        </Button>
                      </div>
                    </Link>
                    <CardContent className="p-4">
                      <div className="font-semibold">{formatCurrency(l.price)}</div>
                      <div className="text-sm">{l.address}</div>
                      <div className="text-xs text-muted-foreground">{l.city}, {l.state}</div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2 border-t border-border pt-2">
                        <span className="flex items-center gap-1"><Bed className="size-3" /> {l.beds}</span>
                        <span className="flex items-center gap-1"><Bath className="size-3" /> {l.baths}</span>
                        <span className="flex items-center gap-1"><Maximize2 className="size-3" /> {formatNumber(l.sqft)}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 mt-3">
                        <Button size="sm" variant="outline" onClick={() => toast.success("Tour requested")}>
                          <KeyRound className="size-3" /> Tour
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => toast.success("Question sent")}>
                          <MessageSquare className="size-3" /> Ask
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="tours" className="space-y-3">
              {myShowings.length === 0 ? (
                <Card><CardContent className="p-12 text-center text-muted-foreground text-sm">No tours scheduled.</CardContent></Card>
              ) : myShowings.map((sh) => {
                const listing = listings.find((l) => l.id === sh.listingId);
                return (
                  <Card key={sh.id}>
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="size-10 rounded-md bg-primary/10 text-primary flex items-center justify-center"><KeyRound className="size-4" /></div>
                      <div className="flex-1">
                        <div className="font-medium">{listing?.address ?? "Listing"}</div>
                        <div className="text-xs text-muted-foreground">{sh.date} at {sh.time} · {sh.agentName}</div>
                      </div>
                      <Badge variant={sh.status === "Completed" ? "success" : "secondary"}>{sh.status}</Badge>
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>

            <TabsContent value="offers" className="space-y-3">
              {myOffers.length === 0 ? (
                <Card><CardContent className="p-12 text-center text-muted-foreground text-sm">No offers yet.</CardContent></Card>
              ) : myOffers.map((o) => (
                <Card key={o.id}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="flex-1">
                      <div className="font-medium">{o.listing}</div>
                      <div className="text-xs text-muted-foreground">{o.id} · {o.date}</div>
                    </div>
                    <div className="text-lg font-semibold">{formatCurrency(o.amount)}</div>
                    <Badge variant={o.status === "Accepted" ? "success" : o.status === "Counter" ? "warning" : o.status === "Rejected" ? "destructive" : "secondary"}>{o.status}</Badge>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="documents" className="space-y-3">
              {myDocs.length === 0 ? (
                <Card><CardContent className="p-12 text-center text-muted-foreground text-sm">No documents.</CardContent></Card>
              ) : myDocs.map((d) => {
                const sig = d.signers.find((s) => s.email === lead.email);
                return (
                  <Card key={d.id}>
                    <CardContent className="p-4 flex items-center gap-4">
                      <FileText className="size-5 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="font-medium">{d.name}</div>
                        <div className="text-xs text-muted-foreground">{d.type}</div>
                      </div>
                      {sig?.signed ? (
                        <Badge variant="success">Signed</Badge>
                      ) : (
                        <Button size="sm" onClick={() => toast.info("Opening signing flow…")}>
                          <ExternalLink className="size-3" /> Sign now
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
