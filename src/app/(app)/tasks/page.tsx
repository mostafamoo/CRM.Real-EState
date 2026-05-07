"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TaskFormDialog } from "@/components/dialogs/task-form";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCRM } from "@/lib/store";
import { initials } from "@/lib/utils";
import { Plus, Calendar, Search, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import type { Task } from "@/lib/mock-data";

const priorityVariant = {
  Low: "muted",
  Medium: "secondary",
  High: "destructive",
} as const;

const statusVariant = {
  "To do": "outline",
  "In progress": "warning",
  "Done": "success",
} as const;

export default function TasksPage() {
  const tasks = useCRM((s) => s.tasks);
  const toggleTask = useCRM((s) => s.toggleTask);
  const deleteTask = useCRM((s) => s.deleteTask);

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Task | undefined>();
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let data = tasks;
    if (query) {
      const q = query.toLowerCase();
      data = data.filter((t) => t.title.toLowerCase().includes(q));
    }
    if (filter === "open") data = data.filter((t) => t.status !== "Done");
    if (filter === "done") data = data.filter((t) => t.status === "Done");
    if (filter === "high") data = data.filter((t) => t.priority === "High");
    return data;
  }, [tasks, query, filter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tasks"
        description={`${tasks.filter((t) => t.status !== "Done").length} open · ${tasks.filter((t) => t.status === "Done").length} done`}
        actions={
          <Button size="sm" onClick={() => { setEditing(undefined); setFormOpen(true); }}>
            <Plus className="size-4" /> New task
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-64 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input placeholder="Search tasks…" className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All tasks</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="done">Done</SelectItem>
            <SelectItem value="high">High priority</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground text-sm">No tasks match.</div>
          ) : (
            <ul className="divide-y divide-border">
              {filtered.map((t) => (
                <li key={t.id} className="flex items-center gap-3 p-4 hover:bg-secondary/40 transition-colors">
                  <Checkbox checked={t.status === "Done"} onCheckedChange={() => { toggleTask(t.id); toast.success(t.status === "Done" ? "Task reopened" : "Task completed"); }} />
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium ${t.status === "Done" ? "line-through text-muted-foreground" : ""}`}>{t.title}</div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="size-3" /> {t.due}</span>
                      {t.related && <><span>·</span><span>{t.related}</span></>}
                    </div>
                  </div>
                  <Badge variant={priorityVariant[t.priority]}>{t.priority}</Badge>
                  <Badge variant={statusVariant[t.status]}>{t.status}</Badge>
                  <Avatar className="size-7"><AvatarFallback className="text-[10px]">{initials(t.assignee)}</AvatarFallback></Avatar>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm"><MoreHorizontal className="size-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => { setEditing(t); setFormOpen(true); }}>
                        <Pencil className="size-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setConfirmId(t.id)}>
                        <Trash2 className="size-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <TaskFormDialog open={formOpen} onOpenChange={setFormOpen} task={editing} />
      <ConfirmDialog
        open={confirmId !== null}
        onOpenChange={(o) => !o && setConfirmId(null)}
        onConfirm={() => { if (confirmId) { deleteTask(confirmId); toast.success("Task deleted"); } }}
        title="Delete this task?"
      />
    </div>
  );
}
