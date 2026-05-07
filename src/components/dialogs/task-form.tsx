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
import type { Task } from "@/lib/mock-data";

const priorities: Task["priority"][] = ["Low", "Medium", "High"];
const statuses: Task["status"][] = ["To do", "In progress", "Done"];
const agents = ["Marcus Reed", "Diana Powell", "Naomi Lee", "Kenji Watanabe", "Taylor Lambert"];

export function TaskFormDialog({
  open,
  onOpenChange,
  task,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  task?: Task;
}) {
  const addTask = useCRM((s) => s.addTask);
  const updateTask = useCRM((s) => s.updateTask);
  const isEdit = !!task;

  const [form, setForm] = useState({
    title: "",
    due: new Date().toISOString().split("T")[0],
    priority: "Medium" as Task["priority"],
    assignee: agents[0],
    status: "To do" as Task["status"],
    related: "",
  });

  useEffect(() => {
    if (task) {
      setForm({ title: task.title, due: task.due, priority: task.priority, assignee: task.assigneeName, status: task.status, related: task.related ?? "" });
    } else {
      setForm({ title: "", due: new Date().toISOString().split("T")[0], priority: "Medium", assignee: agents[0], status: "To do", related: "" });
    }
  }, [task, open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title) { toast.error("Title is required"); return; }
    const payload = {
      title: form.title,
      due: form.due,
      priority: form.priority,
      assignee: form.assignee,
      status: form.status,
      related: form.related || undefined,
    };
    if (isEdit && task) {
      updateTask(task.id, payload);
      toast.success("Task updated");
    } else {
      addTask(payload);
      toast.success("Task created");
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit task" : "Create new task"}</DialogTitle>
          <DialogDescription>Stay on top of follow-ups and deliverables.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Follow up with Sofia Marín" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Due date</Label>
              <Input type="date" value={form.due} onChange={(e) => setForm({ ...form, due: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v as Task["priority"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {priorities.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Task["status"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Assignee</Label>
              <Select value={form.assignee} onValueChange={(v) => setForm({ ...form, assignee: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {agents.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Related (lead, deal, listing — optional)</Label>
            <Input value={form.related} onChange={(e) => setForm({ ...form, related: e.target.value })} placeholder="L-1042" />
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">{isEdit ? "Save changes" : "Create task"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
