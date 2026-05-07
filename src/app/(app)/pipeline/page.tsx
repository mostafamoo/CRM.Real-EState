"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DealFormDialog } from "@/components/dialogs/deal-form";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCRM } from "@/lib/store";
import { formatCurrency, initials } from "@/lib/utils";
import { Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import type { Deal } from "@/lib/mock-data";

const stages = ["Discovery", "Proposal", "Negotiation", "Contract", "Closed"] as const;

export default function PipelinePage() {
  const deals = useCRM((s) => s.deals);
  const moveDealStage = useCRM((s) => s.moveDealStage);
  const deleteDeal = useCRM((s) => s.deleteDeal);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Deal | undefined>();
  const [defaultStage, setDefaultStage] = useState<Deal["stage"]>("Discovery");
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<Deal["stage"] | null>(null);

  function handleDrop(stage: Deal["stage"]) {
    if (dragId) {
      const d = deals.find((x) => x.id === dragId);
      if (d && d.stage !== stage) {
        moveDealStage(dragId, stage);
        toast.success(`Moved "${d.title}" to ${stage}`);
      }
    }
    setDragId(null);
    setDragOverStage(null);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pipeline"
        description="Drag-and-drop deals between stages."
        actions={
          <Button size="sm" onClick={() => { setEditing(undefined); setDefaultStage("Discovery"); setFormOpen(true); }}>
            <Plus className="size-4" /> New deal
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        {stages.map((stage) => {
          const stageDeals = deals.filter((d) => d.stage === stage);
          const total = stageDeals.reduce((s, d) => s + d.amount, 0);
          const isOver = dragOverStage === stage;
          return (
            <div
              key={stage}
              className={`rounded-xl p-3 space-y-3 transition-colors ${isOver ? "bg-primary/10 ring-2 ring-primary" : "bg-secondary/50"}`}
              onDragOver={(e) => { e.preventDefault(); setDragOverStage(stage); }}
              onDragLeave={() => setDragOverStage(null)}
              onDrop={() => handleDrop(stage)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-primary" />
                  <h3 className="font-semibold text-sm">{stage}</h3>
                  <Badge variant="muted">{stageDeals.length}</Badge>
                </div>
              </div>
              <p className="text-xs text-muted-foreground -mt-1">{formatCurrency(total)}</p>

              <div className="space-y-2">
                {stageDeals.map((d) => (
                  <Card
                    key={d.id}
                    draggable
                    onDragStart={() => setDragId(d.id)}
                    onDragEnd={() => setDragId(null)}
                    className={`p-3 space-y-2 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow ${dragId === d.id ? "opacity-50" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium truncate">{d.title}</div>
                        <div className="text-[11px] text-muted-foreground">{d.id}</div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm" className="size-6 shrink-0">
                            <MoreHorizontal className="size-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setEditing(d); setFormOpen(true); }}>
                            <Pencil className="size-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {stages.filter((s) => s !== d.stage).map((s) => (
                            <DropdownMenuItem
                              key={s}
                              onClick={() => { moveDealStage(d.id, s); toast.success(`Moved to ${s}`); }}
                            >
                              Move to {s}
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setConfirmId(d.id)}>
                            <Trash2 className="size-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <Badge variant="outline">{formatCurrency(d.amount)}</Badge>
                    <div className="text-xs text-muted-foreground line-clamp-1">{d.property}</div>
                    <div className="flex items-center justify-between pt-1">
                      <Avatar className="size-6"><AvatarFallback className="text-[10px]">{initials(d.agent)}</AvatarFallback></Avatar>
                      <span className="text-[11px] text-muted-foreground">{d.closeDate}</span>
                    </div>
                  </Card>
                ))}
                <button
                  onClick={() => { setEditing(undefined); setDefaultStage(stage); setFormOpen(true); }}
                  className="w-full rounded-lg border border-dashed border-border py-2 text-xs text-muted-foreground hover:bg-card hover:text-foreground transition-colors"
                >
                  + Add deal
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <DealFormDialog open={formOpen} onOpenChange={setFormOpen} deal={editing} defaultStage={defaultStage} />
      <ConfirmDialog
        open={confirmId !== null}
        onOpenChange={(o) => !o && setConfirmId(null)}
        onConfirm={() => {
          if (confirmId) {
            deleteDeal(confirmId);
            toast.success("Deal deleted");
          }
        }}
        title="Delete this deal?"
      />
    </div>
  );
}
