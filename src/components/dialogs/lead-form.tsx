"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCRM } from "@/lib/store";
import type { Lead, LeadSource, LeadStatus } from "@/lib/mock-data";

const sources: LeadSource[] = ["Website", "Referral", "Zillow", "Facebook", "Instagram", "Walk-in"];
const statuses: LeadStatus[] = ["new", "contacted", "qualified", "won", "lost"];
const agents = ["Marcus Reed", "Diana Powell", "Naomi Lee", "Kenji Watanabe", "Taylor Lambert"];

export function LeadFormDialog({
  open,
  onOpenChange,
  lead,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  lead?: Lead;
}) {
  const addLead = useCRM((s) => s.addLead);
  const updateLead = useCRM((s) => s.updateLead);
  const isEdit = !!lead;

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    source: "Website" as LeadSource,
    status: "new" as LeadStatus,
    budget: "",
    agent: agents[0],
    city: "",
  });

  useEffect(() => {
    if (lead) {
      setForm({
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        source: lead.source,
        status: lead.status,
        budget: String(lead.budget),
        agent: lead.agentName,
        city: lead.city,
      });
    } else {
      setForm({
        name: "",
        email: "",
        phone: "",
        source: "Website",
        status: "new",
        budget: "",
        agent: agents[0],
        city: "",
      });
    }
  }, [lead, open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email) {
      toast.error("Name and email are required");
      return;
    }
    const payload = {
      name: form.name,
      email: form.email,
      phone: form.phone || "—",
      source: form.source,
      status: form.status,
      budget: Number(form.budget) || 0,
      agent: form.agent,
      city: form.city || "—",
    };
    if (isEdit && lead) {
      updateLead(lead.id, payload);
      toast.success("Lead updated");
    } else {
      addLead(payload);
      toast.success("Lead created");
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit lead" : "Create new lead"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update lead details below." : "Add a new prospect to your pipeline."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5 col-span-2">
              <Label htmlFor="ln">Full name</Label>
              <Input id="ln" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jane Doe" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="le">Email</Label>
              <Input id="le" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lp">Phone</Label>
              <Input id="lp" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Source</Label>
              <Select value={form.source} onValueChange={(v) => setForm({ ...form, source: v as LeadSource })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {sources.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as LeadStatus })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lb">Budget (USD)</Label>
              <Input id="lb" type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} placeholder="500000" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lc">City</Label>
              <Input id="lc" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label>Assigned agent</Label>
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
            <Button type="submit">{isEdit ? "Save changes" : "Create lead"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
