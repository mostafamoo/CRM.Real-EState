"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/common/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { OverviewAreaChart } from "@/components/common/area-chart";
import { Table, TBody, TD, TH, THead, TR } from "@/components/common/data-table";
import { LeadFormDialog } from "@/components/dialogs/lead-form";
import { useCRM } from "@/lib/store";
import { overviewChart } from "@/lib/mock-data";
import { formatCurrency, initials } from "@/lib/utils";
import { Users, Building2, Handshake, TrendingUp, ArrowUpRight, Calendar, Sparkles } from "lucide-react";

const stageVariant = {
  Closed: "success",
  Contract: "default",
  Negotiation: "warning",
  Proposal: "secondary",
  Discovery: "muted",
} as const;

export default function DashboardPage() {
  const user = useCRM((s) => s.user);
  const leads = useCRM((s) => s.leads);
  const deals = useCRM((s) => s.deals);
  const listings = useCRM((s) => s.listings);
  const [leadFormOpen, setLeadFormOpen] = useState(false);

  const activeLeads = leads.filter((l) => l.status !== "lost" && l.status !== "won").length;
  const activeListings = listings.filter((l) => l.status === "Active").length;
  const openDeals = deals.filter((d) => d.stage !== "Closed").reduce((s, d) => s + d.amount, 0);
  const closed = deals.filter((d) => d.stage === "Closed").length;
  const conversionRate = leads.length ? ((closed / leads.length) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${user.firstName}`}
        description="Here's what's happening across your real-estate business today."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => toast.info("Date range coming soon")}>
              <Calendar className="size-4" /> This month
            </Button>
            <Button size="sm" onClick={() => toast.info("AI insights coming soon")}>
              <Sparkles className="size-4" /> AI insights
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active leads" value={String(activeLeads)} delta="+12.4%" icon={Users} />
        <StatCard label="Active listings" value={String(activeListings)} delta="+3.1%" icon={Building2} />
        <StatCard label="Open deal volume" value={formatCurrency(openDeals)} delta="+24.0%" icon={Handshake} />
        <StatCard label="Conversion rate" value={`${conversionRate}%`} delta="-1.8%" icon={TrendingUp} trend="down" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-start justify-between gap-3">
            <div>
              <CardTitle>Pipeline performance</CardTitle>
              <CardDescription>Leads vs. closed deals over the last 12 months.</CardDescription>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-[var(--color-chart-1)]" /> Leads</span>
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-[var(--color-chart-3)]" /> Deals</span>
            </div>
          </CardHeader>
          <CardContent>
            <OverviewAreaChart data={overviewChart} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent leads</CardTitle>
            <CardDescription>Latest people reaching out to you.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {leads.slice(0, 5).map((lead) => (
              <Link key={lead.id} href={`/leads/${lead.id}`} className="flex items-center gap-3 hover:bg-secondary/40 -mx-2 px-2 py-1.5 rounded-md transition-colors">
                <Avatar className="h-9 w-9"><AvatarFallback>{initials(lead.name)}</AvatarFallback></Avatar>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{lead.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{lead.source} · {lead.city}</div>
                </div>
                <Badge variant="outline" className="text-[10px]">{formatCurrency(lead.budget)}</Badge>
              </Link>
            ))}
            {leads.length === 0 && (
              <Button variant="outline" size="sm" className="w-full" onClick={() => setLeadFormOpen(true)}>
                Create your first lead
              </Button>
            )}
            <Button asChild variant="ghost" size="sm" className="w-full justify-between">
              <Link href="/leads">View all leads <ArrowUpRight className="size-3.5" /></Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Active deals</CardTitle>
            <CardDescription>Track every deal in motion.</CardDescription>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/pipeline">View pipeline <ArrowUpRight className="size-3.5" /></Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <THead>
              <TR>
                <TH>Deal</TH><TH>Client</TH><TH>Amount</TH><TH>Stage</TH><TH>Close date</TH><TH>Agent</TH>
              </TR>
            </THead>
            <TBody>
              {deals.slice(0, 6).map((d) => (
                <TR key={d.id}>
                  <TD>
                    <div className="font-medium">{d.title}</div>
                    <div className="text-xs text-muted-foreground">{d.id}</div>
                  </TD>
                  <TD>{d.client}</TD>
                  <TD className="font-medium">{formatCurrency(d.amount)}</TD>
                  <TD><Badge variant={stageVariant[d.stage]}>{d.stage}</Badge></TD>
                  <TD>{d.closeDate}</TD>
                  <TD className="text-muted-foreground">{d.agent}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </CardContent>
      </Card>

      <LeadFormDialog open={leadFormOpen} onOpenChange={setLeadFormOpen} />
    </div>
  );
}
