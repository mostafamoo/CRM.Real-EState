"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useCRM } from "@/lib/store";
import { Upload, FileText, CheckCircle2 } from "lucide-react";
import type { Lead, LeadSource, LeadStatus } from "@/lib/mock-data";

const sample = `name,email,phone,source,status,budget,city,agent
Mia Robinson,mia.robinson@mail.com,+1 415-555-0188,Zillow,new,650000,San Francisco,Marcus Reed
Lucas Wei,lucas.wei@mail.com,+1 408-555-0144,Website,contacted,1200000,Palo Alto,Diana Powell
Olivia Reyes,olivia.reyes@mail.com,+1 305-555-0177,Referral,qualified,895000,Miami,Marcus Reed`;

const validSources: LeadSource[] = ["Website", "Referral", "Zillow", "Facebook", "Instagram", "Walk-in"];
const validStatuses: LeadStatus[] = ["new", "contacted", "qualified", "won", "lost"];

export default function ImportPage() {
  const router = useRouter();
  const importLeads = useCRM((s) => s.importLeads);
  const [csv, setCsv] = useState("");
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [parsed, setParsed] = useState<{ rows: Omit<Lead, "id" | "createdAt">[]; errors: string[] } | null>(null);

  function parse() {
    const lines = csv.trim().split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) { toast.error("CSV needs at least a header + one row"); return; }
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const required = ["name", "email"];
    for (const r of required) {
      if (!headers.includes(r)) { toast.error(`Missing required column: ${r}`); return; }
    }
    const rows: Omit<Lead, "id" | "createdAt">[] = [];
    const errors: string[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cells = lines[i].split(",").map((c) => c.trim());
      const obj: Record<string, string> = {};
      headers.forEach((h, j) => { obj[h] = cells[j] ?? ""; });
      if (!obj.name || !obj.email) { errors.push(`Row ${i}: missing name/email`); continue; }
      const source = (validSources.includes(obj.source as LeadSource) ? obj.source : "Website") as LeadSource;
      const status = (validStatuses.includes(obj.status as LeadStatus) ? obj.status : "new") as LeadStatus;
      rows.push({
        name: obj.name,
        email: obj.email,
        phone: obj.phone || "—",
        source,
        status,
        budget: Number(obj.budget) || 0,
        city: obj.city || "—",
        agent: obj.agent || "Taylor Lambert",
      });
    }
    setParsed({ rows, errors });
    setStep(2);
  }

  function commit() {
    if (!parsed) return;
    const count = importLeads(parsed.rows);
    toast.success(`Imported ${count} leads`);
    setStep(3);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Import leads"
        description="Bring leads from another CRM via CSV"
      />

      <div className="flex items-center gap-2 text-sm">
        {[1, 2, 3].map((n, i) => (
          <div key={n} className="flex items-center gap-2">
            <div className={`size-7 rounded-full flex items-center justify-center font-semibold text-xs ${step >= n ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
              {step > n ? <CheckCircle2 className="size-4" /> : n}
            </div>
            <span className={step >= n ? "font-medium" : "text-muted-foreground"}>
              {n === 1 ? "Paste CSV" : n === 2 ? "Preview" : "Done"}
            </span>
            {i < 2 && <span className="w-8 h-px bg-border mx-1" />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Paste or upload CSV</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-border bg-secondary/40 p-3 text-xs text-muted-foreground">
              <strong>Required columns:</strong> name, email · <strong>Optional:</strong> phone, source, status, budget, city, agent
            </div>
            <Textarea
              rows={12}
              className="font-mono text-xs"
              placeholder="name,email,phone,source,status,budget,city,agent"
              value={csv}
              onChange={(e) => setCsv(e.target.value)}
            />
            <div className="flex justify-between">
              <Button variant="outline" size="sm" onClick={() => setCsv(sample)}>
                <FileText className="size-4" /> Use sample data
              </Button>
              <Button onClick={parse} disabled={!csv.trim()}>
                <Upload className="size-4" /> Parse CSV
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && parsed && (
        <Card>
          <CardHeader>
            <CardTitle>Preview — {parsed.rows.length} valid rows</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {parsed.errors.length > 0 && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm space-y-1">
                <div className="font-semibold text-destructive">{parsed.errors.length} rows skipped</div>
                <ul className="text-xs text-destructive/80 list-disc pl-5">
                  {parsed.errors.slice(0, 5).map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              </div>
            )}
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-secondary/50">
                  <tr>
                    <th className="text-left p-2 text-xs font-semibold uppercase text-muted-foreground">Name</th>
                    <th className="text-left p-2 text-xs font-semibold uppercase text-muted-foreground">Email</th>
                    <th className="text-left p-2 text-xs font-semibold uppercase text-muted-foreground">Source</th>
                    <th className="text-left p-2 text-xs font-semibold uppercase text-muted-foreground">Status</th>
                    <th className="text-left p-2 text-xs font-semibold uppercase text-muted-foreground">Budget</th>
                    <th className="text-left p-2 text-xs font-semibold uppercase text-muted-foreground">City</th>
                  </tr>
                </thead>
                <tbody>
                  {parsed.rows.slice(0, 8).map((r, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="p-2 font-medium">{r.name}</td>
                      <td className="p-2 text-muted-foreground">{r.email}</td>
                      <td className="p-2"><Badge variant="outline">{r.source}</Badge></td>
                      <td className="p-2 capitalize">{r.status}</td>
                      <td className="p-2">${r.budget.toLocaleString()}</td>
                      <td className="p-2 text-muted-foreground">{r.city}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsed.rows.length > 8 && <div className="p-2 text-xs text-muted-foreground bg-secondary/30">+{parsed.rows.length - 8} more rows</div>}
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={commit} disabled={parsed.rows.length === 0}>
                Import {parsed.rows.length} leads
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && parsed && (
        <Card>
          <CardContent className="p-12 text-center space-y-4">
            <div className="size-14 rounded-full bg-success/15 text-success flex items-center justify-center mx-auto">
              <CheckCircle2 className="size-7" />
            </div>
            <h2 className="text-xl font-semibold">{parsed.rows.length} leads imported successfully</h2>
            <p className="text-sm text-muted-foreground">All leads are now available in your workspace.</p>
            <div className="flex justify-center gap-2 pt-2">
              <Button variant="outline" onClick={() => { setStep(1); setCsv(""); setParsed(null); }}>Import more</Button>
              <Button onClick={() => router.push("/leads")}>View leads</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
