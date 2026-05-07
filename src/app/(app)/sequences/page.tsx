"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";
import { useCRM, type SequenceStep } from "@/lib/store";
import {
  Plus, GitBranch, Mail, MessageSquare, Trash2, Clock, ChevronDown, ChevronRight,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

const triggers = ["lead.created", "lead.inactive", "deal.created", "showing.completed"];

export default function SequencesPage() {
  const sequences = useCRM((s) => s.sequences);
  const addSequence = useCRM((s) => s.addSequence);
  const updateSequence = useCRM((s) => s.updateSequence);
  const toggleSequence = useCRM((s) => s.toggleSequence);
  const deleteSequence = useCRM((s) => s.deleteSequence);

  const [formOpen, setFormOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(sequences[0]?.id ?? null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    trigger: triggers[0],
    steps: [{ id: "s1", delayDays: 0, channel: "email" as const, subject: "", body: "" }],
  });

  function addStep() {
    setForm((f) => ({
      ...f,
      steps: [...f.steps, { id: `s${f.steps.length + 1}`, delayDays: 1, channel: "email", subject: "", body: "" }],
    }));
  }

  function updateStep(idx: number, patch: Partial<SequenceStep>) {
    setForm((f) => ({
      ...f,
      steps: f.steps.map((s, i) => i === idx ? { ...s, ...patch } : s),
    }));
  }

  function removeStep(idx: number) {
    setForm((f) => ({ ...f, steps: f.steps.filter((_, i) => i !== idx) }));
  }

  function create(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name) { toast.error("Name required"); return; }
    addSequence({ name: form.name, trigger: form.trigger, steps: form.steps, active: true });
    toast.success("Sequence created");
    setFormOpen(false);
    setForm({ name: "", trigger: triggers[0], steps: [{ id: "s1", delayDays: 0, channel: "email", subject: "", body: "" }] });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sequences"
        description={`${sequences.filter(s => s.active).length} active · ${sequences.reduce((sum, s) => sum + s.enrolled, 0)} enrolled leads`}
        actions={
          <Button size="sm" onClick={() => setFormOpen(true)}>
            <Plus className="size-4" /> New sequence
          </Button>
        }
      />

      <div className="space-y-3">
        {sequences.length === 0 && (
          <Card><CardContent className="p-12 text-center text-muted-foreground text-sm">
            <GitBranch className="size-8 mx-auto mb-2 opacity-30" />
            No sequences yet.
          </CardContent></Card>
        )}
        {sequences.map((seq) => {
          const open = expanded === seq.id;
          return (
            <Card key={seq.id}>
              <CardHeader className="flex-row items-center justify-between gap-3">
                <button onClick={() => setExpanded(open ? null : seq.id)} className="flex items-center gap-2 flex-1 text-left">
                  {open ? <ChevronDown className="size-4 text-muted-foreground" /> : <ChevronRight className="size-4 text-muted-foreground" />}
                  <div className="size-9 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                    <GitBranch className="size-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{seq.name}</CardTitle>
                    <CardDescription>Trigger: {seq.trigger} · {seq.steps.length} steps · {seq.enrolled} enrolled</CardDescription>
                  </div>
                </button>
                <Switch checked={seq.active} onCheckedChange={() => toggleSequence(seq.id)} />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-sm"><MoreHorizontal className="size-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => { updateSequence(seq.id, { enrolled: seq.enrolled + 5 }); toast.success("Enrolled 5 leads"); }}>
                      Enroll 5 leads
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setConfirmId(seq.id)}>
                      <Trash2 className="size-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              {open && (
                <CardContent>
                  <ul className="space-y-3 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-px before:bg-border">
                    {seq.steps.map((step, i) => {
                      const Icon = step.channel === "email" ? Mail : MessageSquare;
                      return (
                        <li key={step.id} className="relative pl-12">
                          <span className="absolute left-0 top-1 flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Icon className="size-4" />
                          </span>
                          <div className="rounded-lg border border-border p-3 space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-[10px]">Step {i + 1}</Badge>
                              <Badge variant="muted" className="text-[10px] gap-1">
                                <Clock className="size-3" /> {step.delayDays === 0 ? "Immediately" : `${step.delayDays}d after previous`}
                              </Badge>
                              <Badge variant="muted" className="text-[10px] capitalize">{step.channel}</Badge>
                            </div>
                            {step.subject && <div className="text-sm font-medium">{step.subject}</div>}
                            <p className="text-xs text-muted-foreground">{step.body}</p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>New sequence</DialogTitle>
            <DialogDescription>Build a multi-step email/SMS campaign.</DialogDescription>
          </DialogHeader>
          <form onSubmit={create} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="New Lead Welcome" />
              </div>
              <div className="space-y-1.5">
                <Label>Trigger</Label>
                <Select value={form.trigger} onValueChange={(v) => setForm({ ...form, trigger: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {triggers.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Steps</Label>
              <div className="space-y-3 max-h-[44vh] overflow-y-auto pr-1 scrollbar-thin">
                {form.steps.map((step, i) => (
                  <div key={step.id} className="rounded-lg border border-border p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold">Step {i + 1}</span>
                      {form.steps.length > 1 && (
                        <button type="button" onClick={() => removeStep(i)} className="text-destructive">
                          <Trash2 className="size-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Wait days</Label>
                        <Input type="number" value={step.delayDays} onChange={(e) => updateStep(i, { delayDays: Number(e.target.value) })} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Channel</Label>
                        <Select value={step.channel} onValueChange={(v) => updateStep(i, { channel: v as "email" | "sms" })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="sms">SMS</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {step.channel === "email" && (
                      <div className="space-y-1">
                        <Label className="text-xs">Subject</Label>
                        <Input value={step.subject ?? ""} onChange={(e) => updateStep(i, { subject: e.target.value })} />
                      </div>
                    )}
                    <div className="space-y-1">
                      <Label className="text-xs">Body</Label>
                      <Textarea rows={2} value={step.body} onChange={(e) => updateStep(i, { body: e.target.value })} placeholder="Use {{firstName}} for personalization" />
                    </div>
                  </div>
                ))}
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addStep}><Plus className="size-3.5" /> Add step</Button>
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="ghost" onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button type="submit">Create sequence</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmId !== null}
        onOpenChange={(o) => !o && setConfirmId(null)}
        onConfirm={() => { if (confirmId) { deleteSequence(confirmId); toast.success("Sequence deleted"); } }}
        title="Delete this sequence?"
      />
    </div>
  );
}
