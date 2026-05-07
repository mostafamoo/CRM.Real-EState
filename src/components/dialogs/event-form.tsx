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
import { useCRM, type CalendarEvent } from "@/lib/store";

const types: CalendarEvent["type"][] = ["showing", "closing", "inspection", "open-house", "meeting"];
const labels: Record<CalendarEvent["type"], string> = {
  showing: "Showing",
  closing: "Closing",
  inspection: "Inspection",
  "open-house": "Open House",
  meeting: "Meeting",
};

export function EventFormDialog({
  open,
  onOpenChange,
  defaultDay,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  defaultDay?: number;
}) {
  const addEvent = useCRM((s) => s.addEvent);
  const [form, setForm] = useState({
    title: "",
    day: defaultDay ?? new Date().getDate(),
    time: "10:00 AM",
    type: "meeting" as CalendarEvent["type"],
  });

  useEffect(() => {
    if (defaultDay) setForm((f) => ({ ...f, day: defaultDay }));
  }, [defaultDay]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title) { toast.error("Title is required"); return; }
    addEvent(form);
    toast.success("Event scheduled");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule event</DialogTitle>
          <DialogDescription>Add a showing, closing, or meeting.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Day</Label>
              <Input type="number" min={1} max={31} value={form.day} onChange={(e) => setForm({ ...form, day: Number(e.target.value) })} />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label>Time</Label>
              <Input value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} placeholder="10:00 AM" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as CalendarEvent["type"] })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {types.map((t) => <SelectItem key={t} value={t}>{labels[t]}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Add event</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
