"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/common/stat-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TBody, TD, TH, THead, TR } from "@/components/common/data-table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useCRM } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { Plus, Wallet, DollarSign, Hourglass, CheckCircle2 } from "lucide-react";

const agents = ["Marcus Reed", "Diana Powell", "Naomi Lee", "Kenji Watanabe", "Taylor Lambert"];

export default function CommissionsPage() {
  const commissions = useCRM((s) => s.commissions);
  const deals = useCRM((s) => s.deals);
  const addCommission = useCRM((s) => s.addCommission);
  const updateCommission = useCRM((s) => s.updateCommission);

  const [formOpen, setFormOpen] = useState(false);
  const [filter, setFilter] = useState("all");

  const [form, setForm] = useState({
    dealId: "",
    rate: "2.5",
    splitPercent: "70",
    agent: agents[0],
  });

  const filtered = useMemo(() => {
    if (filter === "all") return commissions;
    return commissions.filter((c) => c.status === filter);
  }, [commissions, filter]);

  const totalGCI = commissions.reduce((s, c) => s + c.amount, 0);
  const paidOut = commissions.filter((c) => c.status === "Paid").reduce((s, c) => s + c.agentTake, 0);
  const pending = commissions.filter((c) => c.status === "Pending").reduce((s, c) => s + c.agentTake, 0);

  function create(e: React.FormEvent) {
    e.preventDefault();
    const deal = deals.find((d) => d.id === form.dealId);
    if (!deal) { toast.error("Pick a deal"); return; }
    const rate = Number(form.rate) / 100;
    const split = Number(form.splitPercent) / 100;
    const amount = deal.amount * rate;
    addCommission({
      dealId: form.dealId,
      amount,
      splitPercent: Number(form.splitPercent),
      agent: form.agent,
      brokerage: amount * (1 - split),
      agentTake: amount * split,
      status: "Pending",
    });
    toast.success("Commission record created");
    setFormOpen(false);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Commissions"
        description={`${commissions.length} records · ${formatCurrency(totalGCI)} total GCI`}
        actions={
          <Button size="sm" onClick={() => setFormOpen(true)}>
            <Plus className="size-4" /> New commission
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total GCI" value={formatCurrency(totalGCI)} icon={DollarSign} delta="+24%" />
        <StatCard label="Paid out" value={formatCurrency(paidOut)} icon={CheckCircle2} />
        <StatCard label="Pending" value={formatCurrency(pending)} icon={Hourglass} />
      </div>

      <div className="flex gap-2">
        {(["all", "Pending", "Paid"] as const).map((f) => (
          <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)}>
            {f === "all" ? "All" : f}
          </Button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground text-sm">
              <Wallet className="size-8 mx-auto mb-2 opacity-30" />
              No commissions.
            </div>
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Commission</TH>
                  <TH>Deal</TH>
                  <TH>Agent</TH>
                  <TH>Total</TH>
                  <TH>Split</TH>
                  <TH>Brokerage</TH>
                  <TH>Agent take</TH>
                  <TH>Status</TH>
                  <TH className="w-10"></TH>
                </TR>
              </THead>
              <TBody>
                {filtered.map((c) => {
                  const deal = deals.find((d) => d.id === c.dealId);
                  return (
                    <TR key={c.id}>
                      <TD className="font-medium">{c.id}</TD>
                      <TD>
                        <div className="font-medium">{deal?.title ?? c.dealId}</div>
                        <div className="text-xs text-muted-foreground">{deal ? formatCurrency(deal.amount) : ""}</div>
                      </TD>
                      <TD>{c.agent}</TD>
                      <TD className="font-medium">{formatCurrency(c.amount)}</TD>
                      <TD>{c.splitPercent}%</TD>
                      <TD className="text-muted-foreground">{formatCurrency(c.brokerage)}</TD>
                      <TD className="font-medium text-success">{formatCurrency(c.agentTake)}</TD>
                      <TD><Badge variant={c.status === "Paid" ? "success" : "warning"}>{c.status}</Badge></TD>
                      <TD>
                        {c.status === "Pending" && (
                          <Button variant="outline" size="sm" onClick={() => { updateCommission(c.id, { status: "Paid", paidAt: new Date().toISOString().split("T")[0] }); toast.success("Marked paid"); }}>
                            Mark paid
                          </Button>
                        )}
                      </TD>
                    </TR>
                  );
                })}
              </TBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New commission</DialogTitle>
            <DialogDescription>Track commission split for a deal.</DialogDescription>
          </DialogHeader>
          <form onSubmit={create} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Deal</Label>
              <Select value={form.dealId} onValueChange={(v) => setForm({ ...form, dealId: v })}>
                <SelectTrigger><SelectValue placeholder="Pick a deal…" /></SelectTrigger>
                <SelectContent>
                  {deals.map((d) => <SelectItem key={d.id} value={d.id}>{d.title} · {formatCurrency(d.amount)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Commission rate (%)</Label>
                <Input type="number" step="0.1" value={form.rate} onChange={(e) => setForm({ ...form, rate: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Agent split (%)</Label>
                <Input type="number" value={form.splitPercent} onChange={(e) => setForm({ ...form, splitPercent: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Agent</Label>
              <Select value={form.agent} onValueChange={(v) => setForm({ ...form, agent: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {agents.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="ghost" onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button type="submit">Create</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
