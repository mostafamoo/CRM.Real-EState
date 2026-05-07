"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCRM } from "@/lib/store";

const agents = ["Marcus Reed", "Diana Powell", "Naomi Lee", "Kenji Watanabe"];

export function ShowingFormDialog({
  open, onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const listings = useCRM((s) => s.listings);
  const leads = useCRM((s) => s.leads);
  const addShowing = useCRM((s) => s.addShowing);

  const [form, setForm] = useState({
    listingId: listings[0]?.id ?? "",
    leadId: leads[0]?.id ?? "",
    date: new Date().toISOString().split("T")[0],
    time: "2:00 PM",
    agent: agents[0],
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.listingId || !form.leadId) { toast.error("Listing and lead required"); return; }
    addShowing({ ...form, status: "Scheduled" });
    toast.success("Showing scheduled");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule showing</DialogTitle>
          <DialogDescription>Book a property tour for a lead.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Listing</Label>
            <Select value={form.listingId} onValueChange={(v) => setForm({ ...form, listingId: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {listings.map((l) => <SelectItem key={l.id} value={l.id}>{l.address}, {l.city}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Lead</Label>
            <Select value={form.leadId} onValueChange={(v) => setForm({ ...form, leadId: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {leads.map((l) => <SelectItem key={l.id} value={l.id}>{l.name} ({l.email})</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Time</Label>
              <Input value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} placeholder="2:00 PM" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Agent</Label>
            <Select value={form.agent} onValueChange={(v) => setForm({ ...form, agent: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {agents.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Schedule showing</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
