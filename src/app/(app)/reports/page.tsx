"use client";

import { useMemo } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/common/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OverviewAreaChart } from "@/components/common/area-chart";
import { useCRM } from "@/lib/store";
import { overviewChart } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { Download, TrendingUp, Users, Handshake, DollarSign, Target, ArrowUp, ArrowDown } from "lucide-react";

const stageProb = {
  Discovery: 0.1,
  Proposal: 0.3,
  Negotiation: 0.6,
  Contract: 0.85,
  Closed: 1,
} as const;

export default function ReportsPage() {
  const deals = useCRM((s) => s.deals);
  const leads = useCRM((s) => s.leads);
  const commissions = useCRM((s) => s.commissions);

  const forecast = useMemo(() => {
    const totalForecast = deals.filter((d) => d.stage !== "Closed").reduce((sum, d) => sum + d.amount * stageProb[d.stage], 0);
    const byStage = (["Discovery", "Proposal", "Negotiation", "Contract"] as const).map((stage) => {
      const stageDeals = deals.filter((d) => d.stage === stage);
      const total = stageDeals.reduce((s, d) => s + d.amount, 0);
      const weighted = total * stageProb[stage];
      return { stage, count: stageDeals.length, total, weighted, prob: stageProb[stage] * 100 };
    });
    return { totalForecast, byStage };
  }, [deals]);

  const goal = 25_000_000;
  const closed = deals.filter((d) => d.stage === "Closed").reduce((s, d) => s + d.amount, 0);
  const goalPct = Math.min((closed / goal) * 100, 100);

  const sourcePerf = useMemo(() => {
    const groups: Record<string, { count: number; won: number }> = {};
    leads.forEach((l) => {
      groups[l.source] = groups[l.source] || { count: 0, won: 0 };
      groups[l.source].count++;
      if (l.status === "won") groups[l.source].won++;
    });
    return Object.entries(groups).map(([source, g]) => ({
      source, count: g.count, won: g.won,
      conversion: g.count ? (g.won / g.count) * 100 : 0,
    })).sort((a, b) => b.conversion - a.conversion);
  }, [leads]);

  const agentLeaderboard = useMemo(() => {
    const groups: Record<string, { volume: number; deals: number }> = {};
    deals.filter((d) => d.stage === "Closed").forEach((d) => {
      groups[d.agent] = groups[d.agent] || { volume: 0, deals: 0 };
      groups[d.agent].volume += d.amount;
      groups[d.agent].deals++;
    });
    commissions.forEach((c) => {
      groups[c.agent] = groups[c.agent] || { volume: 0, deals: 0 };
    });
    return Object.entries(groups).sort((a, b) => b[1].volume - a[1].volume);
  }, [deals, commissions]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Performance, forecasting, and team insights"
        actions={
          <Button variant="outline" size="sm" onClick={() => toast.success("PDF export started")}>
            <Download className="size-4" /> Export PDF
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Closed volume" value={formatCurrency(closed)} delta="+18.2%" icon={DollarSign} />
        <StatCard label="Forecasted (weighted)" value={formatCurrency(forecast.totalForecast)} delta="+8.4%" icon={Target} />
        <StatCard label="Deals closed" value={String(deals.filter((d) => d.stage === "Closed").length)} delta="+12.1%" icon={Handshake} />
        <StatCard label="New leads" value={String(leads.length)} delta="+24.0%" icon={Users} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Performance over time</CardTitle>
            <CardDescription>Last 12 months</CardDescription>
          </CardHeader>
          <CardContent>
            <OverviewAreaChart data={overviewChart} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Target className="size-4 text-primary" /> Annual goal</CardTitle>
            <CardDescription>{formatCurrency(closed)} of {formatCurrency(goal)}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative h-3 rounded-full bg-secondary overflow-hidden">
              <div className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all" style={{ width: `${goalPct}%` }} />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-semibold">{goalPct.toFixed(0)}%</span>
              <span className="text-xs text-muted-foreground">{formatCurrency(goal - closed)} to go</span>
            </div>
            <div className="rounded-lg bg-secondary/50 p-3 text-xs space-y-1">
              <div className="font-semibold">Pacing analysis</div>
              <div className="flex items-center gap-1 text-success">
                <ArrowUp className="size-3" /> On track if you close {formatCurrency((goal - closed) / 8)} / month
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sales forecast (weighted)</CardTitle>
          <CardDescription>Pipeline value adjusted by stage probability.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {forecast.byStage.map((s) => (
              <div key={s.stage} className="rounded-xl border border-border p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">{s.stage}</span>
                  <Badge variant="outline">{s.prob}%</Badge>
                </div>
                <div className="text-xs text-muted-foreground">{s.count} deals</div>
                <div className="text-lg font-semibold">{formatCurrency(s.weighted)}</div>
                <div className="text-xs text-muted-foreground">of {formatCurrency(s.total)}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top agents</CardTitle>
            <CardDescription>By closed volume</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {agentLeaderboard.length === 0 && (
              <p className="text-sm text-muted-foreground">No closed deals yet.</p>
            )}
            {agentLeaderboard.map(([name, g], i) => (
              <div key={name} className="flex items-center gap-3">
                <span className="size-7 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{name}</div>
                  <div className="text-xs text-muted-foreground">{g.deals} deals</div>
                </div>
                <div className="font-semibold">{formatCurrency(g.volume)}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Source performance</CardTitle>
            <CardDescription>Conversion by lead source</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {sourcePerf.map((s) => (
              <div key={s.source}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{s.source}</span>
                  <span className="text-muted-foreground">{s.count} leads · {s.conversion.toFixed(1)}% conv.</span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${Math.max(s.conversion, 4)}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
