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
import { useCRM, type Offer } from "@/lib/store";

const statuses: Offer["status"][] = ["Pending", "Counter", "Accepted", "Rejected"];
const agents = ["Marcus Reed", "Diana Powell", "Naomi Lee", "Kenji Watanabe", "Taylor Lambert"];

export function OfferFormDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const addOffer = useCRM((s) => s.addOffer);
  const [form, setForm] = useState({
    listing: "",
    buyer: "",
    amount: "",
    status: "Pending" as Offer["status"],
    submittedBy: agents[0],
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.listing || !form.buyer) { toast.error("Listing and buyer are required"); return; }
    addOffer({ ...form, amount: Number(form.amount) || 0 });
    toast.success("Offer submitted");
    onOpenChange(false);
    setForm({ listing: "", buyer: "", amount: "", status: "Pending", submittedBy: agents[0] });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New offer</DialogTitle>
          <DialogDescription>Submit a new offer on a listing.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Listing</Label>
            <Input value={form.listing} onChange={(e) => setForm({ ...form, listing: e.target.value })} placeholder="123 Main St, City" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Buyer</Label>
              <Input value={form.buyer} onChange={(e) => setForm({ ...form, buyer: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Amount (USD)</Label>
              <Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Offer["status"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Submitted by</Label>
              <Select value={form.submittedBy} onValueChange={(v) => setForm({ ...form, submittedBy: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {agents.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Submit offer</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
