"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ListingFormDialog } from "@/components/dialogs/listing-form";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";
import { useCRM } from "@/lib/store";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { Plus, Search, Bed, Bath, Maximize2, MapPin, Heart, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import type { Listing } from "@/lib/mock-data";

const statusVariant = {
  Active: "success",
  Pending: "warning",
  Sold: "muted",
  "Off-market": "destructive",
} as const;

export default function ListingsPage() {
  const listings = useCRM((s) => s.listings);
  const deleteListing = useCRM((s) => s.deleteListing);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [favs, setFavs] = useState<Set<string>>(new Set());
  const [view, setView] = useState<"grid" | "map">("grid");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Listing | undefined>();
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let data = listings;
    if (query) {
      const q = query.toLowerCase();
      data = data.filter((l) =>
        l.address.toLowerCase().includes(q) ||
        l.city.toLowerCase().includes(q) ||
        l.id.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") data = data.filter((l) => l.status === statusFilter);
    return data;
  }, [listings, query, statusFilter]);

  function toggleFav(id: string) {
    setFavs((f) => {
      const n = new Set(f);
      if (n.has(id)) { n.delete(id); toast("Removed from favorites"); }
      else { n.add(id); toast.success("Added to favorites"); }
      return n;
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Listings"
        description={`${filtered.length} of ${listings.length} listings · ${formatCurrency(filtered.reduce((s, l) => s + l.price, 0))} total`}
        actions={
          <Button size="sm" onClick={() => { setEditing(undefined); setFormOpen(true); }}>
            <Plus className="size-4" /> New listing
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-64 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input placeholder="Search by address, MLS#…" className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Sold">Sold</SelectItem>
            <SelectItem value="Off-market">Off-market</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex gap-1 ml-auto">
          <Button variant={view === "grid" ? "default" : "outline"} size="sm" onClick={() => setView("grid")}>Grid</Button>
          <Button variant={view === "map" ? "default" : "outline"} size="sm" onClick={() => setView("map")}>Map</Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card><CardContent className="p-12 text-center text-muted-foreground text-sm">No listings match.</CardContent></Card>
      ) : view === "map" ? (
        <Card>
          <CardContent className="p-0">
            <div className="grid grid-cols-[1fr_360px] h-[600px]">
              <div className="relative bg-gradient-to-br from-emerald-50 via-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:via-emerald-900/20 dark:to-teal-900/20 overflow-hidden">
                <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 800 600" preserveAspectRatio="none">
                  <defs>
                    <pattern id="grid2" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="800" height="600" fill="url(#grid2)" />
                  <path d="M 0,300 Q 200,250 400,320 T 800,350" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.5" />
                  <path d="M 100,0 L 200,600" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.4" />
                </svg>
                {filtered.slice(0, 12).map((l, i) => {
                  const x = 10 + ((i * 7) % 80);
                  const y = 15 + ((i * 11) % 70);
                  return (
                    <Link key={l.id} href={`/listings/${l.id}`} className="absolute" style={{ left: `${x}%`, top: `${y}%` }}>
                      <div className="relative -translate-x-1/2 -translate-y-full">
                        <div className="rounded-full bg-card text-foreground shadow-lg ring-2 ring-primary px-3 py-1 text-xs font-semibold whitespace-nowrap hover:bg-primary hover:text-primary-foreground transition-colors">
                          {formatCurrency(l.price)}
                        </div>
                        <div className="size-2 bg-primary rounded-full mx-auto -mt-0.5 ring-2 ring-card" />
                      </div>
                    </Link>
                  );
                })}
              </div>
              <div className="overflow-y-auto scrollbar-thin border-l border-border">
                {filtered.map((l) => (
                  <Link key={l.id} href={`/listings/${l.id}`} className="flex gap-3 p-3 border-b border-border hover:bg-secondary/40">
                    <div className="size-16 rounded-md bg-gradient-to-br from-secondary to-muted shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm">{formatCurrency(l.price)}</div>
                      <div className="text-xs truncate">{l.address}</div>
                      <div className="text-xs text-muted-foreground">{l.city}, {l.state}</div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                        <span>{l.beds} bd</span><span>·</span><span>{l.baths} ba</span><span>·</span><span>{formatNumber(l.sqft)} sf</span>
                      </div>
                    </div>
                    <Badge variant={statusVariant[l.status]} className="shrink-0 self-start text-[10px]">{l.status}</Badge>
                  </Link>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((l) => (
            <Card key={l.id} className="overflow-hidden group">
              <div className="relative aspect-[4/3] bg-gradient-to-br from-secondary to-muted overflow-hidden">
                <div className="absolute inset-0 [background:radial-gradient(15rem_15rem_at_50%_60%,_var(--color-primary)_0%,_transparent_50%)] opacity-25" />
                <div className="absolute top-3 left-3">
                  <Badge variant={statusVariant[l.status]}>{l.status}</Badge>
                </div>
                <button
                  onClick={() => toggleFav(l.id)}
                  className="absolute top-3 right-3 size-8 rounded-full bg-card/90 backdrop-blur flex items-center justify-center shadow-sm hover:bg-card"
                >
                  <Heart className={`size-4 ${favs.has(l.id) ? "fill-destructive text-destructive" : ""}`} />
                </button>
                <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                  <span className="rounded-md bg-foreground/40 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
                    MLS · {l.id}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm" className="bg-card/90 backdrop-blur shadow-sm hover:bg-card">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => { setEditing(l); setFormOpen(true); }}>
                        <Pencil className="size-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setConfirmId(l.id)}>
                        <Trash2 className="size-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <CardContent className="p-5 space-y-3">
                <Link href={`/listings/${l.id}`} className="block group/link">
                  <div className="text-lg font-semibold">{formatCurrency(l.price)}</div>
                  <div className="font-medium group-hover/link:text-primary transition-colors">{l.address}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="size-3.5" />
                    {l.city}, {l.state}
                  </div>
                </Link>
                <div className="flex items-center gap-4 text-sm text-muted-foreground border-t border-border pt-3">
                  <span className="flex items-center gap-1.5"><Bed className="size-4" /> {l.beds}</span>
                  <span className="flex items-center gap-1.5"><Bath className="size-4" /> {l.baths}</span>
                  <span className="flex items-center gap-1.5"><Maximize2 className="size-4" /> {formatNumber(l.sqft)} sqft</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Listed by <span className="text-foreground font-medium">{l.agent}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ListingFormDialog open={formOpen} onOpenChange={setFormOpen} listing={editing} />
      <ConfirmDialog
        open={confirmId !== null}
        onOpenChange={(o) => !o && setConfirmId(null)}
        onConfirm={() => { if (confirmId) { deleteListing(confirmId); toast.success("Listing deleted"); } }}
        title="Delete this listing?"
      />
    </div>
  );
}
