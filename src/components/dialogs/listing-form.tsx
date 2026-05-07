"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCRM } from "@/lib/store";
import type { Listing } from "@/lib/mock-data";

const statuses: Listing["status"][] = ["Active", "Pending", "Sold", "Off-market"];
const agents = ["Marcus Reed", "Diana Powell", "Naomi Lee", "Kenji Watanabe"];

export function ListingFormDialog({
  open,
  onOpenChange,
  listing,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  listing?: Listing;
}) {
  const addListing = useCRM((s) => s.addListing);
  const updateListing = useCRM((s) => s.updateListing);
  const isEdit = !!listing;

  const [form, setForm] = useState({
    address: "",
    city: "",
    state: "",
    price: "",
    beds: "",
    baths: "",
    sqft: "",
    status: "Active" as Listing["status"],
    agent: agents[0],
  });

  useEffect(() => {
    if (listing) {
      setForm({
        address: listing.address,
        city: listing.city,
        state: listing.state,
        price: String(listing.price),
        beds: String(listing.beds),
        baths: String(listing.baths),
        sqft: String(listing.sqft),
        status: listing.status,
        agent: listing.agentName,
      });
    } else {
      setForm({ address: "", city: "", state: "", price: "", beds: "", baths: "", sqft: "", status: "Active", agent: agents[0] });
    }
  }, [listing, open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.address || !form.city) {
      toast.error("Address and city are required");
      return;
    }
    const payload = {
      address: form.address,
      city: form.city,
      state: form.state || "—",
      price: Number(form.price) || 0,
      beds: Number(form.beds) || 0,
      baths: Number(form.baths) || 0,
      sqft: Number(form.sqft) || 0,
      status: form.status,
      agent: form.agent,
    };
    if (isEdit && listing) {
      updateListing(listing.id, payload);
      toast.success("Listing updated");
    } else {
      addListing(payload);
      toast.success("Listing added");
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit listing" : "Add new listing"}</DialogTitle>
          <DialogDescription>Add a property to your inventory.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5 col-span-3">
              <Label>Address</Label>
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="123 Main St" />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label>City</Label>
              <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>State</Label>
              <Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} placeholder="CA" />
            </div>
            <div className="space-y-1.5 col-span-3">
              <Label>Price (USD)</Label>
              <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Beds</Label>
              <Input type="number" value={form.beds} onChange={(e) => setForm({ ...form, beds: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Baths</Label>
              <Input type="number" step="0.5" value={form.baths} onChange={(e) => setForm({ ...form, baths: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Sqft</Label>
              <Input type="number" value={form.sqft} onChange={(e) => setForm({ ...form, sqft: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Listing["status"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label>Agent</Label>
              <Select value={form.agent} onValueChange={(v) => setForm({ ...form, agent: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {agents.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">{isEdit ? "Save changes" : "Add listing"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
