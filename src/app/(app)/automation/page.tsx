"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { AutomationFormDialog } from "@/components/dialogs/automation-form";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCRM } from "@/lib/store";
import { Plus, Zap, ArrowRight, MoreHorizontal, Trash2 } from "lucide-react";

export default function AutomationPage() {
  const automations = useCRM((s) => s.automations);
  const toggleAutomation = useCRM((s) => s.toggleAutomation);
  const deleteAutomation = useCRM((s) => s.deleteAutomation);

  const [formOpen, setFormOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Automation"
        description={`${automations.filter((a) => a.active).length} active · ${automations.reduce((s, a) => s + a.runs, 0)} runs this month`}
        actions={
          <Button size="sm" onClick={() => setFormOpen(true)}>
            <Plus className="size-4" /> New automation
          </Button>
        }
      />

      <Card>
        <CardContent className="p-0">
          {automations.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground text-sm">No automations yet.</div>
          ) : (
            <ul className="divide-y divide-border">
              {automations.map((a) => (
                <li key={a.id} className="flex items-center gap-4 p-4">
                  <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Zap className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{a.name}</div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <Badge variant="outline">{a.trigger}</Badge>
                      <ArrowRight className="size-3" />
                      <Badge variant="muted">{a.action}</Badge>
                      <span>· {a.runs} runs</span>
                    </div>
                  </div>
                  <Switch
                    checked={a.active}
                    onCheckedChange={() => { toggleAutomation(a.id); toast(a.active ? "Automation paused" : "Automation activated"); }}
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm"><MoreHorizontal className="size-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setConfirmId(a.id)}>
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

      <AutomationFormDialog open={formOpen} onOpenChange={setFormOpen} />
      <ConfirmDialog
        open={confirmId !== null}
        onOpenChange={(o) => !o && setConfirmId(null)}
        onConfirm={() => { if (confirmId) { deleteAutomation(confirmId); toast.success("Automation deleted"); } }}
        title="Delete this automation?"
      />
    </div>
  );
}
