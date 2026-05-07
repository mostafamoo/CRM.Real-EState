"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListingFormDialog } from "@/components/dialogs/listing-form";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";
import { useCRM } from "@/lib/store";
import { formatCurrency, formatNumber, initials } from "@/lib/utils";
import {
  Bed, Bath, Maximize2, MapPin, Pencil, Trash2, Heart, Share2, Calendar,
  DollarSign, FileText, KeyRound, DoorOpen, ChevronLeft, ChevronRight,
} from "lucide-react";

const statusVariant = {
  Active: "success",
  Pending: "warning",
  Sold: "muted",
  "Off-market": "destructive",
} as const;

export default function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const allListings = useCRM((s) => s.listings);
  const offers = useCRM((s) => s.offers);
  const allShowings = useCRM((s) => s.showings);
  const allOpenHouses = useCRM((s) => s.openHouses);
  const allDocuments = useCRM((s) => s.documents);
  const leads = useCRM((s) => s.leads);
  const deleteListing = useCRM((s) => s.deleteListing);

  const listing = useMemo(() => allListings.find((l) => l.id === id), [allListings, id]);
  const showings = useMemo(() => allShowings.filter((sh) => sh.listingId === id), [allShowings, id]);
  const openHouses = useMemo(() => allOpenHouses.filter((oh) => oh.listingId === id), [allOpenHouses, id]);
  const documents = useMemo(() => allDocuments.filter((d) => d.relatedType === "listing" && d.relatedId === id), [allDocuments, id]);

  const [photoIdx, setPhotoIdx] = useState(0);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!listing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-3">
        <h2 className="text-xl font-semibold">Listing not found</h2>
        <Button onClick={() => router.push("/listings")}>Back to listings</Button>
      </div>
    );
  }

  const listingOffers = offers.filter((o) => o.listing.includes(listing.address));
  const photoCount = 6;

  return (
    <div className="space-y-6">
      <PageHeader
        title={listing.address}
        crumbs={[{ label: "Listings", href: "/listings" }, { label: listing.id }]}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Link copied"); }}>
              <Share2 className="size-4" /> Share
            </Button>
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
        <Card className="lg:col-span-2 overflow-hidden">
          <div className="relative aspect-[16/10] bg-gradient-to-br from-secondary to-muted overflow-hidden">
            <div
              className="absolute inset-0 transition-opacity"
              style={{
                background: `radial-gradient(15rem 15rem at ${30 + photoIdx * 10}% ${50 + photoIdx * 5}%, var(--color-primary) 0%, transparent 50%)`,
                opacity: 0.25,
              }}
            />
            <div className="absolute top-3 left-3 flex gap-2">
              <Badge variant={statusVariant[listing.status]}>{listing.status}</Badge>
              <Badge variant="outline" className="bg-card/90 backdrop-blur">MLS · {listing.id}</Badge>
            </div>
            <button
              onClick={() => setPhotoIdx((i) => (i - 1 + photoCount) % photoCount)}
              className="absolute left-3 top-1/2 -translate-y-1/2 size-9 rounded-full bg-card/90 backdrop-blur shadow-sm flex items-center justify-center hover:bg-card"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              onClick={() => setPhotoIdx((i) => (i + 1) % photoCount)}
              className="absolute right-3 top-1/2 -translate-y-1/2 size-9 rounded-full bg-card/90 backdrop-blur shadow-sm flex items-center justify-center hover:bg-card"
            >
              <ChevronRight className="size-4" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {Array.from({ length: photoCount }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPhotoIdx(i)}
                  className={`size-1.5 rounded-full transition-all ${i === photoIdx ? "w-4 bg-white" : "bg-white/50"}`}
                />
              ))}
            </div>
          </div>

          <CardContent className="p-6 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-3xl font-semibold tracking-tight">{formatCurrency(listing.price)}</div>
                <div className="flex items-center gap-1 mt-1 text-muted-foreground text-sm">
                  <MapPin className="size-3.5" />
                  {listing.city}, {listing.state}
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => toast.success("Saved to favorites")}>
                <Heart className="size-4" />
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4 border-t border-b border-border py-4">
              <Stat icon={<Bed className="size-4" />} label="Bedrooms" value={String(listing.beds)} />
              <Stat icon={<Bath className="size-4" />} label="Bathrooms" value={String(listing.baths)} />
              <Stat icon={<Maximize2 className="size-4" />} label="Sq Ft" value={formatNumber(listing.sqft)} />
            </div>

            <div>
              <h3 className="font-semibold mb-2">About this home</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                A beautifully maintained {listing.beds}-bedroom, {listing.baths}-bath home in the heart of {listing.city}.
                Featuring an open-concept layout, hardwood floors throughout, an updated kitchen with stainless appliances,
                and a private outdoor space. Walkable to top-rated schools, transit, and dining.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Listing agent</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center gap-3">
              <Avatar className="size-12"><AvatarFallback>{initials(listing.agentName)}</AvatarFallback></Avatar>
              <div>
                <div className="font-medium">{listing.agentName}</div>
                <div className="text-xs text-muted-foreground">Listing agent</div>
              </div>
            </div>
            <hr className="border-border" />
            <div className="grid grid-cols-2 gap-2">
              <Button size="sm" onClick={() => toast.success("Showing booked")}>
                <KeyRound className="size-4" /> Book showing
              </Button>
              <Button variant="outline" size="sm" onClick={() => toast.info("Open house created")}>
                <DoorOpen className="size-4" /> Open house
              </Button>
              <Button variant="outline" size="sm" onClick={() => toast.info("Submit offer")}>
                <DollarSign className="size-4" /> Submit offer
              </Button>
              <Button variant="outline" size="sm" onClick={() => toast.info("Documents")}>
                <FileText className="size-4" /> Documents
              </Button>
            </div>
            <hr className="border-border" />
            <div className="text-xs text-muted-foreground space-y-1">
              <div>Listed: {new Date().toLocaleDateString()}</div>
              <div>Days on market: 14</div>
              <div>Price/sqft: {formatCurrency(Math.round(listing.price / listing.sqft))}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="offers">
        <TabsList>
          <TabsTrigger value="offers">Offers ({listingOffers.length})</TabsTrigger>
          <TabsTrigger value="showings">Showings ({showings.length})</TabsTrigger>
          <TabsTrigger value="open-houses">Open houses ({openHouses.length})</TabsTrigger>
          <TabsTrigger value="documents">Documents ({documents.length})</TabsTrigger>
          <TabsTrigger value="map">Location</TabsTrigger>
        </TabsList>

        <TabsContent value="offers" className="space-y-3">
          {listingOffers.length === 0 ? (
            <Card><CardContent className="p-12 text-center text-sm text-muted-foreground">No offers yet on this listing.</CardContent></Card>
          ) : (
            listingOffers.map((o) => (
              <Card key={o.id}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="flex-1">
                    <div className="font-medium">{o.buyer}</div>
                    <div className="text-xs text-muted-foreground">{o.id} · {o.date}</div>
                  </div>
                  <div className="text-lg font-semibold">{formatCurrency(o.amount)}</div>
                  <Badge variant={o.status === "Accepted" ? "success" : o.status === "Counter" ? "warning" : o.status === "Rejected" ? "destructive" : "secondary"}>{o.status}</Badge>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="showings" className="space-y-3">
          {showings.length === 0 ? (
            <Card><CardContent className="p-12 text-center text-sm text-muted-foreground">No showings scheduled yet.</CardContent></Card>
          ) : (
            showings.map((sh) => {
              const lead = leads.find((l) => l.id === sh.leadId);
              return (
                <Card key={sh.id}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="size-9 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                      <KeyRound className="size-4" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{lead?.name ?? "Unknown buyer"}</div>
                      <div className="text-xs text-muted-foreground">{sh.date} at {sh.time} · {sh.agentName}</div>
                    </div>
                    <Badge variant={sh.status === "Completed" ? "success" : sh.status === "Cancelled" ? "muted" : "secondary"}>{sh.status}</Badge>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="open-houses" className="space-y-3">
          {openHouses.length === 0 ? (
            <Card><CardContent className="p-12 text-center text-sm text-muted-foreground">No open houses scheduled.</CardContent></Card>
          ) : (
            openHouses.map((oh) => (
              <Card key={oh.id}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="size-9 rounded-md bg-accent text-accent-foreground flex items-center justify-center">
                    <DoorOpen className="size-4" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{oh.date}</div>
                    <div className="text-xs text-muted-foreground">{oh.startTime} - {oh.endTime} · {oh.attendees.length} attendees</div>
                  </div>
                  <Badge variant={oh.status === "Done" ? "muted" : "secondary"}>{oh.status}</Badge>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="documents" className="space-y-3">
          {documents.length === 0 ? (
            <Card><CardContent className="p-12 text-center text-sm text-muted-foreground">No documents linked yet.</CardContent></Card>
          ) : (
            documents.map((d) => (
              <Card key={d.id}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="size-9 rounded-md bg-secondary flex items-center justify-center">
                    <FileText className="size-4" />
                  </div>
                  <div className="flex-1">
                    <Link href="/documents" className="font-medium hover:text-primary">{d.name}</Link>
                    <div className="text-xs text-muted-foreground">{d.type}</div>
                  </div>
                  <Badge variant={d.status === "Signed" ? "success" : d.status === "Sent" ? "warning" : "muted"}>{d.status}</Badge>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="map">
          <Card>
            <CardContent className="p-0 aspect-[16/9] bg-gradient-to-br from-emerald-50 via-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:via-emerald-900/20 dark:to-teal-900/20 relative overflow-hidden flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 800 450" preserveAspectRatio="none">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="800" height="450" fill="url(#grid)" />
                <path d="M 0,200 Q 200,150 400,220 T 800,250" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.5" />
                <path d="M 100,0 L 200,450" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.4" />
                <path d="M 500,0 L 600,450" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.4" />
              </svg>
              <div className="relative z-10 size-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg ring-4 ring-card">
                <MapPin className="size-5" />
              </div>
              <div className="absolute bottom-4 left-4 right-4 max-w-md">
                <Card>
                  <CardContent className="p-3">
                    <div className="font-medium text-sm">{listing.address}</div>
                    <div className="text-xs text-muted-foreground">{listing.city}, {listing.state}</div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ListingFormDialog open={editOpen} onOpenChange={setEditOpen} listing={listing} />
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={() => { deleteListing(listing.id); toast.success("Listing deleted"); router.push("/listings"); }}
        title="Delete this listing?"
        description={`${listing.address} will be permanently removed.`}
      />
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-muted-foreground flex items-center justify-center mb-1">{icon}</div>
      <div className="text-xl font-semibold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
