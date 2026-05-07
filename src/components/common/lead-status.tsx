import { Badge } from "@/components/ui/badge";

const map: Record<string, { label: string; variant: "default" | "secondary" | "success" | "warning" | "destructive" | "muted" | "outline" }> = {
  new: { label: "New", variant: "default" },
  contacted: { label: "Contacted", variant: "secondary" },
  qualified: { label: "Qualified", variant: "warning" },
  won: { label: "Won", variant: "success" },
  lost: { label: "Lost", variant: "destructive" },
};

export function LeadStatusBadge({ status }: { status: string }) {
  const m = map[status] ?? { label: status, variant: "muted" as const };
  return <Badge variant={m.variant}>{m.label}</Badge>;
}
