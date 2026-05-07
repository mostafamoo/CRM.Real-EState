import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { initials } from "@/lib/utils";
import { Eye, Heart, Phone, Mail, MessageSquare } from "lucide-react";

const interactions = [
  { id: 1, lead: "Hannah Carlton", action: "Viewed listing", target: "318 Spruce Ln", icon: Eye, time: "2m ago", type: "view" },
  { id: 2, lead: "Aiden Park", action: "Submitted form", target: "Buyer interest", icon: Mail, time: "12m ago", type: "form" },
  { id: 3, lead: "Sofia Marín", action: "Saved listing", target: "201 River Pl", icon: Heart, time: "28m ago", type: "save" },
  { id: 4, lead: "Priya Natarajan", action: "Called you", target: "5m 22s call", icon: Phone, time: "1h ago", type: "call" },
  { id: 5, lead: "Ethan Brooks", action: "Replied to SMS", target: "Tour confirmation", icon: MessageSquare, time: "3h ago", type: "sms" },
  { id: 6, lead: "Yuki Tanaka", action: "Viewed listing", target: "12 Park Ave", icon: Eye, time: "4h ago", type: "view" },
];

const typeColor = {
  view: "bg-primary/10 text-primary",
  form: "bg-success/15 text-success",
  save: "bg-accent text-accent-foreground",
  call: "bg-warning/20 text-warning-foreground",
  sms: "bg-[var(--color-chart-4)]/15 text-[var(--color-chart-4)]",
} as const;

export default function InteractionsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Interactions"
        description="Real-time activity from leads on your microsite and listings"
      />

      <Card>
        <CardContent className="p-0">
          <ul className="divide-y divide-border">
            {interactions.map((i) => {
              const Icon = i.icon;
              return (
                <li key={i.id} className="flex items-center gap-4 p-4 hover:bg-secondary/40 transition-colors">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{initials(i.lead)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm">
                      <span className="font-medium">{i.lead}</span>{" "}
                      <span className="text-muted-foreground">{i.action.toLowerCase()}</span>{" "}
                      <span className="font-medium">{i.target}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">{i.time}</div>
                  </div>
                  <div className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs ${typeColor[i.type as keyof typeof typeColor]}`}>
                    <Icon className="size-3.5" />
                    {i.action}
                  </div>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
