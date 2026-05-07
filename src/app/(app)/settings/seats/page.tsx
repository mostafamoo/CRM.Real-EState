import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { initials } from "@/lib/utils";
import { Users } from "lucide-react";

const seats = [
  { name: "Taylor Lambert", role: "Owner", seat: "Pro", status: "Active" },
  { name: "Marcus Reed", role: "Admin", seat: "Pro", status: "Active" },
  { name: "Diana Powell", role: "Agent", seat: "Pro", status: "Active" },
  { name: "Naomi Lee", role: "Agent", seat: "Standard", status: "Active" },
  { name: "Kenji Watanabe", role: "Agent", seat: "Standard", status: "Pending" },
];

export default function SeatsPage() {
  const used = seats.length;
  const total = 10;
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Seats overview</CardTitle>
          <CardDescription>You're using {used} of {total} seats on the Pro plan.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full bg-primary rounded-full"
              style={{ width: `${(used / total) * 100}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Users className="size-4" />
              {used} active
            </span>
            <Button size="sm">Add seats</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Assigned seats</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y divide-border">
            {seats.map((s) => (
              <li key={s.name} className="flex items-center gap-3 p-4">
                <Avatar className="size-9">
                  <AvatarFallback>{initials(s.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{s.name}</div>
                  <div className="text-xs text-muted-foreground">{s.role}</div>
                </div>
                <Badge variant="outline">{s.seat}</Badge>
                <Badge variant={s.status === "Active" ? "success" : "warning"}>{s.status}</Badge>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
