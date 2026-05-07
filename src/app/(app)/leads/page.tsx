"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TBody, TD, TH, THead, TR } from "@/components/common/data-table";
import { LeadStatusBadge } from "@/components/common/lead-status";
import { LeadFormDialog } from "@/components/dialogs/lead-form";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";
import { useCRM } from "@/lib/store";
import { formatCurrency, initials } from "@/lib/utils";
import { leadScore, scoreColor } from "@/lib/scoring";
import { Plus, Search, Download, Upload, MoreHorizontal, Pencil, Trash2, ArrowUpDown, Bookmark, BookmarkPlus, Sparkles } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Lead } from "@/lib/mock-data";

export default function LeadsPage() {
  const leads = useCRM((s) => s.leads);
  const deleteLead = useCRM((s) => s.deleteLead);
  const deleteLeads = useCRM((s) => s.deleteLeads);
  const allSavedViews = useCRM((s) => s.savedViews);
  const savedViews = useMemo(() => allSavedViews.filter((v) => v.entity === "leads"), [allSavedViews]);
  const addSavedView = useCRM((s) => s.addSavedView);
  const deleteSavedView = useCRM((s) => s.deleteSavedView);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [agentFilter, setAgentFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"createdAt" | "name" | "budget">("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Lead | undefined>();
  const [confirmDelete, setConfirmDelete] = useState<string | "bulk" | null>(null);

  const agents = useMemo(() => Array.from(new Set(leads.map((l) => l.agent))), [leads]);

  const filtered = useMemo(() => {
    let data = leads;
    if (query) {
      const q = query.toLowerCase();
      data = data.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q) ||
          l.phone.toLowerCase().includes(q) ||
          l.city.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") data = data.filter((l) => l.status === statusFilter);
    if (sourceFilter !== "all") data = data.filter((l) => l.source === sourceFilter);
    if (agentFilter !== "all") data = data.filter((l) => l.agent === agentFilter);

    data = [...data].sort((a, b) => {
      let cmp = 0;
      if (sortBy === "name") cmp = a.name.localeCompare(b.name);
      else if (sortBy === "budget") cmp = a.budget - b.budget;
      else cmp = a.createdAt.localeCompare(b.createdAt);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return data;
  }, [leads, query, statusFilter, sourceFilter, agentFilter, sortBy, sortDir]);

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function toggleAll() {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((l) => l.id)));
  }
  function exportCsv() {
    const rows = filtered.map((l) => [l.id, l.name, l.email, l.phone, l.source, l.status, l.budget, l.city, l.agent, l.createdAt].join(","));
    const csv = ["id,name,email,phone,source,status,budget,city,agent,created"].concat(rows).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leads.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filtered.length} leads`);
  }
  function toggleSort(col: typeof sortBy) {
    if (sortBy === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortBy(col); setSortDir("desc"); }
  }
  function saveCurrentView() {
    const name = prompt("Name this view:");
    if (!name) return;
    addSavedView({
      entity: "leads",
      name,
      filters: { status: statusFilter, source: sourceFilter, agent: agentFilter, query },
    });
    toast.success(`View "${name}" saved`);
  }
  function loadView(filters: Record<string, string>) {
    setStatusFilter(filters.status ?? "all");
    setSourceFilter(filters.source ?? "all");
    setAgentFilter(filters.agent ?? "all");
    setQuery(filters.query ?? "");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leads"
        description={`${leads.length} total leads · ${filtered.length} shown`}
        actions={
          <>
            <Button asChild variant="outline" size="sm">
              <Link href="/import"><Upload className="size-4" /> Import</Link>
            </Button>
            <Button variant="outline" size="sm" onClick={exportCsv}>
              <Download className="size-4" /> Export
            </Button>
            <Button size="sm" onClick={() => { setEditing(undefined); setFormOpen(true); }}>
              <Plus className="size-4" /> New lead
            </Button>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-64 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, phone…"
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="qualified">Qualified</SelectItem>
            <SelectItem value="won">Won</SelectItem>
            <SelectItem value="lost">Lost</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="w-32"><SelectValue placeholder="Source" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sources</SelectItem>
            <SelectItem value="Website">Website</SelectItem>
            <SelectItem value="Referral">Referral</SelectItem>
            <SelectItem value="Zillow">Zillow</SelectItem>
            <SelectItem value="Facebook">Facebook</SelectItem>
            <SelectItem value="Instagram">Instagram</SelectItem>
            <SelectItem value="Walk-in">Walk-in</SelectItem>
          </SelectContent>
        </Select>
        <Select value={agentFilter} onValueChange={setAgentFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Agent" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All agents</SelectItem>
            {agents.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
          </SelectContent>
        </Select>
        {(query || statusFilter !== "all" || sourceFilter !== "all" || agentFilter !== "all") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setQuery(""); setStatusFilter("all"); setSourceFilter("all"); setAgentFilter("all"); }}
          >
            Clear
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="ml-auto">
              <Bookmark className="size-4" /> Views {savedViews.length > 0 && `(${savedViews.length})`}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={saveCurrentView}>
              <BookmarkPlus className="size-4" /> Save current view
            </DropdownMenuItem>
            {savedViews.length > 0 && <DropdownMenuSeparator />}
            {savedViews.map((v) => (
              <DropdownMenuItem key={v.id} onClick={() => loadView(v.filters)}>
                <Bookmark className="size-4" />
                <span className="flex-1">{v.name}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteSavedView(v.id); toast.success("View deleted"); }}
                  className="text-destructive hover:opacity-70"
                >
                  <Trash2 className="size-3" />
                </button>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {selected.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-secondary/50 px-4 py-2">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <Button variant="outline" size="sm" onClick={() => setConfirmDelete("bulk")} className="text-destructive">
            <Trash2 className="size-4" /> Delete
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>Clear</Button>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <p>No leads match your filters.</p>
              <Button variant="ghost" size="sm" className="mt-2" onClick={() => { setQuery(""); setStatusFilter("all"); setSourceFilter("all"); setAgentFilter("all"); }}>
                Clear filters
              </Button>
            </div>
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH className="w-10">
                    <Checkbox checked={selected.size === filtered.length} onCheckedChange={toggleAll} />
                  </TH>
                  <TH>
                    <button onClick={() => toggleSort("name")} className="flex items-center gap-1 hover:text-foreground">
                      Lead <ArrowUpDown className="size-3" />
                    </button>
                  </TH>
                  <TH>
                    <span className="flex items-center gap-1">
                      <Sparkles className="size-3" /> Score
                    </span>
                  </TH>
                  <TH>Status</TH>
                  <TH>Source</TH>
                  <TH>
                    <button onClick={() => toggleSort("budget")} className="flex items-center gap-1 hover:text-foreground">
                      Budget <ArrowUpDown className="size-3" />
                    </button>
                  </TH>
                  <TH>City</TH>
                  <TH>Agent</TH>
                  <TH>
                    <button onClick={() => toggleSort("createdAt")} className="flex items-center gap-1 hover:text-foreground">
                      Created <ArrowUpDown className="size-3" />
                    </button>
                  </TH>
                  <TH className="w-10"></TH>
                </TR>
              </THead>
              <TBody>
                {filtered.map((lead) => {
                  const score = leadScore(lead);
                  return (
                  <TR key={lead.id}>
                    <TD>
                      <Checkbox checked={selected.has(lead.id)} onCheckedChange={() => toggleSelect(lead.id)} />
                    </TD>
                    <TD>
                      <Link href={`/leads/${lead.id}`} className="flex items-center gap-3 group">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback>{initials(lead.name)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="font-medium group-hover:text-primary transition-colors">{lead.name}</div>
                          <div className="text-xs text-muted-foreground truncate">{lead.email}</div>
                        </div>
                      </Link>
                    </TD>
                    <TD>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${scoreColor(score.label)}`}>
                        {score.score}
                      </span>
                    </TD>
                    <TD><LeadStatusBadge status={lead.status} /></TD>
                    <TD><Badge variant="outline">{lead.source}</Badge></TD>
                    <TD className="font-medium">{formatCurrency(lead.budget)}</TD>
                    <TD className="text-muted-foreground">{lead.city}</TD>
                    <TD>{lead.agentName}</TD>
                    <TD className="text-muted-foreground">{lead.createdAt}</TD>
                    <TD>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/leads/${lead.id}`}>View details</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setEditing(lead); setFormOpen(true); }}>
                            <Pencil className="size-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setConfirmDelete(lead.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="size-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TD>
                  </TR>
                  );
                })}
              </TBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <LeadFormDialog open={formOpen} onOpenChange={setFormOpen} lead={editing} />
      <ConfirmDialog
        open={confirmDelete !== null}
        onOpenChange={(o) => !o && setConfirmDelete(null)}
        onConfirm={() => {
          if (confirmDelete === "bulk") {
            deleteLeads(Array.from(selected));
            toast.success(`${selected.size} leads deleted`);
            setSelected(new Set());
          } else if (confirmDelete) {
            deleteLead(confirmDelete);
            toast.success("Lead deleted");
          }
        }}
        title={confirmDelete === "bulk" ? `Delete ${selected.size} leads?` : "Delete this lead?"}
        description="This action cannot be undone."
      />
    </div>
  );
}
