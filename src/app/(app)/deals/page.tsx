"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TBody, TD, TH, THead, TR } from "@/components/common/data-table";
import { DealFormDialog } from "@/components/dialogs/deal-form";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCRM } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { Plus, Search, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import type { Deal } from "@/lib/mock-data";

const stageVariant = {
  Closed: "success",
  Contract: "default",
  Negotiation: "warning",
  Proposal: "secondary",
  Discovery: "muted",
} as const;

export default function DealsPage() {
  const deals = useCRM((s) => s.deals);
  const deleteDeal = useCRM((s) => s.deleteDeal);
  const moveDealStage = useCRM((s) => s.moveDealStage);

  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Deal | undefined>();
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let data = deals;
    if (query) {
      const q = query.toLowerCase();
      data = data.filter((d) =>
        d.title.toLowerCase().includes(q) ||
        d.client.toLowerCase().includes(q) ||
        d.property.toLowerCase().includes(q)
      );
    }
    if (stageFilter !== "all") data = data.filter((d) => d.stage === stageFilter);
    return data;
  }, [deals, query, stageFilter]);

  const total = filtered.reduce((s, d) => s + d.amount, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Deals"
        description={`${filtered.length} of ${deals.length} deals · ${formatCurrency(total)} volume`}
        actions={
          <Button size="sm" onClick={() => { setEditing(undefined); setFormOpen(true); }}>
            <Plus className="size-4" /> New deal
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-64 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input placeholder="Search deals…" className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Stage" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All stages</SelectItem>
            <SelectItem value="Discovery">Discovery</SelectItem>
            <SelectItem value="Proposal">Proposal</SelectItem>
            <SelectItem value="Negotiation">Negotiation</SelectItem>
            <SelectItem value="Contract">Contract</SelectItem>
            <SelectItem value="Closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground text-sm">No deals match.</div>
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Deal</TH>
                  <TH>Client</TH>
                  <TH>Property</TH>
                  <TH>Amount</TH>
                  <TH>Stage</TH>
                  <TH>Close date</TH>
                  <TH>Agent</TH>
                  <TH className="w-10"></TH>
                </TR>
              </THead>
              <TBody>
                {filtered.map((d) => (
                  <TR key={d.id}>
                    <TD>
                      <div className="font-medium">{d.title}</div>
                      <div className="text-xs text-muted-foreground">{d.id}</div>
                    </TD>
                    <TD>{d.client}</TD>
                    <TD className="text-muted-foreground">{d.property}</TD>
                    <TD className="font-medium">{formatCurrency(d.amount)}</TD>
                    <TD><Badge variant={stageVariant[d.stage]}>{d.stage}</Badge></TD>
                    <TD>{d.closeDate}</TD>
                    <TD className="text-muted-foreground">{d.agent}</TD>
                    <TD>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm"><MoreHorizontal className="size-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setEditing(d); setFormOpen(true); }}>
                            <Pencil className="size-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {(["Discovery", "Proposal", "Negotiation", "Contract", "Closed"] as const)
                            .filter((s) => s !== d.stage)
                            .map((stage) => (
                              <DropdownMenuItem
                                key={stage}
                                onClick={() => { moveDealStage(d.id, stage); toast.success(`Moved to ${stage}`); }}
                              >
                                Move to {stage}
                              </DropdownMenuItem>
                            ))}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setConfirmId(d.id)}
                          >
                            <Trash2 className="size-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <DealFormDialog open={formOpen} onOpenChange={setFormOpen} deal={editing} />
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
        description="This action cannot be undone."
      />
    </div>
  );
}
