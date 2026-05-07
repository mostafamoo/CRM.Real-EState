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

const triggers = ["New lead", "Lead inactive", "Stage change", "Listing update", "Tour scheduled", "Form submission"];
const actions = ["Send email", "Send SMS", "Slack notification", "Create task", "Add tag", "Assign agent"];

export function AutomationFormDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const addAutomation = useCRM((s) => s.addAutomation);
  const [form, setForm] = useState({ name: "", trigger: triggers[0], action: actions[0], active: true });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name) { toast.error("Name is required"); return; }
    addAutomation(form);
    toast.success("Automation created");
    onOpenChange(false);
    setForm({ name: "", trigger: triggers[0], action: actions[0], active: true });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create new automation</DialogTitle>
          <DialogDescription>When trigger fires, run action.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="New lead → SMS welcome" />
          </div>
          <div className="space-y-1.5">
            <Label>When (trigger)</Label>
            <Select value={form.trigger} onValueChange={(v) => setForm({ ...form, trigger: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {triggers.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Then (action)</Label>
            <Select value={form.action} onValueChange={(v) => setForm({ ...form, action: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {actions.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Create automation</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
