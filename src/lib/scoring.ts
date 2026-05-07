import type { Lead } from "@/lib/store";

export function leadScore(lead: Lead): { score: number; label: "Cold" | "Warm" | "Hot" | "Burning"; rationale: string[] } {
  let score = 0;
  const rationale: string[] = [];

  const sourceScore: Record<string, number> = {
    Referral: 25, Zillow: 22, Website: 18, "Walk-in": 15, Facebook: 12, Instagram: 10,
  };
  const ss = sourceScore[lead.source] ?? 10;
  score += ss;
  rationale.push(`${lead.source} source +${ss}`);

  const statusScore: Record<string, number> = { qualified: 30, contacted: 20, new: 12, won: 35, lost: 0 };
  const stat = statusScore[lead.status] ?? 0;
  if (stat > 0) {
    score += stat;
    rationale.push(`Status: ${lead.status} +${stat}`);
  }

  if (lead.budget >= 1_500_000) { score += 25; rationale.push("Budget ≥ $1.5M +25"); }
  else if (lead.budget >= 800_000) { score += 18; rationale.push("Budget ≥ $800k +18"); }
  else if (lead.budget >= 400_000) { score += 12; rationale.push("Budget ≥ $400k +12"); }
  else if (lead.budget > 0) { score += 5; rationale.push("Budget set +5"); }

  const created = typeof lead.createdAt === "string" || typeof lead.createdAt === "number"
    ? new Date(lead.createdAt).getTime()
    : lead.createdAt.getTime();
  const daysOld = (Date.now() - created) / (1000 * 60 * 60 * 24);
  if (daysOld < 2) { score += 15; rationale.push("Created < 2d ago +15"); }
  else if (daysOld < 7) { score += 10; rationale.push("Created < 7d ago +10"); }
  else if (daysOld < 30) { score += 5; rationale.push("Created < 30d ago +5"); }

  score = Math.min(100, score);

  let label: "Cold" | "Warm" | "Hot" | "Burning" = "Cold";
  if (score >= 80) label = "Burning";
  else if (score >= 60) label = "Hot";
  else if (score >= 40) label = "Warm";

  return { score, label, rationale };
}

export function scoreColor(label: ReturnType<typeof leadScore>["label"]) {
  switch (label) {
    case "Burning": return "bg-destructive/15 text-destructive";
    case "Hot": return "bg-warning/20 text-warning-foreground";
    case "Warm": return "bg-primary/15 text-primary";
    default: return "bg-muted text-muted-foreground";
  }
}

export function matchListings<T extends { price: number; city: string }>(
  lead: { budget: number; city: string | null },
  listings: T[],
  topN = 4
): T[] {
  const leadCity = (lead.city ?? "").toLowerCase();
  const scored = listings.map((l) => {
    let s = 0;
    if (l.city.toLowerCase() === leadCity) s += 50;
    const ratio = l.price / Math.max(lead.budget, 1);
    if (ratio >= 0.85 && ratio <= 1.1) s += 50;
    else if (ratio >= 0.7 && ratio <= 1.25) s += 30;
    else if (ratio >= 0.5 && ratio <= 1.5) s += 10;
    return { l, s };
  });
  return scored.sort((a, b) => b.s - a.s).slice(0, topN).map((x) => x.l);
}
