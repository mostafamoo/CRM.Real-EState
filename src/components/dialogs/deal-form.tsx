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
import type { Deal } from "@/lib/mock-data";

const stages: Deal["stage"][] = ["Discovery", "Proposal", "Negotiation", "Contract", "Closed"];
const agents = ["Marcus Reed", "Diana Powell", "Naomi Lee", "Kenji Watanabe", "Taylor Lambert"];

export function DealFormDialog({
  open,
  onOpenChange,
  deal,
  defaultStage,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  deal?: Deal;
  defaultStage?: Deal["stage"];
}) {
  const addDeal = useCRM((s) => s.addDeal);
  const updateDeal = useCRM((s) => s.updateDeal);
  const isEdit = !!deal;

  const [form, setForm] = useState({
    title: "",
    client: "",
    property: "",
    amount: "",
    stage: (defaultStage || "Discovery") as Deal["stage"],
    closeDate: "",
    agent: agents[0],
  });

  useEffect(() => {
    if (deal) {
      setForm({
        title: deal.title,
        client: deal.client,
        property: deal.property,
        amount: String(deal.amount),
        stage: deal.stage,
        closeDate: deal.closeDate,
        agent: deal.agentName,
      });
    } else {
      setForm({
        title: "",
        client: "",
        property: "",
        amount: "",
        stage: defaultStage || "Discovery",
        closeDate: "",
        agent: agents[0],
      });
    }
  }, [deal, open, defaultStage]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.client) {
      toast.error("Title and client are required");
      return;
    }
    const payload = {
      title: form.title,
      client: form.client,
      property: form.property,
      amount: Number(form.amount) || 0,
      stage: form.stage,
      closeDate: form.closeDate || new Date().toISOString().split("T")[0],
      agent: form.agent,
    };
    if (isEdit && deal) {
      updateDeal(deal.id, payload);
      toast.success("Deal updated");
    } else {
      addDeal(payload);
      toast.success("Deal created");
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit deal" : "Create new deal"}</DialogTitle>
          <DialogDescription>Track a new opportunity in your pipeline.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5 col-span-2">
              <Label htmlFor="dt">Deal title</Label>
              <Input id="dt" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Hilltop 4BR Family Home" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dc">Client</Label>
              <Input id="dc" value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="da">Amount (USD)</Label>
              <Input id="da" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label htmlFor="dp">Property</Label>
              <Input id="dp" value={form.property} onChange={(e) => setForm({ ...form, property: e.target.value })} placeholder="123 Main St, City, State" />
            </div>
            <div className="space-y-1.5">
              <Label>Stage</Label>
              <Select value={form.stage} onValueChange={(v) => setForm({ ...form, stage: v as Deal["stage"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {stages.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dd">Close date</Label>
              <Input id="dd" type="date" value={form.closeDate} onChange={(e) => setForm({ ...form, closeDate: e.target.value })} />
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
            <Button type="submit">{isEdit ? "Save changes" : "Create deal"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
