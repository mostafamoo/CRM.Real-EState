"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EventFormDialog } from "@/components/dialogs/event-form";
import { useCRM } from "@/lib/store";
import { Plus, ChevronLeft, ChevronRight, X } from "lucide-react";

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const typeColor = {
  showing: "bg-primary/15 text-primary",
  closing: "bg-success/15 text-success",
  inspection: "bg-warning/20 text-warning-foreground",
  "open-house": "bg-accent text-accent-foreground",
  meeting: "bg-[var(--color-chart-4)]/15 text-[var(--color-chart-4)]",
} as const;

export default function CalendarPage() {
  const events = useCRM((s) => s.events);
  const deleteEvent = useCRM((s) => s.deleteEvent);

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [view, setView] = useState<"day" | "week" | "month">("month");
  const [selectedDay, setSelectedDay] = useState<number | undefined>();
  const [formOpen, setFormOpen] = useState(false);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const cells: { day: number; current: boolean }[] = [];
  for (let i = firstDay - 1; i >= 0; i--) cells.push({ day: prevMonthDays - i, current: false });
  for (let i = 1; i <= daysInMonth; i++) cells.push({ day: i, current: true });
  while (cells.length < 35) cells.push({ day: cells.length - daysInMonth - firstDay + 1, current: false });

  function navigate(dir: 1 | -1) {
    let m = month + dir;
    let y = year;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    setMonth(m); setYear(y);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendar"
        description="Showings, closings, and team activities"
        actions={
          <Button size="sm" onClick={() => { setSelectedDay(undefined); setFormOpen(true); }}>
            <Plus className="size-4" /> New event
          </Button>
        }
      />

      <Card>
        <CardContent className="p-0">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon-sm" onClick={() => navigate(-1)}><ChevronLeft className="size-4" /></Button>
              <h2 className="font-semibold text-base">{months[month]} {year}</h2>
              <Button variant="outline" size="icon-sm" onClick={() => navigate(1)}><ChevronRight className="size-4" /></Button>
              <Button variant="ghost" size="sm" onClick={() => { setMonth(today.getMonth()); setYear(today.getFullYear()); }}>Today</Button>
            </div>
            <div className="flex gap-1">
              <Button variant={view === "day" ? "default" : "outline"} size="sm" onClick={() => setView("day")}>Day</Button>
              <Button variant={view === "week" ? "default" : "outline"} size="sm" onClick={() => setView("week")}>Week</Button>
              <Button variant={view === "month" ? "default" : "outline"} size="sm" onClick={() => setView("month")}>Month</Button>
            </div>
          </div>

          <div className="grid grid-cols-7 border-b border-border">
            {weekdays.map((d) => (
              <div key={d} className="p-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {cells.map((c, i) => {
              const dayEvents = c.current ? events.filter((e) => e.day === c.day) : [];
              const isToday = c.current && c.day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
              return (
                <div
                  key={i}
                  className={`min-h-24 border-b border-r border-border p-2 group cursor-pointer ${c.current ? "" : "bg-secondary/30 text-muted-foreground"} ${isToday ? "bg-primary/5" : "hover:bg-secondary/40"}`}
                  onClick={() => {
                    if (c.current) { setSelectedDay(c.day); setFormOpen(true); }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-medium ${isToday ? "size-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center" : ""}`}>{c.day}</span>
                    {c.current && (
                      <Plus className="size-3 opacity-0 group-hover:opacity-50 transition-opacity" />
                    )}
                  </div>
                  <div className="mt-1 space-y-1">
                    {dayEvents.map((e) => (
                      <button
                        key={e.id}
                        onClick={(ev) => {
                          ev.stopPropagation();
                          if (confirm(`Delete event "${e.title}"?`)) {
                            deleteEvent(e.id);
                            toast.success("Event deleted");
                          }
                        }}
                        className={`block w-full rounded text-left px-1.5 py-0.5 text-[10px] truncate hover:opacity-80 ${typeColor[e.type]}`}
                      >
                        {e.time} · {e.title}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <EventFormDialog open={formOpen} onOpenChange={setFormOpen} defaultDay={selectedDay} />
    </div>
  );
}
